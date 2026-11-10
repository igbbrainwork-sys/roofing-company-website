/**
 * Shared Zod Validation Schemas
 * Used across both client components and server API endpoints.
 */

import { z } from 'zod';

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

/**
 * Strips HTML tags from input string to prevent injection
 */
export function sanitizeHtml(val: string): string {
  return val.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Normalizes phone numbers to standard E.164 format (+1XXXXXXXXXX for US)
 */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (rawPhone.trim().startsWith('+') && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return rawPhone.trim();
}

/**
 * Estimate Lead submission schema (shared by EstimateForm and /api/estimate)
 */
export const estimateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .transform(sanitizeHtml),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(254, 'Email address too long'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(25, 'Phone number too long')
    .transform((val) => normalizePhone(val))
    .refine((val) => /^\+?[1-9]\d{1,14}$/.test(val), {
      message: 'Please provide a valid phone number (e.g. (800) 555-7663 or +18005557663)',
    }),
  address: z.object({
    street: z
      .string()
      .trim()
      .min(3, 'Street address is required')
      .max(150, 'Street address too long')
      .transform(sanitizeHtml),
    city: z
      .string()
      .trim()
      .min(2, 'City is required')
      .max(100, 'City too long')
      .transform(sanitizeHtml),
    state: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => US_STATES.includes(val as any), {
        message: 'Please enter a valid 2-letter US state code (e.g. GA, TN, NC, AL)',
      }),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid 5-digit US ZIP code (e.g. 30306)'),
  }),
  service: z
    .string()
    .min(1, 'Please select a roofing service')
    .max(100, 'Service slug too long'),
  roofAge: z
    .string()
    .min(1, 'Please select approximate roof age')
    .max(50, 'Roof age selection too long'),
  message: z
    .string()
    .max(2000, 'Message cannot exceed 2,000 characters')
    .optional()
    .transform((val) => (val ? sanitizeHtml(val) : '')),
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must consent to be contacted regarding this estimate',
    }),
  accountId: z
    .string()
    .min(1, 'Whop account ID required')
    .default('biz_REPLACE_ME'),
  productId: z.string().optional(),
  referrer: z.string().max(500).optional(),
  utmParams: z.record(z.string(), z.string()).optional(),
  authenticatedUserId: z
    .string()
    .max(100)
    .optional()
    .refine(
      (val) => !val || (val.startsWith('user_') && !val.includes('demo') && !val.includes('mock')),
      {
        message: 'Synthetic or demo user IDs are not allowed',
      }
    ),
  // Anti-bot honeypot field (must be empty)
  hp_field: z
    .string()
    .max(0, 'Automated submission detected')
    .optional(),
  // Anti-bot timestamp field (reject if form submitted in under 2 seconds)
  formLoadTimestamp: z
    .number()
    .optional()
    .refine(
      (ts) => !ts || Date.now() - ts >= 2000,
      {
        message: 'Submission completed too fast. Please verify details before submitting.',
      }
    ),
});

export type EstimateFormInput = z.infer<typeof estimateFormSchema>;

/**
 * Deposit confirmation schema (for /api/deposit/confirm)
 */
export const depositConfirmSchema = z.object({
  confirmationToken: z.string().min(1, 'confirmationToken is required'),
  accountId: z.string().min(1, 'accountId is required'),
  variantId: z.string().min(1, 'variantId (planId) is required'),
  returnUrl: z.string().url('returnUrl must be a valid absolute URL'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
});

export type DepositConfirmInput = z.infer<typeof depositConfirmSchema>;

/**
 * Admin Final Balance Invoice schema (for /api/admin/invoice)
 */
export const adminInvoiceSchema = z.object({
  customerEmail: z.string().trim().email('Valid customer email required'),
  customerName: z.string().trim().min(2, 'Customer name required').max(100),
  accountId: z.string().min(1, 'accountId required'),
  planId: z.string().optional(),
  amountUSD: z.number().positive('Invoice amount must be positive').optional(),
  mode: z.enum(['auto', 'manual']),
  dueAt: z.string().optional(),
  paymentMethodId: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().trim().min(1, 'Street line1 required'),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1, 'City required'),
    state: z.string().trim().min(1, 'State required'),
    postalCode: z.string().trim().min(1, 'Postal code required'),
    country: z.string().trim().default('US'),
  }),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type AdminInvoiceInput = z.infer<typeof adminInvoiceSchema>;
