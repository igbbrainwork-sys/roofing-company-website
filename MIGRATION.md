# Whop Websites Scaffold & Deployment Migration Guide

This document explains the runtime architecture of the Apex Roofing & Restoration template, how it bridges AI Studio preview hosting with official Whop Websites hosting, and the exact deployment workflow.

---

## 1. Runtime Architecture Comparison

| Feature | Whop Websites Production Scaffold | Local / AI Studio Preview Runtime |
|---|---|---|
| **Vite Plugin** | `whop()` from `@whop/cli/vite` | `@tailwindcss/vite` + `@vitejs/plugin-react` |
| **Build Artifacts** | `dist/client` (static) + `dist/server` (SSR / functions) | `dist/` (client bundle) + `server.ts` (Express API) |
| **Server Engine** | Serverless / Cloudflare Workers runtime via Whop CLI | Node.js Express process on `http://0.0.0.0:3000` |
| **API Routing** | Server functions (`createServerFn` / TanStack Start) | Express Router (`/api/*` in `src/server/routes/api.ts`) |
| **Whop Secret** | Injected at runtime into server environment | `process.env.WHOP_API_KEY` (server-side only) |

### Dual Compatibility Design
All Whop core integration modules in `/src/server/whop/` (`leads.ts`, `invoices.ts`, `payments.ts`, `tokens.ts`, `client.ts`) are implemented as pure, framework-agnostic TypeScript functions. They receive strongly typed payloads and return normalized results.

- **Under Express (`server.ts`)**: Express route handlers in `src/server/routes/api.ts` validate inputs with Zod and delegate directly to these functions.
- **Under Whop CLI / TanStack Start**: The exact same functions can be invoked inside `createServerFn()` or server route handlers without changing a single line of business logic.

---

## 2. Whop CLI Deployment Commands

To deploy this website template to your Whop company account:

### A. Local Development with Whop CLI
```bash
# 1. Authenticate with your Whop developer account
whop login

# 2. Start the Whop local development emulator (ports and webhooks piped automatically)
whop apps dev
```

### B. Deploying to Whop Websites Hosting
```bash
# Deploy code bundle to Whop Edge CDN
whop apps deploy
```

### C. Streaming Logs & Diagnosing Webhooks
```bash
# View real-time server logs, webhook events, and invoice creations
whop apps logs --follow
```

---

## 3. Rate Limiting in Stateless / Serverless Environments

### In-Memory Sliding Window
In `src/server/routes/api.ts`, rate limiting is enforced with a sliding-window timestamp map (`checkRateLimit(ip, maxRequests, windowMs)`).

- **Current Behavior**: Protects each Node container instance against aggressive spam bursts (e.g. 10 estimate submissions per 15 minutes per IP).
- **Stateless Cloud Considerations**: When deployed across multiple serverless workers or container replicas, memory is instance-local. If an IP hits different worker instances, the count resets per worker.
- **Production Recommendation**: For distributed enterprise environments with high traffic, point `checkRateLimit` to a managed Redis instance (Upstash / Redis Labs) via key-value expiration:
  ```typescript
  // Example Upstash Redis distributed pattern
  const count = await redis.incr(`rl:${ip}`);
  if (count === 1) await redis.expire(`rl:${ip}`, 900);
  if (count > 10) return false;
  ```

---

## 4. Bot Protection: Honeypots & Submission Timestamps

In addition to IP rate limiting, the template implements a two-stage bot rejection system:
1. **Hidden Honeypot Field (`hp_field`)**: Rendered off-screen with `aria-hidden="true"` and `tabIndex={-1}`. Automated scripts that fill every input trigger an immediate silent `200 OK` rejection (`lead_ignored`).
2. **Submission Time Check (`formLoadTimestamp`)**: The client records `Date.now()` upon mounting. Forms submitted in under 2 seconds are rejected by the Zod schema before hitting the Whop API.

---

## 5. Content Security Policy (CSP)

Whop Elements requires specific script, connect, and iframe origins. In `server.ts`:
```typescript
import { contentSecurityPolicy } from '@whop/elements';

const whopCsp = contentSecurityPolicy({ environment: 'production' });
const fullCsp = `${whopCsp.toString()}; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; default-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data:;`;

app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy-Report-Only', fullCsp);
  next();
});
```
*Note*: No manual PayPal or Stripe domains are added; `@whop/elements` manages all required payment origins internally.
