import { describe, it, expect } from 'vitest';
import { siteConfig, siteConfigSchema, hasPlaceholderWhopIds } from '../src/site.config.js';

describe('Site Configuration & Schema Validation', () => {
  it('siteConfig strictly conforms to siteConfigSchema', () => {
    const parseResult = siteConfigSchema.safeParse(siteConfig);
    expect(parseResult.success).toBe(true);
  });

  it('detects placeholder Whop IDs correctly', () => {
    // Current siteConfig uses plan_REPLACE_ME
    expect(hasPlaceholderWhopIds(siteConfig)).toBe(true);

    const configuredConfig = {
      ...siteConfig,
      whop: {
        ...siteConfig.whop,
        accountId: 'biz_real_company_123',
        plans: {
          inspection: { ...siteConfig.whop.plans.inspection, planId: 'plan_real_insp_123' },
          deposit: { ...siteConfig.whop.plans.deposit, planId: 'plan_real_dep_123' },
          flatRate: { ...siteConfig.whop.plans.flatRate, planId: 'plan_real_flat_123' },
        },
      },
    };
    expect(hasPlaceholderWhopIds(configuredConfig)).toBe(false);
  });
});
