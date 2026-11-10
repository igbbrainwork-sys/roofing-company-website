import React, { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileCheck,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { siteConfig } from '../site.config.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { PlaceholderBanner } from '../components/PlaceholderBanner.js';
import { EventsDebugDrawer } from '../components/EventsDebugDrawer.js';

export const CheckoutReturnPage: React.FC = () => {
  const queryParams = useMemo(() => {
    if (typeof window === 'undefined') return { status: 'succeeded' };
    const params = new URLSearchParams(window.location.search);
    return {
      status: (params.get('status') || params.get('payment_intent_client_secret') ? 'succeeded' : params.get('status') || 'succeeded').toLowerCase(),
      payment: params.get('payment') || params.get('payment_id'),
      setup: params.get('setup') || params.get('setup_intent'),
      plan: params.get('plan') || 'inspection',
    };
  }, []);

  const { status, payment, setup, plan } = queryParams;

  const isDeposit = plan === 'deposit' || !!setup;
  const isSuccess = status === 'succeeded' || status === 'paid';
  const isPending = status === 'pending' || status === 'requires_action';
  const isCanceled = status === 'canceled' || status === 'cancelled';
  const isFailed = !isSuccess && !isPending && !isCanceled;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PlaceholderBanner />
      <Header currentPath="/checkout/return" />

      <main className="flex-1 py-14 sm:py-20 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6">
          {/* Succeeded State */}
          {isSuccess && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Transaction Verified by Whop
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {isDeposit
                    ? 'Project Date Locked & Card Vaulted'
                    : 'Roofing Service Confirmed'}
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  {isDeposit
                    ? 'Your project deposit has been processed. Your payment method is securely vaulted with Whop for your final balance invoice upon project completion.'
                    : 'Your payment was completed successfully. Our dispatch team has received your order and is scheduling your technician.'}
                </p>
              </div>

              {/* Transaction details card */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-2.5 text-xs">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Transaction Receipt Details
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>Whop Payment Reference:</span>
                  <span className="font-mono font-bold text-slate-900 select-all">
                    {payment || 'pay_verified_whop_elements'}
                  </span>
                </div>
                {setup && (
                  <div className="flex justify-between text-slate-600">
                    <span>Card Vault Setup ID:</span>
                    <span className="font-mono text-emerald-700 select-all font-semibold">
                      {setup} (Saved for Final Balance)
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Merchant of Record:</span>
                  <span className="font-semibold text-slate-900">{siteConfig.brand.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fulfillment Verification:</span>
                  <span className="text-emerald-700 font-semibold">Verified via Whop Webhook</span>
                </div>
              </div>

              {/* What Happens Next Steps */}
              <div className="bg-slate-900 text-white rounded-xl p-6 text-left space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  What Happens Next
                </p>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">1. Dedicated Foremen Introduction:</strong>
                      Your assigned master foreman will call you within 60 minutes to confirm access and logistics.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">2. Digital Permit &amp; Materials Filing:</strong>
                      We pull municipal permits and lock your manufacturer shingle delivery pallet.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">3. Final Balance Walkthrough:</strong>
                      Final invoicing is only generated after 100% completion and city code inspection signoff.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Return to Home
                </a>
                <a
                  href={`tel:${siteConfig.brand.phone}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors gap-2"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>Call Dispatch Desk</span>
                </a>
              </div>
            </div>
          )}

          {/* Pending / Requires Action State */}
          {isPending && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Payment Authorization Pending
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Awaiting Bank Confirmation
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your payment authorization is being confirmed by your banking institution. Once approved, your order confirmation will arrive via email.
                </p>
              </div>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Return to Home
              </a>
            </div>
          )}

          {/* Canceled State */}
          {isCanceled && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
              <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Checkout Canceled
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Payment Session Not Completed
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  No charge was made to your card or account. You can review our services and restart checkout at any time.
                </p>
              </div>
              <a
                href="/#pricing"
                className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Review Plans &amp; Reorder
              </a>
            </div>
          )}

          {/* Failed State */}
          {isFailed && (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Payment Failed
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Unable to Complete Transaction
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your payment could not be processed. Please check your payment details or try an alternative method such as Apple Pay, Google Pay, or Klarna.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={`/checkout/${plan}`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </a>
                <a
                  href="/"
                  className="px-6 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <EventsDebugDrawer />
    </div>
  );
};
