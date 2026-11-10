/**
 * Server Entry Point
 * Runs Express server hosting the API routes and mounting Vite in development.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { contentSecurityPolicy } from '@whop/elements';
import { apiRouter } from './src/server/routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Capture raw body for webhook verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
      limit: '5mb',
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Apply CSP header derived from @whop/elements
  const whopEnv = (process.env.VITE_WHOP_ENV as 'production' | 'sandbox') || 'production';
  try {
    const whopCsp = contentSecurityPolicy({ environment: whopEnv });
    // Append necessary local app origins so Vite & fonts function seamlessly
    const fullCsp = `${whopCsp.toString()}; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; default-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data:;`;
    app.use((_req, res, next) => {
      res.setHeader('Content-Security-Policy-Report-Only', fullCsp);
      next();
    });
  } catch (err) {
    console.warn('[Server] Could not initialize Whop CSP:', err);
  }

  // Mount Whop API routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode: mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middlewares mounted');
  } else {
    // Production mode: serve built assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Apex Roofing Whop Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
