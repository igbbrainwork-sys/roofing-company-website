# Apex Roofing & Restoration — Whop Websites Template

Production-ready, customizable website template for United States roofing contractors, designed for hosting on **Whop Websites**. Demonstrates end-to-end Whop commerce, payments, lead generation, and off-session invoicing workflows.

---

## Requirements to Code Traceability Table

| Requirement / Constraint | Implementation File(s) | Verification / Details |
|---|---|---|
| **Whop Payments Only** (No Stripe/PayPal SDKs or custom card forms) | `/src/components/CheckoutDeposit.tsx`<br>`/src/components/CheckoutOneTime.tsx` | Uses `<Payments>`, `<PaymentElement>`, `<Checkout>`, `<CheckoutElement>`, `<ExpressCheckoutElement>` from `@whop/elements-react`. |
| **Mandatory BrandingElement** on every payment surface | `/src/components/CheckoutDeposit.tsx` (line 145)<br>`/src/components/CheckoutOneTime.tsx` (line 89) | Mounts `<BrandingElement />`. Prevents runtime `BrandingRequiredError`. |
| **One-Time Checkout (Inspection & Flat-Rate)** | `/src/components/CheckoutOneTime.tsx` | Separate `<Checkout>` handles for `<ExpressCheckoutElement />` and `<CheckoutElement />`. |
| **Project Deposit ($500) & Card Vaulting** | `/src/components/CheckoutDeposit.tsx`<br>`/src/server/whop/payments.ts` | `<Payments setupFutureUsage="off_session">` generates confirmation token; confirmed via Whop Payments API. |
| **Whop Leads API** (Estimate Form) | `/src/components/EstimateForm.tsx`<br>`/src/server/whop/leads.ts`<br>`/src/server/routes/api.ts` | POSTs to Whop Leads API with `Api-Version-Date: 2026-10-24`. Prospective leads use `user_id: null` and full identity in `metadata`. |
| **Whop Pixel Event Tracking** | `/src/lib/track.ts`<br>`/src/components/EventsDebugDrawer.tsx` | Custom events: `estimate_requested`, `service_viewed`, `deposit_started` with stable `event_id`s and on-page debug drawer (`?debug=1`). |
| **Whop Invoices API** (Final Balance) | `/src/server/whop/invoices.ts`<br>`/src/routes/AdminPage.tsx` | Supports `mode: "auto"` (off-session charge) and `mode: "manual"` (email pay link), pinned `Api-Version-Date: 2026-10-24`, UUID `Idempotency-Key`. |
| **Server-Only API Key** | `/src/server/whop/client.ts`<br>`/src/server/routes/api.ts` | `WHOP_API_KEY` read strictly via `process.env.WHOP_API_KEY` on server. Never exposed to Vite client bundle. |
| **Template Reusability via Single File** | `/src/site.config.ts` | Swapping company name, services, prices, plans, phone, license, reviews, and service area requires editing ONLY `site.config.ts`. |
| **Timing-Safe Admin Security** | `/src/server/whop/invoices.ts` (lines 59-67) | Constant-time `verifyAdminToken` using SHA-256 fixed 32-byte digests with `crypto.timingSafeEqual` prevents timing/length leakage. |
| **Shared Zod Validation & Normalization** | `/src/lib/schemas.ts`<br>`/src/lib/api-client.ts` | Phone normalized to E.164, US state and ZIP code validated, HTML tags stripped, anti-bot honeypot and >2s submission check. |
| **Accessible Design System & Motion** | `/src/components/ui/*`<br>`/src/index.css` | Atomic UI library (`Button`, `Card`, `Tabs`, `Accordion`, `Toast`, `Skeleton`, `BeforeAfterSlider`). Respects `prefers-reduced-motion`. |
| **LocalBusiness Schema.org Structured Data** | `/src/App.tsx` (lines 70-108) | Injects dynamic JSON-LD for SEO. Omits unverified claims when `isSample: true`. |
| **Automated Vitest Test Suite** | `/tests/*.test.ts` | 13 automated unit tests covering schemas, price math, siteConfig, and token verification. |

---

## Getting Started

### 1. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Populate your environment variables:
- `WHOP_API_KEY`: Your Whop merchant API key (`whop_api_...`)
- `VITE_WHOP_ACCOUNT_ID`: Your company account ID (`biz_...`)
- `ADMIN_TOKEN`: Secret token used to authorize final balance invoicing from the admin portal

### 2. Run the Development Server
```bash
npm run dev
```
Starts the full-stack server on `http://localhost:3000`.

### 3. Run Automated Tests & Checks
```bash
# Run unit test suite
npm run test

# Run full project verification (TypeScript lint + Vitest tests)
npm run check
```

---

## Deployment to Whop Hosting

See `/MIGRATION.md` for full instructions. Deploying to Whop Websites uses the Whop CLI:
```bash
whop apps dev     # Local development emulator
whop apps deploy  # Production build and deployment
whop apps logs    # Live server logs and webhook traces
```

---

## Re-skinning for New Clients

See `/docs/RESKIN.md` for a 15-minute onboarding walkthrough. Re-skinning requires editing only `/src/site.config.ts`.
