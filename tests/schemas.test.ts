import { describe, it, expect } from 'vitest';
import {
  estimateFormSchema,
  normalizePhone,
  sanitizeHtml,
  depositConfirmSchema,
  adminInvoiceSchema,
} from '../src/lib/schemas.js';

describe('Shared Schemas & Sanitization', () => {
  it('normalizes 10-digit US phone numbers to E.164 (+1XXXXXXXXXX)', () => {
    expect(normalizePhone('(404) 555-0199')).toBe('+14045550199');
    expect(normalizePhone('404-555-0199')).toBe('+14045550199');
    expect(normalizePhone('4045550199')).toBe('+14045550199');
    expect(normalizePhone('1-800-555-7663')).toBe('+18005557663');
  });

  it('strips HTML tags from input fields', () => {
    expect(sanitizeHtml('<script>alert("hack")</script>John Doe')).toBe('alert("hack")John Doe');
    expect(sanitizeHtml('<b>Acme Roof</b>')).toBe('Acme Roof');
  });

  it('validates a correct Estimate Lead payload', () => {
    const validPayload = {
      name: 'Robert Vance',
      email: 'rvance@example.com',
      phone: '(404) 555-0199',
      address: {
        street: '4200 North Highland Ave',
        city: 'Atlanta',
        state: 'GA',
        zip: '30306',
      },
      service: 'complete-replacement',
      roofAge: '11-15 years',
      message: 'Visible storm damage on south slope',
      consent: true,
      accountId: 'biz_sample_123',
      formLoadTimestamp: Date.now() - 3000, // 3 seconds ago
    };

    const result = estimateFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('+14045550199');
      expect(result.data.address.state).toBe('GA');
    }
  });

  it('rejects bot submissions triggered under 2 seconds', () => {
    const fastBotPayload = {
      name: 'Fast Bot',
      email: 'bot@example.com',
      phone: '4045550199',
      address: {
        street: '123 Bot Way',
        city: 'Atlanta',
        state: 'GA',
        zip: '30306',
      },
      service: 'complete-replacement',
      roofAge: '0-5 years',
      consent: true,
      formLoadTimestamp: Date.now() - 500, // 500ms ago (too fast)
    };

    const result = estimateFormSchema.safeParse(fastBotPayload);
    expect(result.success).toBe(false);
  });

  it('rejects submissions with filled honeypot', () => {
    const spamPayload = {
      name: 'Spam Bot',
      email: 'bot@example.com',
      phone: '4045550199',
      address: {
        street: '123 Spam Way',
        city: 'Atlanta',
        state: 'GA',
        zip: '30306',
      },
      service: 'complete-replacement',
      roofAge: '0-5 years',
      consent: true,
      hp_field: 'I am a spam bot',
    };

    const result = estimateFormSchema.safeParse(spamPayload);
    expect(result.success).toBe(false);
  });

  it('rejects synthetic demo user IDs', () => {
    const demoUserPayload = {
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '4045550199',
      address: {
        street: '123 Real Way',
        city: 'Atlanta',
        state: 'GA',
        zip: '30306',
      },
      service: 'complete-replacement',
      roofAge: '0-5 years',
      consent: true,
      authenticatedUserId: 'user_whop_verified_demo_01', // Synthetic ID
    };

    const result = estimateFormSchema.safeParse(demoUserPayload);
    expect(result.success).toBe(false);
  });

  it('validates deposit confirmation schema', () => {
    const valid = depositConfirmSchema.safeParse({
      confirmationToken: 'ctok_test123',
      accountId: 'biz_123',
      variantId: 'plan_123',
      returnUrl: 'https://example.com/checkout/return',
    });
    expect(valid.success).toBe(true);

    const invalid = depositConfirmSchema.safeParse({
      confirmationToken: '',
      accountId: 'biz_123',
      variantId: 'plan_123',
      returnUrl: 'not_a_url',
    });
    expect(invalid.success).toBe(false);
  });
});
