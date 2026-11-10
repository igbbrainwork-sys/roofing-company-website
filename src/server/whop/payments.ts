/**
 * Whop Payments Integration
 *
 * Handles server-side confirmation for the Project Deposit with Card-on-File.
 * Flow:
 * 1. Client renders <Payments accountId plan={deposit.planId} setupFutureUsage="off_session">
 * 2. Client calls payments.createConfirmationToken()
 * 3. Client POSTs token to /api/deposit/confirm
 * 4. Server calls Whop Payments API with confirmation_token, account_id, variant_id, return_url
 * 5. If response requires action (e.g. 3D Secure), client calls whop.payments.handleNextAction({ clientSecret })
 */

import { getWhopApiKey, WHOP_API_VERSION_DATE } from './client.js';

export interface ConfirmDepositPaymentInput {
  confirmationToken: string;
  accountId: string;
  variantId: string;
  returnUrl: string;
  customerEmail?: string;
  customerName?: string;
}

export interface ConfirmDepositPaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  status: string;
  requiresAction: boolean;
  nextAction?: any;
  error?: string;
  isMock?: boolean;
}

/**
 * Confirms a deposit payment using the client-generated confirmation_token.
 */
export async function confirmDepositPayment(
  input: ConfirmDepositPaymentInput
): Promise<ConfirmDepositPaymentResult> {
  const apiKey = getWhopApiKey();

  // If in placeholder/development mode without real API key, simulate confirmation
  if (!apiKey || input.accountId.includes('REPLACE_ME') || input.variantId.includes('REPLACE_ME')) {
    console.warn('[Whop Payments] Running in development mode with placeholder credentials. Simulating deposit confirmation.');
    return {
      success: true,
      paymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
      status: 'succeeded',
      requiresAction: false,
      isMock: true,
    };
  }

  // TODO(VERIFY): Confirm whether ExpressCheckoutElement can be mounted under Payments for card-on-file deposit,
  // or if Express Checkout requires a separate Checkout handle. In current Whop Elements, ExpressCheckoutElement
  // operates with a Checkout instance; when card-on-file (setupFutureUsage="off_session") is required,
  // standard card vaulting via PaymentElement provides guaranteed off-session consent.
  try {
    const response = await fetch('https://api.whop.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Api-Version-Date': WHOP_API_VERSION_DATE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: input.accountId,
        confirmation_token: input.confirmationToken,
        variant_id: input.variantId,
        return_url: input.returnUrl,
      }),
    });

    const result = (await response.json()) as any;

    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        requiresAction: false,
        error: result.message || `Payment error HTTP ${response.status}`,
      };
    }

    const requiresAction = result.status === 'requires_action' || !!result.next_action;

    return {
      success: result.status === 'succeeded' || requiresAction,
      paymentId: result.id,
      clientSecret: result.client_secret || result.next_action?.client_secret,
      status: result.status || 'succeeded',
      requiresAction,
      nextAction: result.next_action,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      requiresAction: false,
      error: err.message || 'Network error confirming payment with Whop',
    };
  }
}
