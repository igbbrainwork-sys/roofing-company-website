import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            06. Frequently Asked Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Everything You Need to Know About Billing, Scopes &amp; Whop Payments.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Clear, honest answers regarding our forensic inspection process, deposits, and manufacturer warranties.
          </p>
        </div>

        <div className="space-y-3">
          {siteConfig.faq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  <span className="text-sm sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
