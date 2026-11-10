import React, { useState } from 'react';
import {
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  BrandingElement,
} from '@whop/elements-react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { WhopPlanConfig, siteConfig } from '../site.config.js';
import { trackWhopEvent } from '../lib/track.js';

interface CheckoutOneTimeProps {
  planKey: 'inspection' | 'flatRate';
  plan: WhopPlanConfig;
  returnUrl: string;
}

export const CheckoutOneTime: React.FC<CheckoutOneTimeProps> = ({
  planKey,
  plan,
  returnUrl,
}) => {
  const isPlaceholder = plan.planId.includes('REPLACE_ME');
  const [demoSimulating, setDemoSimulating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleComplete = (result: any) => {
    // onComplete is used ONLY for analytics; never treat as backend fulfillment
    trackWhopEvent('checkout_completed', {
      planKey,
      planId: plan.planId,
      resultId: result?.id,
    });
  };

  const handleSimulatePayment = () => {
    setDemoSimulating(true);
    setTimeout(() => {
      window.location.href = `${returnUrl}?status=succeeded&payment=pay_simulated_${Date.now()}&plan=${planKey}`;
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Express Checkout Handle */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Express Checkout
        </p>
        <div className="min-h-[48px] bg-slate-50 rounded-lg p-2 border border-slate-200">
          {!isPlaceholder ? (
            <Checkout plan={plan.planId} returnUrl={returnUrl}>
              <ExpressCheckoutElement />
            </Checkout>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 py-1.5 px-2">
              <span className="font-mono text-[11px]">Apple Pay / Google Pay / PayPal</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Placeholder Plan Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-500 font-semibold tracking-wider">
            or pay with card
          </span>
        </div>
      </div>

      {/* Full Card Checkout Handle with BrandingElement */}
      <div className="space-y-4">
        {!isPlaceholder ? (
          <Checkout
            plan={plan.planId}
            returnUrl={returnUrl}
            onComplete={handleComplete}
          >
            <div className="space-y-4">
              <CheckoutElement />
              {/* BrandingElement is MANDATORY; confirming without it throws BrandingRequiredError */}
              <BrandingElement />
            </div>
          </Checkout>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
            <div className="flex items-start gap-2.5 text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Whop Plan Placeholder Mode</p>
                <p className="mt-0.5 text-slate-600">
                  Plan ID <code className="font-mono text-slate-900 bg-slate-200 px-1 py-0.5 rounded">{plan.planId}</code> is a placeholder in <code className="font-mono text-slate-900">site.config.ts</code>. You can simulate the full customer checkout and return flow below:
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>{plan.title}</span>
                <span>${plan.priceUSD}.00</span>
              </div>
              <p className="text-slate-500 text-[11px]">{plan.description}</p>
            </div>

            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={demoSimulating}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {demoSimulating ? 'Processing Simulated Whop Payment...' : `Simulate ${plan.title} Payment ($${plan.priceUSD})`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trust reassurance */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Whop Payments PCI-DSS Level 1</span>
        </div>
        <span>Fulfillment verified via Webhooks</span>
      </div>
    </div>
  );
};
