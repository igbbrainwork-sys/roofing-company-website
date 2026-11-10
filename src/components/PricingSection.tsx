import React from 'react';
import { Check, ShieldCheck, ArrowRight, Lock, Zap } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const PricingSection: React.FC = () => {
  const { inspection, deposit, flatRate } = siteConfig.whop.plans;

  const plans = [
    {
      key: 'inspection',
      plan: inspection,
      ctaText: `Book Inspection ($${inspection.priceUSD})`,
      href: '/checkout/inspection',
      isPopular: false,
      footerNote: '100% credited toward your approved repair or replacement contract.',
    },
    {
      key: 'deposit',
      plan: deposit,
      ctaText: `Lock Project Date ($${deposit.priceUSD})`,
      href: '/checkout/deposit',
      isPopular: true,
      footerNote: 'Secures wholesale shingle pricing & calendar. Card kept on file for final balance.',
    },
    {
      key: 'flatRate',
      plan: flatRate,
      ctaText: `Order Emergency Tarping ($${flatRate.priceUSD})`,
      href: '/checkout/flatRate',
      isPopular: false,
      footerNote: 'Guaranteed 45-90 min rapid storm response dispatch.',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            04. Transparent Pricing &amp; Online Booking
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Zero Guesswork. Instant Online Reservation Powered by Whop.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Choose your service below to check out securely via Whop Elements. All deposits and inspection fees are backed by our transparent contract guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map(({ key, plan, ctaText, href, isPopular, footerNote }) => (
            <div
              key={key}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
                isPopular
                  ? 'bg-slate-900 text-white shadow-xl ring-2 ring-amber-500 relative'
                  : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-3.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Contractor Deposit Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isPopular ? 'text-amber-400' : 'text-amber-700'
                    }`}
                  >
                    {plan.badge || 'Direct Service'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3" />
                    <span>Whop Elements</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {plan.title}
                </h3>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black tabular-nums">
                    ${plan.priceUSD}
                  </span>
                  <span className={`text-xs ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    USD one-time
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-6 ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <div className={`pt-4 border-t ${isPopular ? 'border-slate-800' : 'border-slate-100'} mb-6`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    What's Included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span className={isPopular ? 'text-slate-200' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <a
                  href={href}
                  className={`w-full inline-flex justify-center items-center px-5 py-3.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                    isPopular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {ctaText}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </a>

                <p className={`text-[11px] text-center mt-3 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                  {footerNote}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Bank-Level Encryption</span>
          </div>
          <span aria-hidden="true">·</span>
          <span>No Card Details Stored on Contractor Servers</span>
          <span aria-hidden="true">·</span>
          <span>Apple Pay, Google Pay &amp; Klarna Supported</span>
        </div>
      </div>
    </section>
  );
};
