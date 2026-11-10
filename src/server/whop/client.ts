/**
 * Whop Server Client
 *
 * The Whop API key is read ONLY on the server from process.env.WHOP_API_KEY.
 * Never import this file into browser code or expose this credential.
 */

import { WhopClient } from '@whop/sdk';

let cachedClient: WhopClient | null = null;

export function getWhopApiKey(): string {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey || apiKey === 'whop_api_key_xxxxxxxxxxxxxxxxxxxxxxxx') {
    return '';
  }
  return apiKey;
}

export function getWhopClient(): WhopClient {
  if (cachedClient) return cachedClient;

  const apiKey = getWhopApiKey();
  if (!apiKey) {
    throw new Error(
      'WHOP_API_KEY is not configured on the server. Set WHOP_API_KEY in your environment or Secrets panel.'
    );
  }

  cachedClient = new WhopClient({
    token: apiKey,
  });

  return cachedClient;
}

/**
 * Standard Whop API version header pinned across server endpoints
 */
export const WHOP_API_VERSION_DATE = '2026-10-24';
