# 15-Minute Re-skinning Guide

This template adheres to a strict single-file configuration contract. To re-brand and customize this website for any roofing or exterior contractor in the United States, you only need to edit one file:
`/src/site.config.ts`.

---

## Step 1: Company Profile & Contact Info (3 Minutes)

Open `/src/site.config.ts` and update the `brand` block:

```typescript
brand: {
  name: "Summit Ridge Roofing",
  tagline: "Commercial & Residential Architectural Roofing Specialists",
  shortTagline: "Licensed & Insured Master Roofing Contractors",
  phone: "18005551234",               // Raw E.164 digits for tel: links
  phoneFormatted: "(800) 555-1234",   // Display format for header and footer
  email: "dispatch@summitridgeroofing.com",
  address: {
    street: "100 Mountain View Blvd, Suite 200",
    city: "Denver",
    state: "CO",
    zip: "80202",
    country: "US",
  },
  licenseNumber: "CO-LIC #99281-R / Fully Insured",
  yearsInBusiness: 24,
  hours: "Mon - Sat: 7:00 AM - 6:00 PM MST",
  emergencyAvailable: true,
  colors: {
    primary: "#0F172A", // Brand navy / dark tone
    accent: "#D97706",  // Warm amber / gold CTA accent
    neutral: "#F8FAFC", // Clean light canvas
  },
  fontStack: "Plus Jakarta Sans, system-ui, sans-serif",
}
```

---

## Step 2: Configure Whop Company & Plan IDs (4 Minutes)

In your Whop Dashboard (https://dash.whop.com), create your products and plans:
1. **Inspection Plan**: A one-time checkout plan (e.g. $149).
2. **Project Deposit Plan**: A one-time payment plan (e.g. $500) configured for card-on-file vaulting (`setupFutureUsage="off_session"`).
3. **Emergency Flat-Rate Plan**: A one-time service plan (e.g. $395).
4. **Final Balance Plan**: A plan or product used by the Invoices API.

Then paste your IDs into `whop`:

```typescript
whop: {
  accountId: "biz_your_real_whop_biz_id",
  plans: {
    inspection: {
      planId: "plan_YOUR_REAL_INSPECTION_ID",
      productId: "prod_YOUR_REAL_PRODUCT_ID",
      title: "Drone & Infrared Forensic Roof Inspection",
      priceUSD: 149,
      description: "100% credited toward any repair or replacement contract.",
      features: [ ... ],
    },
    deposit: {
      planId: "plan_YOUR_REAL_DEPOSIT_ID",
      productId: "prod_YOUR_REAL_PRODUCT_ID",
      title: "Project Booking & Material Lock Deposit",
      priceUSD: 500,
      description: "Locks your installation calendar and material wholesale pricing.",
      features: [ ... ],
    },
    flatRate: {
      planId: "plan_YOUR_REAL_FLATRATE_ID",
      productId: "prod_YOUR_REAL_PRODUCT_ID",
      title: "Emergency Tarping & Water Ingress Defense",
      priceUSD: 395,
      description: "Same-day 24-hour storm crew dispatch and heavy-duty tarping.",
      features: [ ... ],
    },
  },
  finalBalancePlanId: "plan_YOUR_REAL_FINAL_BALANCE_ID",
  environment: "production", // "production" or "sandbox"
}
```

*Note*: If any plan ID still contains `REPLACE_ME`, a prominent amber warning banner will display automatically in development mode, guiding you on which IDs remain unconfigured.

---

## Step 3: Customize Roofing Services & Prices (3 Minutes)

Edit `services[]` in `site.config.ts`. You can modify titles, blurbs, starting prices, and which plan button is featured:

```typescript
services: [
  {
    slug: "complete-replacement",
    title: "Complete Architectural Roof Replacement",
    blurb: "Turnkey residential and commercial re-roofing using Class-4 impact shingles.",
    icon: "ShieldCheck",
    startingPrice: 6500,
    featuredPlan: "deposit",
    bullets: [ ... ],
  },
  ...
]
```

---

## Step 4: Define Service Area & Hubs (2 Minutes)

Update `serviceArea` with the target states and municipal cities your client services:

```typescript
serviceArea: {
  states: ["Colorado", "Wyoming"],
  cities: ["Denver Metro", "Boulder", "Fort Collins", "Colorado Springs", "Aurora"],
  radiusNote: "Guaranteed 45-minute dispatch radius across the Denver Front Range.",
  dispatchNote: "Fully licensed, bonded, and registered across local building departments.",
}
```

---

## Step 5: Switch from Pitch Mode to Production (1 Minute)

When pitching a contractor prospect, keep `isSample: true` so disclaimer badges inform the client that sample reviews and mock license numbers are illustrative.

When deploying for a real paying customer:
```typescript
isSample: false, // Disables pitch disclaimer and activates full Schema.org structured data
```

---

## Step 6: Validate Your Setup (2 Minutes)

Run the automated check script in your terminal:
```bash
npm run check
```
This runs TypeScript type checking (`tsc --noEmit`), Vitest configuration validation tests, and schema tests to ensure there are no broken links, missing fields, or invalid configurations.
