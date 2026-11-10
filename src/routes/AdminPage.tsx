import React, { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Receipt,
  Loader2,
  RefreshCw,
  Building,
} from 'lucide-react';
import { siteConfig } from '../site.config.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { EventsDebugDrawer } from '../components/EventsDebugDrawer.js';

export const AdminPage: React.FC = () => {
  const [adminToken, setAdminToken] = useState('roofing-admin-secret-2026');
  const [customerEmail, setCustomerEmail] = useState('elena.rostova@example.com');
  const [customerName, setCustomerName] = useState('Elena Rostova');
  const [amountUSD, setAmountUSD] = useState(5500);
  const [planId, setPlanId] = useState(siteConfig.whop.finalBalancePlanId);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Alpharetta');
  const [state, setState] = useState('GA');
  const [zip, setZip] = useState('30005');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Vaulted payment method selection
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [discoveredCards, setDiscoveredCards] = useState<any[]>([]);
  const [isLookingUpCards, setIsLookingUpCards] = useState(false);
  const [cardLookupNote, setCardLookupNote] = useState<string | null>(null);

  // Invoices filter
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'open'>('all');

  // Recent leads and invoices lists
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  const lookupCardsForCustomer = async () => {
    if (!customerEmail) return;
    setIsLookingUpCards(true);
    setCardLookupNote(null);
    try {
      const res = await fetch(
        `/api/admin/payment-methods?email=${encodeURIComponent(customerEmail)}&accountId=${siteConfig.whop.accountId}`,
        {
          headers: { 'X-Admin-Token': adminToken },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const cards = data.paymentMethods || [];
        setDiscoveredCards(cards);
        if (cards.length > 0) {
          setPaymentMethodId(cards[0].id);
          setCardLookupNote(`Found ${cards.length} vaulted payment method(s) in Whop.`);
        } else {
          setCardLookupNote('No vaulted cards found for this email. Invoice will send as email link.');
        }
      } else {
        setCardLookupNote('Unable to query payment methods. Check API permissions.');
      }
    } catch {
      setCardLookupNote('Network error looking up customer payment methods.');
    } finally {
      setIsLookingUpCards(false);
    }
  };

  const loadRecentData = async () => {
    setIsLoadingLists(true);
    try {
      const [leadsRes, invRes] = await Promise.all([
        fetch(`/api/admin/leads?accountId=${siteConfig.whop.accountId}`, {
          headers: { 'X-Admin-Token': adminToken },
        }),
        fetch(`/api/admin/invoices?accountId=${siteConfig.whop.accountId}`, {
          headers: { 'X-Admin-Token': adminToken },
        }),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setRecentLeads(data.leads || []);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setRecentInvoices(data.invoices || []);
      }
    } catch (err) {
      console.warn('Error loading admin lists:', err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    loadRecentData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({
          customerEmail,
          customerName,
          accountId: siteConfig.whop.accountId,
          planId,
          amountUSD,
          mode,
          paymentMethodId: mode === 'auto' && paymentMethodId ? paymentMethodId : undefined,
          billingAddress: {
            line1: street,
            city,
            state,
            postalCode: zip,
            country: 'US',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process invoice');
      }

      setResult(data);
      // Reload invoices list
      loadRecentData();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred processing the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header currentPath="/admin" />

      {/* Production Warning Banner */}
      <div className="bg-red-950 text-red-200 border-b border-red-900 px-4 py-2.5 text-xs text-center font-mono">
        <strong className="text-white">DEMO ADMIN TOOL:</strong> This interface demonstrates the Whop Invoices API (Draft, Off-Session Auto-Charge &amp; Hosted Checkout Links). Protect with strict authentication or remove before production deployment.
      </div>

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-700 tracking-wider">
              <span>Whop Invoices API (2026-10-24)</span>
              <span aria-hidden="true">·</span>
              <span>Idempotent Final Balance Billing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Final Balance Invoicing Console
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Bill customers after completion. Auto-charge saved cards off-session or dispatch hosted checkout email links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Shared Secret:</span>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="ADMIN_TOKEN"
              className="px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg w-44"
            />
          </div>
        </div>

        {/* Invoice Generator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <span>Issue Final Balance Invoice</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">POST /invoices</span>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Invoice Successfully Processed!</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500">Invoice ID: </span>
                    <strong className="text-slate-900 select-all">{result.invoiceId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Status: </span>
                    <span className="font-bold uppercase text-emerald-700">{result.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Billed: </span>
                    <span className="font-bold text-slate-900">${result.totalUSD}.00 USD</span>
                  </div>
                  {result.paymentMethodUsed && (
                    <div>
                      <span className="text-slate-500">Card Charged Off-Session: </span>
                      <span className="text-amber-800">{result.paymentMethodUsed}</span>
                    </div>
                  )}
                  {result.checkoutUrl && (
                    <div className="pt-2">
                      <a
                        href={result.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded font-sans text-xs hover:bg-slate-800"
                      >
                        Open Hosted Whop Checkout Link
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 italic border-t border-emerald-200/60 pt-2">
                  {result.message}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-5 text-xs">
              {/* Mode Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">
                  Billing Mode:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('auto')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                      mode === 'auto'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold">Mode "auto" (Auto-Charge)</span>
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className={`text-[10px] ${mode === 'auto' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Attaches saved payment_method_id and charges off-session via POST /invoices/issue
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                      mode === 'manual'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold">Mode "manual" (Email Link)</span>
                      <Send className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className={`text-[10px] ${mode === 'manual' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Generates draft and sends hosted pay link via POST /invoices/send
                    </span>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Card Vault Discovery (Mode: auto) */}
              {mode === 'auto' && (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                      Vaulted Payment Method Discovery
                    </span>
                    <button
                      type="button"
                      onClick={lookupCardsForCustomer}
                      disabled={isLookingUpCards || !customerEmail}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 transition-colors flex items-center gap-1"
                    >
                      {isLookingUpCards ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Searching Whop Vault...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>Look Up Saved Cards</span>
                        </>
                      )}
                    </button>
                  </div>

                  {cardLookupNote && (
                    <p className="text-[11px] text-slate-500 italic">{cardLookupNote}</p>
                  )}

                  {discoveredCards.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {discoveredCards.map((card) => {
                        const isSelected = paymentMethodId === card.id;
                        return (
                          <div
                            key={card.id}
                            onClick={() => setPaymentMethodId(card.id)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-semibold'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-amber-600" />
                              <span>
                                {card.card?.brand?.toUpperCase() || 'CARD'} •••• {card.card?.last4 || '4242'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">({card.id})</span>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!discoveredCards.length && !cardLookupNote && (
                    <p className="text-[11px] text-slate-400">
                      Click "Look Up Saved Cards" to find previously vaulted payment methods from project deposits.
                    </p>
                  )}
                </div>
              )}

              {/* Plan ID & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Whop Plan / Variant ID</label>
                  <input
                    type="text"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    placeholder="plan_REPLACE_ME_FINAL_BALANCE"
                    className="w-full px-3 py-2 text-sm font-mono bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Due ($ USD)</label>
                  <input
                    type="number"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Billing Address (required for tax calculation) */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Billing Address (Whop Tax Requirement)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-12">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (e.g. GA)"
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Communicating with Whop Invoices API...
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'auto'
                          ? `Auto-Charge Saved Card ($${amountUSD.toLocaleString()})`
                          : `Create & Email Hosted Checkout Link ($${amountUSD.toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Sends <code className="font-mono text-slate-800">Api-Version-Date: 2026-10-24</code> and UUID <code className="font-mono text-slate-800">Idempotency-Key</code>.
              </p>
            </form>
          </div>

          {/* Right Column: Recent Activity from Whop (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recent Invoices Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-900 text-sm">Recent Whop Invoices</span>
                </div>
                <button
                  type="button"
                  onClick={loadRecentData}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Refresh lists"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLists ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {recentInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No invoices recorded yet.</p>
                ) : (
                  recentInvoices.map((inv, idx) => (
                    <div
                      key={inv.id || idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-800">{inv.number || inv.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>{inv.customer_name || inv.email_address}</span>
                        <span className="font-bold">
                          ${inv.amount_due?.amount ? (inv.amount_due.amount / 100).toFixed(2) : '5,500.00'} USD
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Leads Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-900 text-sm">Recent Whop CRM Leads</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">POST /leads</span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {recentLeads.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No leads recorded yet.</p>
                ) : (
                  recentLeads.map((ld, idx) => (
                    <div
                      key={ld.id || idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">
                          {ld.metadata?.customer_name || 'Anonymous Lead'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ld.created_at ? new Date(ld.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p>{ld.metadata?.customer_email} · {ld.metadata?.customer_phone}</p>
                        <p className="text-slate-500 truncate">
                          {ld.metadata?.property_street}, {ld.metadata?.property_city}
                        </p>
                      </div>
                    </div>
                  ))
                )}
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
