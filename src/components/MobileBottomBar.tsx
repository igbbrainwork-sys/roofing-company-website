import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const MobileBottomBar: React.FC = () => {
  return (
    <aside aria-label="Quick Actions" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <a
          href={`tel:${siteConfig.brand.phone}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold transition-colors"
        >
          <Phone className="w-4 h-4 text-amber-600" />
          <span>Call Dispatch</span>
        </a>
        <a
          href="/#estimate"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Get Estimate</span>
        </a>
      </div>
    </aside>
  );
};
