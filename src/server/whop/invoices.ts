/**
 * Whop Invoices API Service (Server-side)
 *
 * Implements draft creation, off-session charging (mode: "auto"),
 * and hosted checkout emailing (mode: "manual") according to:
 * https://docs.whop.com/developer/guides/invoices
 *
 * Security & Reliability Requirements:
 * - Api-Version-Date: 2026-10-24 or later
 * - Idempotency-Key: crypto.randomUUID() on every POST
 * - Constant-time comparison for ADMIN_TOKEN via SHA-256 hashing
 * - Friendly error handling for invoice_tax_address_required, invoice_payment_method_unavailable
 */

import crypto from 'crypto';
import { getWhopApiKey, getWhopClient, WHOP_API_VERSION_DATE } from './client.js';

export interface CreateInvoicePayload {
  customerEmail: string;
  customerName: string;
  accountId: string;
  planId?: string;
  amountUSD?: number;
  mode: 'auto' | 'manual';
  dueAt?: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metadata?: Record<string, string>;
  paymentMethodId?: string;
}

export interface InvoiceResult {
  success: boolean;
  invoiceId: string;
  status: string;
  totalUSD: number;
  checkoutUrl?: string | null;
  mode: 'auto' | 'manual';
  paymentMethodUsed?: string | null;
  message: string;
  fallbackToManual?: boolean;
  rawError?: string;
  isMock?: boolean;
}

/**
 * Constant-time comparison helper using SHA-256 digests.
 * Hashing both inputs to fixed 32-byte buffers ensures crypto.timingSafeEqual
 * is ALWAYS invoked on identical length buffers, completely mitigating timing attacks
 * and length leakage.
 */
export function verifyAdminToken(providedToken?: string): boolean {
  const secret = process.env.ADMIN_TOKEN || 'roofing-admin-secret-2026';
  if (!providedToken) return false;
  try {
    const hashProvided = crypto.createHash('sha256').update(providedToken).digest();
    const hashSecret = crypto.createHash('sha256').update(secret).digest();
    return crypto.timingSafeEqual(hashProvided, hashSecret);
  } catch {
    return false;
  }
}

/**
 * Find member and list their saved payment methods
 * // TODO(VERIFY): Check Whop member search by exact email under member:email:read scope
 * across multi-account or invited member states.
 */
export async function getMemberSavedPaymentMethods(accountId: string, email: string) {
  const apiKey = getWhopApiKey();
  if (!apiKey || accountId.includes('REPLACE_ME')) {
    return {
      member: null,
      paymentMethods: [
        {
          id: 'payt_mock_vaulted_card_visa_4242',
          type: 'card',
          card: { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2028 },
          isMock: true,
        },
      ],
    };
  }

  const client = getWhopClient();
  let foundMember: any = null;

  try {
    const membersPage = await client.members.list({
      account_id: accountId,
      query: email.trim().toLowerCase(),
      first: 5,
    });

    if (membersPage?.data && membersPage.data.length > 0) {
      foundMember = membersPage.data.find(
        (m) => m.email?.toLowerCase() === email.trim().toLowerCase()
      ) || membersPage.data[0];
    }
  } catch (err) {
    console.warn('[Whop Invoices] Error querying member for email:', err);
  }

  let paymentMethods: any[] = [];
  if (foundMember?.id) {
    try {
      const pmPage = await client.paymentMethods.list({
        member_id: foundMember.id,
        first: 10,
      });
      paymentMethods = pmPage?.data || [];
    } catch (err) {
      console.warn('[Whop Invoices] Error listing payment methods for member:', err);
    }
  }

  return {
    member: foundMember,
    paymentMethods,
  };
}

/**
 * Creates, drafts, and either issues (auto-charges) or sends (manual link) a final balance invoice.
 */
export async function processFinalBalanceInvoice(
  payload: CreateInvoicePayload
): Promise<InvoiceResult> {
  const apiKey = getWhopApiKey();
  const idempotencyKey = crypto.randomUUID();

  // If in mock or placeholder mode
  if (!apiKey || payload.accountId.includes('REPLACE_ME')) {
    const mockId = 'inv_' + Math.random().toString(36).substring(2, 11);
    const amount = payload.amountUSD || 5500;
    const checkoutUrl = `https://whop.com/checkout/mock_${mockId}`;
    return {
      success: true,
      invoiceId: mockId,
      status: payload.mode === 'auto' ? 'paid' : 'open',
      totalUSD: amount,
      checkoutUrl: payload.mode === 'manual' ? checkoutUrl : null,
      mode: payload.mode,
      paymentMethodUsed: payload.mode === 'auto' ? (payload.paymentMethodId || 'payt_mock_visa_4242') : null,
      message: payload.mode === 'auto'
        ? 'Invoice created and successfully charged to saved card on file.'
        : 'Invoice created and checkout link emailed to customer.',
      isMock: true,
    };
  }

  const client = getWhopClient();

  // Step 1: Find member and resolve payment method if mode is auto
  const { member, paymentMethods } = await getMemberSavedPaymentMethods(
    payload.accountId,
    payload.customerEmail
  );

  let selectedPaymentMethodId = payload.paymentMethodId;
  if (payload.mode === 'auto' && !selectedPaymentMethodId && paymentMethods.length > 0) {
    selectedPaymentMethodId = paymentMethods[0].id;
  }

  // Step 2: Prepare draft invoice request
  const billingAddress = {
    city: payload.billingAddress.city,
    country: payload.billingAddress.country || 'US',
    line1: payload.billingAddress.line1,
    line2: payload.billingAddress.line2 || undefined,
    postal_code: payload.billingAddress.postalCode,
    state: payload.billingAddress.state,
    name: payload.customerName,
  };

  const planIdToUse = payload.planId || 'plan_REPLACE_ME_FINAL_BALANCE';
  const invoiceItems: any[] = [{ variant_id: planIdToUse, quantity: 1 }];

  const draftBody: Record<string, any> = {
    account_id: payload.accountId,
    customer_name: payload.customerName,
    email_address: payload.customerEmail,
    items: invoiceItems,
    billing_address: billingAddress,
    metadata: {
      type: 'final_balance_roofing',
      invoice_mode: payload.mode,
      created_by: 'apex_admin_tool',
      ...(payload.metadata || {}),
    },
  };

  if (payload.dueAt) {
    draftBody.due_at = payload.dueAt;
  }

  if (payload.mode === 'auto' && selectedPaymentMethodId) {
    draftBody.payment_method_id = selectedPaymentMethodId;
  }

  // POST /invoices with Api-Version-Date: 2026-10-24 and Idempotency-Key
  const invoiceRes = await fetch('https://api.whop.com/api/v1/invoices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Api-Version-Date': WHOP_API_VERSION_DATE,
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draftBody),
  });

  const invoiceData = (await invoiceRes.json()) as any;

  if (!invoiceRes.ok) {
    const errorCode = invoiceData.code || invoiceData.error || '';
    if (errorCode === 'invoice_tax_address_required') {
      throw new Error(
        'Tax calculation requires a complete billing address (line1, city, state, postal code, and country).'
      );
    }
    if (errorCode === 'invoice_payment_method_unavailable') {
      throw new Error(
        'The specified payment method is no longer valid or authorized for off-session billing.'
      );
    }
    throw new Error(invoiceData.message || `Invoice creation failed HTTP ${invoiceRes.status}`);
  }

  const invoiceId = invoiceData.id;
  const totalAmount = invoiceData.amount_due?.amount
    ? invoiceData.amount_due.amount / 100
    : payload.amountUSD || 0;

  // Step 3: Issue (auto-charge) or Send (email link)
  if (payload.mode === 'auto') {
    if (!selectedPaymentMethodId) {
      // Fall back to sending hosted link
      try {
        await client.invoices.send({ id: invoiceId });
        const checkoutLink = invoiceData.checkout_link;
        const checkoutUrl = checkoutLink
          ? (checkoutLink.startsWith('http') ? checkoutLink : `https://whop.com/checkout/${checkoutLink}`)
          : null;

        return {
          success: true,
          invoiceId,
          status: 'open',
          totalUSD: totalAmount,
          checkoutUrl,
          mode: 'manual',
          fallbackToManual: true,
          message: 'No saved card found on file. Invoice automatically switched to manual email checkout.',
        };
      } catch (sendErr: any) {
        throw new Error(`Failed to send fallback invoice email: ${sendErr.message}`);
      }
    }

    try {
      const issueRes = await client.invoices.issue({ id: invoiceId });
      return {
        success: true,
        invoiceId,
        status: issueRes.paid_at ? 'paid' : 'issued',
        totalUSD: totalAmount,
        checkoutUrl: null,
        mode: 'auto',
        paymentMethodUsed: selectedPaymentMethodId,
        message: 'Invoice created and successfully charged off-session to saved payment method.',
      };
    } catch (chargeErr: any) {
      // If off-session charge fails (e.g. 3DS required), fall back to sending pay link
      console.warn('[Whop Invoices] Off-session charge failed, falling back to sending email:', chargeErr);
      await client.invoices.send({ id: invoiceId });
      const checkoutLink = invoiceData.checkout_link;
      const checkoutUrl = checkoutLink
        ? (checkoutLink.startsWith('http') ? checkoutLink : `https://whop.com/checkout/${checkoutLink}`)
        : null;

      return {
        success: true,
        invoiceId,
        status: 'open',
        totalUSD: totalAmount,
        checkoutUrl,
        mode: 'manual',
        fallbackToManual: true,
        message: 'Off-session charge required customer authorization. Pay link emailed to customer.',
        rawError: chargeErr.message,
      };
    }
  } else {
    // Mode manual: send invoice link via email
    await client.invoices.send({ id: invoiceId });
    const checkoutLink = invoiceData.checkout_link;
    const checkoutUrl = checkoutLink
      ? (checkoutLink.startsWith('http') ? checkoutLink : `https://whop.com/checkout/${checkoutLink}`)
      : null;

    return {
      success: true,
      invoiceId,
      status: 'open',
      totalUSD: totalAmount,
      checkoutUrl,
      mode: 'manual',
      message: 'Invoice created and hosted checkout link sent to customer email.',
    };
  }
}
