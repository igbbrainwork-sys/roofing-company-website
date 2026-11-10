import React, { useMemo } from 'react';
import { WhopElements } from '@whop/elements-react';
import { loadWhop } from '@whop/elements';
import { ArrowLeft, ShieldCheck, Check, Lock, Building, Calendar, Phone } from 'lucide-react';
import { siteConfig } from '../site.config.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { PlaceholderBanner } from '../components/PlaceholderBanner.js';
import { EventsDebugDrawer } from '../components/EventsDebugDrawer.js';
import { CheckoutOneTime } from '../components/CheckoutOneTime.js';
import { CheckoutDeposit } from '../components/CheckoutDeposit.js';

interface CheckoutPageProps {
  planParam?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ planParam }) => {
  // Normalize planParam from route (e.g. "flat-rate" -> "flatRate")
  const normalizedKey = useMemo<'inspection' | 'deposit' | 'flatRate'>(() => {
    const raw = (planParam || window.location.pathname.split('/').pop() || 'inspection').toLowerCase();
    if (raw.includes('deposit')) return 'deposit';
    if (raw.includes('flat') || raw.includes('tarp')) return 'flatRate';
    return 'inspection';
  }, [planParam]);

  const plan = siteConfig.whop.plans[normalizedKey];
  const isDeposit = normalizedKey === 'deposit';

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://apexroofingrestoration.com/checkout/return';
    return `${window.location.origin}/checkout/return`;
  }, []);

  // Appearance theme configuration for Whop Elements matching siteConfig colors
  const elementsAppearance = useMemo(() => {
    return {
      theme: {
        appearance: 'light' as const,
        grayColor: 'slate' as const,
      },
    };
  }, []);

  // Initialize loadWhop promise
  const whopPromise = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return loadWhop();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PlaceholderBanner />
      <Header currentPath="/checkout" />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <div className="mb-8">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Services &amp; Plans</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Whop Elements Payment Surface (col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                  <span>Whop Elements Checkout</span>
                  <span>SSL 256-Bit Encrypted</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {plan.title}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Whop Elements Provider Container */}
              <WhopElements
                elements={whopPromise}
                appearance={elementsAppearance}
              >
                {isDeposit ? (
                  <CheckoutDeposit
                    plan={plan}
                    accountId={siteConfig.whop.accountId}
                    returnUrl={returnUrl}
                  />
                ) : (
                  <CheckoutOneTime
                    planKey={normalizedKey}
                    plan={plan}
                    returnUrl={returnUrl}
                  />
                )}
              </WhopElements>
            </div>

            {/* Right Column: Order Summary & Reassurance (col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order Summary
                </p>

                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{plan.badge || 'Direct Contractor Booking'}</p>
                  </div>
                  <p className="text-base font-bold text-slate-900 tabular-nums">
                    ${plan.priceUSD}.00
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold">${plan.priceUSD}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Municipal Filing / Dispatch Fee</span>
                    <span className="font-semibold text-emerald-600">$0.00 (Waived)</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                    <span>Total Due Today</span>
                    <span className="tabular-nums">${plan.priceUSD}.00 USD</span>
                  </div>
                </div>

                <div className="pt-2 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-900">Included Scope &amp; Deliverables:</p>
                  <ul className="space-y-1.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contractor Credentials Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Contractor Protection Guarantee
                </p>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>$2,000,000 Comprehensive Commercial General Liability &amp; Workers' Comp Insurance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>State Licensed Contractor: {siteConfig.brand.licenseNumber}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Dedicated Project Manager Assigned Within 60 Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <EventsDebugDrawer />
    </div>
  );
};
