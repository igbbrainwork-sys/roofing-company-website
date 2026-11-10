# Apex Roofing & Restoration — Whop Website Contractor Template

A production-ready, reusable website template designed for US residential and commercial roofing companies, hosted on **Whop Websites** and powered by **Whop Elements**, **Whop Payments**, **Whop Leads**, and the **Whop Invoices API**.

---

## 1. Creating the Three Plans in the Whop Dashboard

To accept real payments and deposits from homeowners, set up three digital products/plans inside your [Whop Dashboard](https://whop.com/dashboard):

1. **Plan 1: Comprehensive Roof Inspection (One-Time Payment)**
   - Navigate to **Products** &rarr; **New Product**. Title: `Forensic Roof Inspection`.
   - Under **Pricing / Plans**, click **Add Plan**.
   - Type: **One-time payment**.
   - Price: `$149.00 USD`.
   - Copy the Plan ID (starts with `plan_...`) and Product ID (starts with `prod_...`).
   - Paste into `/src/site.config.ts` under `siteConfig.whop.plans.inspection`.

2. **Plan 2: Project Booking & Material Lock Deposit (Card on File)**
   - Navigate to **Products** &rarr; **New Product**. Title: `Roofing Project Deposit`.
   - Under **Pricing / Plans**, click **Add Plan**.
   - Type: **One-time payment**.
   - Price: `$500.00 USD`.
   - Copy the Plan ID (starts with `plan_...`) and Product ID (starts with `prod_...`).
   - Paste into `/src/site.config.ts` under `siteConfig.whop.plans.deposit`.
   - *Note:* In checkout, this plan operates with `setupFutureUsage="off_session"`, storing the customer's payment credential in Whop's secure vault for the final balance invoice.

3. **Plan 3: Emergency Tarping & Rapid Leak Defense (Flat-Rate Service)**
   - Navigate to **Products** &rarr; **New Product**. Title: `Emergency Roof Tarping`.
   - Under **Pricing / Plans**, click **Add Plan**.
   - Type: **One-time payment**.
   - Price: `$395.00 USD`.
   - Copy the Plan ID (starts with `plan_...`) and Product ID (starts with `prod_...`).
   - Paste into `/src/site.config.ts` under `siteConfig.whop.plans.flatRate`.

4. **Final Balance Plan (Optional / Invoicing)**
   - If using a fixed variant for the final project balance, create a `$0` or custom variable product plan in Whop.
   - Copy the Plan ID and paste into `/src/site.config.ts` under `siteConfig.whop.finalBalancePlanId`.

5. **Merchant Company Account ID**
   - In your Whop Dashboard Settings &rarr; Company &rarr; Copy Company ID (`biz_...`).
   - Paste into `/src/site.config.ts` under `siteConfig.whop.accountId` or set `VITE_WHOP_ACCOUNT_ID`.

---

## 2. Creating an API Key & Required Permissions

Your server communicates securely with the Whop API without ever exposing keys to the browser:

1. Open **Whop Dashboard** &rarr; **Developer** &rarr; **API Keys**.
2. Click **Create API Key**. Name: `Roofing Website Server Key`.
3. Check the following required permission scopes:
   - `lead:manage` — Required to log homeowner estimate requests into Whop CRM via `POST /leads`.
   - `member:email:read` — Required to search and resolve customer members by email via `client.members.list`.
   - `member:basic:read` — Required to retrieve customer profiles and member IDs.
   - `access_pass:basic:read` — Required to verify customer product access.
   - `payment:charge` — Required to confirm deposits and charge vaulted cards off-session via `POST /invoices/{id}/issue`.
   - `payment:basic:read` — Required to query transactions and inspect payment methods via `client.paymentMethods.list`.
   - `plan:create` — *(Optional)* Required if dynamically generating custom inline plans for custom final balance amounts.
4. Copy the generated secret key (starts with `whop_api_key_...`).

---

## 3. Setting Secrets for the Deployed App

In your hosting environment (or local `.env`):

```bash
# Whop Server Secret Key (NEVER exposed to client)
WHOP_API_KEY="whop_api_key_your_actual_key"

# Whop Webhook Signature Secret
WHOP_WEBHOOK_SECRET="whop_whsec_your_actual_secret"

# Admin Token for Final Balance Invoicing Console (/admin)
ADMIN_TOKEN="roofing-admin-secret-2026"

# Elements Environment: "production" or "sandbox"
VITE_WHOP_ENV="production"

# Company Account ID
VITE_WHOP_ACCOUNT_ID="biz_your_company_id"

# Base Application URL
APP_URL="https://your-roofing-domain.com"
```

---

## 4. Registering the Webhook

Whop webhooks provide server-to-server confirmation of payments and card vaulting:

1. Open **Whop Dashboard** &rarr; **Developer** &rarr; **Webhooks**.
2. Click **Add Endpoint**.
3. Endpoint URL: `https://your-roofing-domain.com/api/webhooks/whop`
4. Subscribe to the following events:
   - `payment.succeeded` — Triggered when an inspection fee, deposit, or final balance invoice is paid.
   - `payment.failed` — Triggered if an off-session charge or customer payment is declined.
   - `setup_intent.succeeded` — Triggered when a customer's card is successfully vaulted for future off-session charging.
5. Copy the **Signing Secret** (`whop_whsec_...`) into your `WHOP_WEBHOOK_SECRET` environment variable.

The server verifies all incoming webhooks using `unwrapWebhook` from `@whop/sdk/helpers`.

---

## 5. Whop CLI Workflow

Use the Whop CLI to test and deploy:

```bash
# Install or use Whop CLI
npx @whop/cli login

# Start development with hot reloading and tunnel
whop apps dev

# Deploy the website bundle to Whop Websites hosting
whop apps deploy

# Inspect live server logs
whop apps logs
```

---

## 6. How to Re-Skin the Template for a New Client

To adapt this website for any roofing contractor in the US, you only edit **a single file**: `/src/site.config.ts`.

1. **Brand Identity**:
   - Update `brand.name`, `brand.tagline`, `brand.phone`, `brand.email`, and `brand.address`.
   - Update `brand.licenseNumber` and `brand.yearsInBusiness`.
2. **Colors & Typography**:
   - Adjust `brand.colors.primary` (e.g. Navy, Slate, Charcoal) and `brand.colors.accent` (e.g. Amber, Gold, Forest Green).
3. **Services & Starting Prices**:
   - Update the `services[]` array with the client's specialties (Asphalt, Standing Seam Metal, TPO Flat Roofs, etc.).
4. **Service Area**:
   - List the client's supported `states` and `cities[]`. The CSS vector map updates dynamically.
5. **Whop IDs**:
   - Replace `accountId` and `plans` with the client's specific Whop IDs.
6. **Customer Reviews & Badges**:
   - Replace `reviews.items[]` with authentic testimonials and municipal permit locations.

Zero structural HTML or routing edits are required.

---

## 7. Verification Checklist

| Requirement | Implementation Location | Verification Method |
| :--- | :--- | :--- |
| **Whop Payments Only** | `/src/components/CheckoutOneTime.tsx`, `/src/components/CheckoutDeposit.tsx` | Uses `@whop/elements-react`. No Stripe, PayPal, or custom card inputs exist. |
| **Single Config Re-Skin** | `/src/site.config.ts` | All copy, plans, phone numbers, and colors derive strictly from `siteConfig`. |
| **Whop Elements Provider** | `/src/routes/CheckoutPage.tsx` | Wraps surface in `<WhopElements elements={loadWhop()} appearance={...}>`. |
| **Mandatory BrandingElement** | `/src/components/CheckoutOneTime.tsx`, `/src/components/CheckoutDeposit.tsx` | Mounted on every payment surface to prevent `BrandingRequiredError`. |
| **Deposit Card-on-File** | `/src/components/CheckoutDeposit.tsx`, `/src/server/whop/payments.ts` | Uses `<Payments setupFutureUsage="off_session">` & `payments.createConfirmationToken()`. |
| **Whop Leads API** | `/src/components/EstimateForm.tsx`, `/src/server/whop/leads.ts` | Validated by Zod, calls `POST https://api.whop.com/api/v1/leads` with `Api-Version-Date: 2026-10-24`. |
| **Lead User Resolution** | `/src/server/whop/leads.ts` (`resolveLeadUser`) | Queries `client.members.list({ query: email })`. Falls back to metadata if user does not exist yet. |
| **Final Balance Invoices** | `/src/server/whop/invoices.ts`, `/src/routes/AdminPage.tsx` | Supports mode "auto" (off-session `issue()`) and mode "manual" (hosted link `send()`). Pinned 2026-10-24. |
| **Pixel Event Deduplication** | `/src/lib/track.ts` | Emits `event_id` on all tracking calls (`estimate_requested`, `service_viewed`, `deposit_started`). |
| **On-Page Events Drawer** | `/src/components/EventsDebugDrawer.tsx` | Viewable via `?debug=1` or dev button; audits all fired events on screen. |
| **Checkout Return Flow** | `/src/routes/CheckoutReturnPage.tsx` | Reads `status`, `payment`, and `setup` query params before rendering status. |
| **Webhook Verification** | `/src/server/routes/api.ts` | Verified with `unwrapWebhook` from `@whop/sdk/helpers` using `WHOP_WEBHOOK_SECRET`. |
| **SEO & Schema.org** | `/src/App.tsx`, `/index.html` | Generates dynamic `LocalBusiness` and `RoofingContractor` JSON-LD from `siteConfig`. |
| **Mobile Sticky Cap** | `/src/components/MobileBottomBar.tsx` | Stays strictly under 15% mobile viewport height. |

---

## 8. Assumptions and TODO(VERIFY) Items

1. **`// TODO(VERIFY): ExpressCheckoutElement under Payments for Card-on-File Deposit`**
   - *Location:* `/src/components/CheckoutDeposit.tsx`, `/src/server/whop/payments.ts`
   - *Detail:* In current Whop Elements, `<ExpressCheckoutElement />` requires a `<Checkout>` handle. When card-on-file (`setupFutureUsage="off_session"`) is needed for subsequent final balance invoicing, the standard card form via `<PaymentElement>` under `<Payments>` provides reliable off-session credential vaulting. Verify with Whop documentation if Express Checkout supports automatic off-session agreement pass-through.
2. **`// TODO(VERIFY): Member Search by Email in Multi-Company Scenarios`**
   - *Location:* `/src/server/whop/leads.ts`, `/src/server/whop/invoices.ts`
   - *Detail:* `client.members.list({ account_id, query: email })` matches exact email addresses when the API key possesses `member:email:read`. If a customer has never purchased through Whop before, they may not yet exist as a member on the account until their first checkout or draft invoice creation. Our adapter gracefully falls back to attaching full contact details to lead metadata.
3. **`// TODO(VERIFY): Whop Elements Sandbox Environment Availability`**
   - *Location:* `/src/site.config.ts`, `server.ts`
   - *Detail:* `VITE_WHOP_ENV` defaults to `"production"`. Whop sandbox environments require a corresponding sandbox organization in the Whop dashboard.
