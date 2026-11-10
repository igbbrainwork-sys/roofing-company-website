import React, { useEffect } from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <Shield className="w-5 h-5 text-amber-600" />
            ) : (
              <FileText className="w-5 h-5 text-amber-600" />
            )}
            <h2 id="legal-modal-title" className="text-lg font-bold text-slate-900">
              {type === 'privacy' ? 'Customer Privacy Policy' : 'Contractor Terms of Service'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-slate-900">
                1. Information We Collect
              </p>
              <p>
                {siteConfig.brand.name} collects customer property addresses, contact phone numbers, email addresses, and roof inspection notes strictly for providing estimates, scheduling inspections, and fulfilling roofing construction contracts.
              </p>

              <p className="font-semibold text-slate-900">
                2. Whop Payments &amp; Data Security
              </p>
              <p>
                All payment card credentials, deposits, and billing transactions are securely vaulted and processed directly through Whop Payments (Level 1 PCI-DSS certified). We never store raw card numbers, CVVs, or bank account credentials on our internal servers.
              </p>

              <p className="font-semibold text-slate-900">
                3. TCPA &amp; Communications Consent
              </p>
              <p>
                By requesting an estimate through this site, you authorize our dispatch desk to contact you via telephone call or SMS regarding your roof inspection. We will never sell or rent your personal information to third-party marketing companies.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-900">
                1. Scope of Estimates &amp; Inspections
              </p>
              <p>
                All initial drone and infrared inspections ($149) provide a comprehensive 28-point photographic damage audit. If you approve an estimate over $500 with {siteConfig.brand.name}, 100% of this inspection fee is credited directly onto your invoice.
              </p>

              <p className="font-semibold text-slate-900">
                2. Project Booking Deposits ($500) &amp; Card on File
              </p>
              <p>
                Project deposits lock in your crew installation date and wholesale shingle pricing. Paying the deposit vaults your payment method with Whop for the off-session billing of your project's final balance upon completed municipal inspection and homeowner signoff.
              </p>

              <p className="font-semibold text-slate-900">
                3. Warranties &amp; Licensing
              </p>
              <p>
                Full roof replacements include our 50-year manufacturer-backed Golden Pledge non-prorated system warranty. Work is conducted in compliance with municipal building codes under {siteConfig.brand.licenseNumber}.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
