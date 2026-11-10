/**
 * Express API Router for Whop Integration
 *
 * Implements endpoints:
 * - POST /api/estimate (Zod validation, rate limit, honeypot -> Whop Leads)
 * - POST /api/deposit/confirm (Whop Payments API confirmation token processing)
 * - POST /api/whop-token (Short-lived scoped access token minting)
 * - POST /api/admin/invoice (Admin final balance invoicing with auto/manual modes)
 * - GET  /api/admin/leads (Recent leads listing)
 * - GET  /api/admin/invoices (Recent invoices listing)
 * - GET  /api/admin/payment-methods (List customer's saved payment methods)
 * - POST /api/webhooks/whop (Signed webhook receiver with unwrapWebhook)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { unwrapWebhook } from '@whop/sdk/helpers';
import { createWhopLead } from '../whop/leads.js';
import { confirmDepositPayment } from '../whop/payments.js';
import {
  processFinalBalanceInvoice,
  verifyAdminToken,
  getMemberSavedPaymentMethods,
} from '../whop/invoices.js';
import { mintScopedAccessToken } from '../whop/tokens.js';
import { getWhopClient, getWhopApiKey } from '../whop/client.js';

export const apiRouter = Router();

// In-memory rate limiting map for estimate submissions (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= maxRequests) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// ---------------------------------------------------------------------------
// 1. POST /api/estimate -> Create Lead via Whop Leads API
// ---------------------------------------------------------------------------

const estimateSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().min(7, 'Please provide a valid contact phone number'),
  address: z.object({
    street: z.string().trim().min(3, 'Street address is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    zip: z.string().trim().min(4, 'Valid ZIP code is required'),
  }),
  service: z.string().min(1, 'Please select a service'),
  roofAge: z.string().min(1, 'Please select approximate roof age'),
  message: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to be contacted regarding this estimate',
  }),
  accountId: z.string().default('biz_REPLACE_ME'),
  productId: z.string().optional(),
  referrer: z.string().optional(),
  utmParams: z.record(z.string(), z.string()).optional(),
  authenticatedUserId: z.string().optional(),
  // Honeypot field
  hp_field: z.string().max(0, 'Spam detected').optional(),
});

apiRouter.post('/estimate', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown_ip';

  // Honeypot check
  if (req.body.hp_field && req.body.hp_field.length > 0) {
    console.warn(`[Whop Estimate] Honeypot triggered from ${clientIp}`);
    return res.status(200).json({ success: true, leadId: 'lead_ignored', ignored: true });
  }

  // Rate limit
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many estimate submissions. Please wait a few minutes before trying again or call our dispatch desk.',
    });
  }

  const parseResult = estimateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: (parseResult.error as any).issues.map((e: any) => e.message).join(', '),
      details: parseResult.error.flatten(),
    });
  }

  try {
    const lead = await createWhopLead(parseResult.data as any);
    return res.status(200).json({
      success: true,
      leadId: lead.id,
      createdAt: lead.createdAt,
      isMock: lead.isMock,
      message: 'Your roofing estimate request has been logged directly with Whop CRM.',
    });
  } catch (err: any) {
    console.error('[Whop Estimate Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to submit estimate lead to Whop',
    });
  }
});

// ---------------------------------------------------------------------------
// 2. POST /api/deposit/confirm -> Whop Payments API
// ---------------------------------------------------------------------------

const depositConfirmSchema = z.object({
  confirmationToken: z.string().min(1, 'confirmationToken is required'),
  accountId: z.string().min(1, 'accountId is required'),
  variantId: z.string().min(1, 'variantId (planId) is required'),
  returnUrl: z.string().url('returnUrl must be a valid absolute URL'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
});

apiRouter.post('/deposit/confirm', async (req: Request, res: Response) => {
  const parseResult = depositConfirmSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: (parseResult.error as any).issues.map((e: any) => e.message).join(', '),
    });
  }

  try {
    const result = await confirmDepositPayment(parseResult.data);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('[Whop Deposit Confirm Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal error confirming deposit payment',
    });
  }
});

// ---------------------------------------------------------------------------
// 3. POST /api/whop-token -> Mints short-lived scoped access token
// ---------------------------------------------------------------------------

apiRouter.post('/whop-token', async (req: Request, res: Response) => {
  const accountId = req.body.accountId || process.env.VITE_WHOP_ACCOUNT_ID || 'biz_REPLACE_ME';
  const scopedActions = req.body.scopedActions || ['payment:charge', 'payment:basic:read'];

  try {
    const tokenData = await mintScopedAccessToken({
      accountId,
      scopedActions,
      expiresInSeconds: 3600,
    });
    return res.status(200).json(tokenData);
  } catch (err: any) {
    console.error('[Whop Token Error]', err);
    return res.status(500).json({
      error: err.message || 'Failed to mint Whop access token',
    });
  }
});

// ---------------------------------------------------------------------------
// 4. POST /api/admin/invoice -> Invoices API (Draft -> Issue / Send)
// ---------------------------------------------------------------------------

const invoiceSchema = z.object({
  customerEmail: z.string().email('Valid customer email required'),
  customerName: z.string().min(2, 'Customer name required'),
  accountId: z.string().min(1, 'accountId required'),
  planId: z.string().optional(),
  amountUSD: z.number().positive().optional(),
  mode: z.enum(['auto', 'manual']),
  dueAt: z.string().optional(),
  paymentMethodId: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(1, 'Street line1 required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    postalCode: z.string().min(1, 'Postal code required'),
    country: z.string().default('US'),
  }),
  metadata: z.record(z.string(), z.string()).optional(),
});

apiRouter.post('/admin/invoice', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing X-Admin-Token header.',
    });
  }

  const parseResult = invoiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: (parseResult.error as any).issues.map((e: any) => e.message).join(', '),
      details: parseResult.error.flatten(),
    });
  }

  try {
    const result = await processFinalBalanceInvoice(parseResult.data as any);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Whop Invoice Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process invoice with Whop Invoices API',
    });
  }
});

// ---------------------------------------------------------------------------
// 5. GET /api/admin/leads -> Admin helper to inspect recent Whop leads
// ---------------------------------------------------------------------------

apiRouter.get('/admin/leads', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';
  const apiKey = getWhopApiKey();

  if (!apiKey || accountId.includes('REPLACE_ME')) {
    // Return sample lead records for demo
    return res.json({
      leads: [
        {
          id: 'lead_demo_01',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          metadata: {
            customer_name: 'Robert Miller',
            customer_email: 'rmiller@example.com',
            customer_phone: '(404) 555-0199',
            property_street: '3812 Peachtree Dunwoody Rd',
            property_city: 'Atlanta',
            property_state: 'GA',
            property_zip: '30342',
            service_requested: 'complete-replacement',
            roof_age_years: '16-20 years',
          },
        },
        {
          id: 'lead_demo_02',
          created_at: new Date(Date.now() - 12000000).toISOString(),
          metadata: {
            customer_name: 'Sarah Thompson',
            customer_email: 'sthompson@example.com',
            customer_phone: '(770) 555-8831',
            property_street: '510 Windward Pkwy',
            property_city: 'Alpharetta',
            property_state: 'GA',
            property_zip: '30005',
            service_requested: 'storm-damage-inspection',
            roof_age_years: '6-10 years',
          },
        },
      ],
      isMock: true,
    });
  }

  try {
    const client = getWhopClient();
    const leadsPage = await client.leads.list({
      account_id: accountId,
      first: 15,
    });
    return res.json({ leads: leadsPage?.data || [], isMock: false });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. GET /api/admin/invoices -> Admin helper to inspect recent Whop invoices
// ---------------------------------------------------------------------------

apiRouter.get('/admin/invoices', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';
  const apiKey = getWhopApiKey();

  if (!apiKey || accountId.includes('REPLACE_ME')) {
    return res.json({
      invoices: [
        {
          id: 'inv_demo_01',
          number: 'INV-1004',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          customer_name: 'Elena Rostova',
          email_address: 'elena.rostova@example.com',
          amount_due: { amount: 50000, currency: 'usd' },
          status: 'paid',
        },
        {
          id: 'inv_demo_02',
          number: 'INV-1005',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          customer_name: 'David Chen',
          email_address: 'dchen@example.com',
          amount_due: { amount: 620000, currency: 'usd' },
          status: 'open',
          checkout_link: 'https://whop.com/checkout/demo_link',
        },
      ],
      isMock: true,
    });
  }

  try {
    const client = getWhopClient();
    const invoicesPage = await client.invoices.list({
      account_id: accountId,
      first: 15,
    });
    return res.json({ invoices: invoicesPage?.data || [], isMock: false });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 7. GET /api/admin/payment-methods -> Query saved cards for member
// ---------------------------------------------------------------------------

apiRouter.get('/admin/payment-methods', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = req.query.email as string;
  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }

  try {
    const result = await getMemberSavedPaymentMethods(accountId, email);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 8. POST /api/webhooks/whop -> Webhook verification with unwrapWebhook
// ---------------------------------------------------------------------------

apiRouter.post('/webhooks/whop', async (req: Request, res: Response) => {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

  // Raw body string
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (!webhookSecret || webhookSecret === 'whop_whsec_xxxxxxxxxxxxxxxxxxxxxxxx') {
    console.warn('[Whop Webhook] WHOP_WEBHOOK_SECRET not configured. Logging payload in development mode.');
    console.log('[Whop Webhook Dev Event]', req.body?.action || req.body?.type || 'unknown_event');
    return res.status(200).json({ received: true, note: 'unverified_dev_mode' });
  }

  try {
    const event = unwrapWebhook(rawBody, {
      headers: req.headers as Record<string, string>,
      key: webhookSecret,
    });

    console.info(`[Whop Webhook Verified] Event action: ${(event as any).action || (event as any).type}`);

    // Idempotent handler for Whop events
    switch ((event as any).action) {
      case 'payment.succeeded':
        console.log('[Whop Webhook] Payment Succeeded:', (event as any).data?.id);
        break;
      case 'payment.failed':
        console.warn('[Whop Webhook] Payment Failed:', (event as any).data?.id, (event as any).data?.failure_reason);
        break;
      case 'setup_intent.succeeded':
        console.log('[Whop Webhook] Card Vaulted Successfully (SetupIntent):', (event as any).data?.id);
        break;
      default:
        console.log('[Whop Webhook] Unhandled event type:', (event as any).action);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Whop Webhook Error] Verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});
