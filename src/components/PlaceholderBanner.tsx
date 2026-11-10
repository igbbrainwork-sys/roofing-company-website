import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { hasPlaceholderWhopIds, siteConfig } from '../site.config.js';

export const PlaceholderBanner: React.FC = () => {
  const isPlaceholder = hasPlaceholderWhopIds();
  if (!isPlaceholder) return null;

  return (
    <aside aria-label="Whop Developer Notice" className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-medium border-b border-amber-600">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>
            <strong>Whop Template Notice:</strong> Active placeholder IDs detected in{' '}
            <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono text-slate-950">
              /src/site.config.ts
            </code>
            . Replace with your Whop company account ID and plan IDs before live merchant processing.
          </span>
        </div>
        <a
          href="#pricing"
          className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-white transition-colors shrink-0 font-semibold"
        >
          View Plans Config
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
