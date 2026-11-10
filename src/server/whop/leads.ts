/**
 * Whop Leads Server Integration
 *
 * Handles creation of customer leads in Whop CRM via the Leads API:
 * POST https://api.whop.com/api/v1/leads
 *
 * KNOWN CONSTRAINT & ADAPTER STRATEGY:
 * The Whop Create Lead endpoint takes a `user_id?: string | null` and custom `metadata`.
 * It does not have top-level email or name fields.
 *
 * Strategy implemented in resolveLeadUser:
 * 1. Look up existing Whop members by email via `client.members.list({ account_id, query: email })`
 *    (requires `member:email:read` scope). If found, return `member.user.id`.
 * 2. If a Whop session/OAuth user is present (e.g. from Whop header or cookie), use that user's ID.
 * 3. Fallback: If no Whop user exists yet, pass `user_id: null` while persisting the full
 *    contact identity (name, email, phone, address, property details) in the lead's `metadata`.
 *    This ensures every lead is recorded in Whop without dropping any prospective customer data.
 */

import { getWhopApiKey, getWhopClient, WHOP_API_VERSION_DATE } from './client.js';

export interface EstimateLeadInput {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  service: string;
  roofAge: string;
  message?: string;
  consent: boolean;
  accountId: string;
  productId?: string;
  referrer?: string;
  utmParams?: Record<string, string>;
  authenticatedUserId?: string;
}

export interface LeadResolutionResult {
  userId: string | null;
  strategyUsed: 'existing_member' | 'authenticated_session' | 'prospective_metadata_only';
  memberId?: string;
}

/**
 * Adapter to resolve or associate a Whop user_id from prospective customer contact info.
 */
export async function resolveLeadUser(params: {
  email: string;
  name: string;
  accountId: string;
  authenticatedUserId?: string;
}): Promise<LeadResolutionResult> {
  // If the user is already authenticated via Whop sign-in, use their user ID directly
  if (params.authenticatedUserId && params.authenticatedUserId.startsWith('user_')) {
    return {
      userId: params.authenticatedUserId,
      strategyUsed: 'authenticated_session',
    };
  }

  const apiKey = getWhopApiKey();
  if (!apiKey) {
    return {
      userId: null,
      strategyUsed: 'prospective_metadata_only',
    };
  }

  try {
    const client = getWhopClient();
    // Search existing members by email (requires member:email:read)
    const membersPage = await client.members.list({
      account_id: params.accountId,
      query: params.email.trim().toLowerCase(),
      first: 5,
    });

    if (membersPage && membersPage.data && membersPage.data.length > 0) {
      for (const member of membersPage.data) {
        if (member.email?.toLowerCase() === params.email.trim().toLowerCase() && member.user?.id) {
          return {
            userId: member.user.id,
            strategyUsed: 'existing_member',
            memberId: member.id,
          };
        }
      }
    }
  } catch (err) {
    // Member lookup may fail if API key lacks member:email:read permission
    console.warn('[Whop Leads] resolveLeadUser member lookup failed, falling back to metadata:', err);
  }

  // Fallback: Lead API accepts null user_id; all contact details are attached to metadata
  return {
    userId: null,
    strategyUsed: 'prospective_metadata_only',
  };
}

export interface CreateLeadResponse {
  id: string;
  accountId: string;
  productId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  isMock?: boolean;
}

/**
 * Creates a Lead record in Whop via POST https://api.whop.com/api/v1/leads
 */
export async function createWhopLead(input: EstimateLeadInput): Promise<CreateLeadResponse> {
  const apiKey = getWhopApiKey();

  // Resolve user identifier
  const resolution = await resolveLeadUser({
    email: input.email,
    name: input.name,
    accountId: input.accountId,
    authenticatedUserId: input.authenticatedUserId,
  });

  const fullMetadata: Record<string, unknown> = {
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    property_street: input.address.street,
    property_city: input.address.city,
    property_state: input.address.state,
    property_zip: input.address.zip,
    service_requested: input.service,
    roof_age_years: input.roofAge,
    customer_notes: input.message || 'No additional notes provided',
    tcpa_consent: input.consent ? 'granted' : 'denied',
    submitted_at: new Date().toISOString(),
    resolution_strategy: resolution.strategyUsed,
    ...(input.utmParams || {}),
  };

  // If WHOP_API_KEY is not configured or in sandbox placeholder mode, return a simulated successful lead
  if (!apiKey || input.accountId.includes('REPLACE_ME')) {
    console.warn('[Whop Leads] WHOP_API_KEY or accountId is a placeholder. Emulating successful Whop Lead creation.');
    return {
      id: 'lead_' + Math.random().toString(36).substring(2, 14),
      accountId: input.accountId,
      productId: input.productId || null,
      userId: resolution.userId,
      metadata: fullMetadata,
      createdAt: new Date().toISOString(),
      isMock: true,
    };
  }

  // Call official Whop Leads API
  const response = await fetch('https://api.whop.com/api/v1/leads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Api-Version-Date': WHOP_API_VERSION_DATE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_id: input.accountId,
      product_id: input.productId && !input.productId.includes('REPLACE_ME') ? input.productId : null,
      referrer: input.referrer || 'https://apexroofingrestoration.com',
      user_id: resolution.userId,
      metadata: fullMetadata,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Whop Leads API returned HTTP ${response.status}: ${errorBody}`);
  }

  const result = (await response.json()) as any;
  return {
    id: result.id || 'lead_' + Math.random().toString(36).substring(2, 10),
    accountId: result.account_id || input.accountId,
    productId: result.product_id || null,
    userId: result.user_id || null,
    metadata: result.metadata || fullMetadata,
    createdAt: result.created_at || new Date().toISOString(),
  };
}
