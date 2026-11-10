import { describe, it, expect } from 'vitest';
import { verifyAdminToken } from '../src/server/whop/invoices.js';
import { adminInvoiceSchema } from '../src/lib/schemas.js';

describe('Admin Invoices & Token Verification', () => {
  it('verifies admin token in constant time with SHA-256 digests', () => {
    const expected = process.env.ADMIN_TOKEN || 'roofing-admin-secret-2026';

    expect(verifyAdminToken(expected)).toBe(true);
    expect(verifyAdminToken('wrong-token')).toBe(false);
    expect(verifyAdminToken('')).toBe(false);
    expect(verifyAdminToken(undefined)).toBe(false);
    // Length differences should not crash or leak
    expect(verifyAdminToken('a')).toBe(false);
    expect(verifyAdminToken('very-long-wrong-token-that-exceeds-the-length-of-the-secret')).toBe(false);
  });

  it('validates admin invoice payload structure', () => {
    const valid = adminInvoiceSchema.safeParse({
      customerEmail: 'customer@example.com',
      customerName: 'Marcus Vance',
      accountId: 'biz_123',
      amountUSD: 5200,
      mode: 'auto',
      billingAddress: {
        line1: '4200 North Highland Ave',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30306',
        country: 'US',
      },
    });
    expect(valid.success).toBe(true);
  });
});
