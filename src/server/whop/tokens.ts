/**
 * Whop Short-Lived Access Token Minting
 *
 * Mints temporary scoped access tokens via POST /access_tokens.
 * Used when a client-side Whop Element requires authentication or access to account data
 * without EVER leaking the master WHOP_API_KEY to the browser.
 */

import { getWhopApiKey, getWhopClient } from './client.js';

export interface MintTokenParams {
  accountId: string;
  scopedActions?: string[];
  userId?: string;
  expiresInSeconds?: number;
}

export interface MintTokenResponse {
  token: string;
  expiresAt: string;
  scopedActions: string[];
  isMock?: boolean;
}

/**
 * Mints a short-lived access token strictly limited to the required scopes.
 */
export async function mintScopedAccessToken(params: MintTokenParams): Promise<MintTokenResponse> {
  const apiKey = getWhopApiKey();

  // If running in development with placeholders or unconfigured keys
  if (!apiKey || params.accountId.includes('REPLACE_ME')) {
    const mockExpires = new Date(Date.now() + 3600 * 1000).toISOString();
    return {
      token: 'tok_mock_short_lived_' + Math.random().toString(36).substring(2, 16),
      expiresAt: mockExpires,
      scopedActions: params.scopedActions || ['payment:charge'],
      isMock: true,
    };
  }

  const client = getWhopClient();
  const defaultScopes = params.scopedActions && params.scopedActions.length > 0
    ? params.scopedActions
    : ['payment:charge', 'payment:basic:read'];

  const expiresDate = new Date(Date.now() + (params.expiresInSeconds || 3600) * 1000).toISOString();

  const tokenRecord = await client.accessTokens.create({
    account_id: params.accountId,
    scoped_actions: defaultScopes,
    user_id: params.userId || undefined,
    expires_at: expiresDate,
  });

  return {
    token: (tokenRecord as any).token || (tokenRecord as any).id,
    expiresAt: (tokenRecord as any).expires_at || expiresDate,
    scopedActions: defaultScopes,
  };
}
