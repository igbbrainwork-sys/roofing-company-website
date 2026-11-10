import React, { useEffect, useState } from 'react';
import {
  Payments,
  PaymentElement,
  EmailElement,
  AddressElement,
  BrandingElement,
  usePayments,
  useWhop,
} from '@whop/elements-react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { WhopPlanConfig, siteConfig } from '../site.config.js';
import { trackDepositStarted, trackWhopEvent } from '../lib/track.js';

interface CheckoutDepositProps {
  plan: WhopPlanConfig;
  accountId: string;
  returnUrl: string;
}

/**
 * Inner payment controller using usePayments hook inside <Payments>
 */
const DepositPaymentForm: React.FC<{
  plan: WhopPlanConfig;
  accountId: string;
  returnUrl: string;
  isPlaceholder: boolean;
}> = ({ plan, accountId, returnUrl, isPlaceholder }) => {
  const payments = usePayments();
  const whop = useWhop();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TODO(VERIFY): Check whether ExpressCheckoutElement can be mounted under Payments for card-on-file deposit.
  // In the current Whop Elements API, Express Checkout operates within a Checkout handle, whereas
  // setupFutureUsage="off_session" (vaulting card credentials for subsequent invoicing) requires
  // the Payments hierarchy with explicit customer authorization. If express checkout is desired,
  // it can be mounted via a standalone Checkout handle for the deposit plan; however, off-session
  // invoicing requires card vaulting via PaymentElement.

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isPlaceholder) {
      setIsProcessing(true);
      setTimeout(() => {
        window.location.href = `${returnUrl}?status=succeeded&payment=pay_mock_deposit_${Date.now()}&setup=set_mock_card_vaulted&plan=deposit`;
      }, 1200);
      return;
    }

    if (!payments) {
      setErrorMessage('Payment controller is still initializing. Please wait a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create confirmation token from Whop Elements
      const { confirmationToken } = await payments.createConfirmationToken({});

      // 2. POST token to server endpoint to create payment with setup_future_usage
      const response = await fetch('/api/deposit/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationToken,
          accountId,
          variantId: plan.planId,
          returnUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to authorize deposit payment');
      }

      // 3. Handle next action (e.g. 3D Secure or biometric authorization) if required
      if (result.requiresAction && result.clientSecret) {
        if (whop?.payments?.handleNextAction) {
          const actionResult = await whop.payments.handleNextAction({
            clientSecret: result.clientSecret,
            returnUrl,
          });

          if (actionResult.status === 'succeeded' || !actionResult.lastPaymentError) {
            window.location.href = `${returnUrl}?status=succeeded&payment=${result.paymentId}&plan=deposit`;
            return;
          } else {
            throw new Error(
              actionResult.lastPaymentError?.message || 'Payment authorization was not completed'
            );
          }
        }
      }

      // 4. Success redirect
      window.location.href = `${returnUrl}?status=succeeded&payment=${result.paymentId || 'pay_confirmed'}&plan=deposit`;
    } catch (err: any) {
      console.error('[Deposit Checkout Error]', err);
      setErrorMessage(err.message || 'Payment processing failed. Please verify your details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mandatory customer identity and address fields for off-session card vaulting */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Contact
          </label>
          <EmailElement />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Billing &amp; Property Address
          </label>
          <AddressElement />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Method
          </label>
          <PaymentElement />
        </div>

        {/* BrandingElement is MANDATORY; confirming without it throws BrandingRequiredError */}
        <BrandingElement />
      </div>

      {/* Explicit Card-on-File Consent Disclosure */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold flex items-center gap-1.5 mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          Card Kept Securely on File
        </p>
        <p className="text-[11px] text-amber-800">
          By completing this project deposit of ${plan.priceUSD}.00, you authorize {siteConfig.brand.name} to vault this payment method securely with Whop for your project's final balance invoice upon 100% project completion and municipal building inspection.
        </p>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 text-sm"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Vaulting Payment Method with Whop...
          </>
        ) : (
          <>
            <span>Pay Project Deposit (${plan.priceUSD}.00)</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export const CheckoutDeposit: React.FC<CheckoutDepositProps> = ({
  plan,
  accountId,
  returnUrl,
}) => {
  const isPlaceholder = plan.planId.includes('REPLACE_ME') || accountId.includes('REPLACE_ME');

  // Fire deposit_started when the buyer opens/begins the deposit checkout (on mount)
  useEffect(() => {
    trackDepositStarted(plan.priceUSD);
  }, [plan.priceUSD]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Card-on-File Booking Flow
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">
            Initial Project Deposit: ${plan.priceUSD}.00 USD
          </p>
        </div>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
          setupFutureUsage="off_session"
        </span>
      </div>

      {isPlaceholder ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-start gap-2.5 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Placeholder Configuration Active</p>
              <p className="mt-0.5 text-slate-600">
                Deposit plan ID <code className="font-mono text-slate-900 bg-slate-200 px-1 py-0.5 rounded">{plan.planId}</code> or account ID is unconfigured in <code className="font-mono text-slate-900">site.config.ts</code>. You can test the full card-on-file vaulting simulation below:
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between font-semibold text-slate-900">
              <span>{plan.title}</span>
              <span>${plan.priceUSD}.00</span>
            </div>
            <p className="text-slate-500 text-[11px]">{plan.description}</p>
          </div>

          <DepositPaymentForm
            plan={plan}
            accountId={accountId}
            returnUrl={returnUrl}
            isPlaceholder={true}
          />
        </div>
      ) : (
        <Payments
          accountId={accountId}
          plan={plan.planId}
          setupFutureUsage="off_session"
          returnUrl={returnUrl}
        >
          <DepositPaymentForm
            plan={plan}
            accountId={accountId}
            returnUrl={returnUrl}
            isPlaceholder={false}
          />
        </Payments>
      )}

      {/* Trust reassurance */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Whop Vault Level 1 PCI-DSS</span>
        </div>
        <span>Final Balance Only Invoiced After Signoff</span>
      </div>
    </div>
  );
};
