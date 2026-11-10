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
import { unwrapWebhook } from '@whop/sdk/helpers';
import {
  estimateFormSchema,
  depositConfirmSchema,
  adminInvoiceSchema,
} from '../../lib/schemas.js';
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

/**
 * Sliding window rate limiting map.
 * NOTE ON STATELESS CLOUD RUN / SERVERLESS HOSTING:
 * In a multi-replica serverless deployment, in-memory maps are scoped to each
 * container instance. This provides protective local burst mitigation. For
 * distributed enterprise rate limiting, a shared Redis instance or cloud edge WAF
 * is recommended.
 */
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

apiRouter.post('/estimate', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown_ip';

  // Honeypot check: reject bots immediately with silent 200
  if (req.body.hp_field && req.body.hp_field.length > 0) {
    console.warn(`[Whop Estimate] Honeypot triggered from ${clientIp}`);
    return res.status(200).json({ ok: true, leadId: 'lead_ignored', ignored: true });
  }

  // Rate limit
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      ok: false,
      message: 'Too many estimate submissions. Please wait a few minutes before trying again or call our dispatch desk.',
    });
  }

  const parseResult = estimateFormSchema.safeParse(req.body);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    (parseResult.error as any).issues.forEach((issue: any) => {
      const field = issue.path.join('.') || 'general';
      fieldErrors[field] = issue.message;
    });

    return res.status(400).json({
      ok: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: fieldErrors,
    });
  }

  try {
    const lead = await createWhopLead(parseResult.data as any);
    return res.status(200).json({
      ok: true,
      success: true,
      leadId: lead.id,
      createdAt: lead.createdAt,
      isMock: lead.isMock,
      message: 'Your roofing estimate request has been logged directly with Whop CRM.',
    });
  } catch (err: any) {
    console.error('[Whop Estimate Error]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to submit estimate lead to Whop',
    });
  }
});

// ---------------------------------------------------------------------------
// 2. POST /api/deposit/confirm -> Whop Payments API
// ---------------------------------------------------------------------------

apiRouter.post('/deposit/confirm', async (req: Request, res: Response) => {
  const parseResult = depositConfirmSchema.safeParse(req.body);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    (parseResult.error as any).issues.forEach((issue: any) => {
      const field = issue.path.join('.') || 'general';
      fieldErrors[field] = issue.message;
    });

    return res.status(400).json({
      ok: false,
      message: 'Invalid deposit confirmation payload',
      errors: fieldErrors,
    });
  }

  try {
    const result = await confirmDepositPayment(parseResult.data);
    return res.status(result.success ? 200 : 400).json({
      ok: result.success,
      ...result,
    });
  } catch (err: any) {
    console.error('[Whop Deposit Confirm Error]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal error confirming deposit payment',
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
    return res.status(200).json({ ok: true, ...tokenData });
  } catch (err: any) {
    console.error('[Whop Token Error]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to mint Whop access token',
    });
  }
});

// ---------------------------------------------------------------------------
// 4. POST /api/admin/invoice -> Invoices API (Draft -> Issue / Send)
// ---------------------------------------------------------------------------

apiRouter.post('/admin/invoice', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized: Invalid or missing X-Admin-Token header.',
    });
  }

  const parseResult = adminInvoiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    (parseResult.error as any).issues.forEach((issue: any) => {
      const field = issue.path.join('.') || 'general';
      fieldErrors[field] = issue.message;
    });

    return res.status(400).json({
      ok: false,
      message: 'Validation failed for invoice request',
      errors: fieldErrors,
    });
  }

  try {
    const result = await processFinalBalanceInvoice(parseResult.data as any);
    return res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    console.error('[Whop Invoice Error]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to process invoice with Whop Invoices API',
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
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';
  const apiKey = getWhopApiKey();

  if (!apiKey || accountId.includes('REPLACE_ME')) {
    return res.json({
      ok: true,
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
    return res.json({ ok: true, leads: leadsPage?.data || [], isMock: false });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. GET /api/admin/invoices -> Admin helper to inspect recent Whop invoices
// ---------------------------------------------------------------------------

apiRouter.get('/admin/invoices', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';
  const apiKey = getWhopApiKey();

  if (!apiKey || accountId.includes('REPLACE_ME')) {
    return res.json({
      ok: true,
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
    return res.json({ ok: true, invoices: invoicesPage?.data || [], isMock: false });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 7. GET /api/admin/payment-methods -> Query saved cards for member
// ---------------------------------------------------------------------------

apiRouter.get('/admin/payment-methods', async (req: Request, res: Response) => {
  const adminHeader = (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, '') as string);

  if (!verifyAdminToken(adminHeader)) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  const email = req.query.email as string;
  const accountId = (req.query.accountId as string) || 'biz_REPLACE_ME';

  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email query parameter is required' });
  }

  try {
    const result = await getMemberSavedPaymentMethods(accountId, email);
    return res.json({ ok: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 8. POST /api/webhooks/whop -> Webhook verification with unwrapWebhook
// ---------------------------------------------------------------------------

apiRouter.post('/webhooks/whop', async (req: Request, res: Response) => {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (!webhookSecret || webhookSecret === 'whop_whsec_xxxxxxxxxxxxxxxxxxxxxxxx') {
    console.warn('[Whop Webhook] WHOP_WEBHOOK_SECRET not configured. Logging payload in dev mode.');
    return res.status(200).json({ ok: true, received: true, note: 'unverified_dev_mode' });
  }

  try {
    const event = unwrapWebhook(rawBody, {
      headers: req.headers as Record<string, string>,
      key: webhookSecret,
    });

    const action = (event as any).action || (event as any).type;
    console.info(`[Whop Webhook Verified] Event action: ${action}`);

    // Idempotent handler for Whop events
    switch (action) {
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
        // Always acknowledge unhandled event types with 200 so Whop doesn't retry endlessly
        console.log('[Whop Webhook] Handled unhandled event type gracefully:', action);
        break;
    }

    return res.status(200).json({ ok: true, received: true });
  } catch (err: any) {
    console.error('[Whop Webhook Error] Verification failed:', err.message);
    return res.status(400).json({ ok: false, error: 'Webhook signature verification failed' });
  }
});
