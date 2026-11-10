import React from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const FinancingSection: React.FC = () => {
  return (
    <section id="financing" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <CreditCard className="w-4 h-4" />
                <span>Flexible Homeowner Payment Solutions</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
                {siteConfig.financing.headline}
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                {siteConfig.financing.body}
              </p>

              <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-amber-500 pl-3 italic">
                {siteConfig.financing.learnMoreCopy}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="/#pricing"
                  className="inline-flex justify-center items-center px-5 py-3 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
                >
                  Explore Booking Options
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </a>
                <a
                  href="/#estimate"
                  className="inline-flex justify-center items-center px-5 py-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  Request Pre-Qualification Estimate
                </a>
              </div>
            </div>

            {/* Right Card / Highlights */}
            <div className="lg:col-span-5 bg-slate-950/70 rounded-xl border border-slate-800 p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financing Highlights
              </p>

              <ul className="space-y-3">
                {siteConfig.financing.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Whop Safe Checkout</span>
                </div>
                <span>Zero Prepayment Penalty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
