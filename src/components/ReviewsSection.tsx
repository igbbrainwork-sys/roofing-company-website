import React from 'react';
import { Star, ShieldCheck, Award, FileCheck, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Aggregate Rating */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              03. Audited Homeowner Proof &amp; Warranty Backing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
              Proven Execution. Verified Results.
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Every review corresponds to a completed municipal roof permit and post-construction drone signoff.
            </p>
          </div>

          {/* Rating Summary Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-6 shrink-0">
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-amber-500" />
                ))}
              </div>
              <p className="text-2xl font-black text-slate-900 tabular-nums">
                {siteConfig.reviews.aggregate.score}{' '}
                <span className="text-xs font-medium text-slate-500">
                  / {siteConfig.reviews.aggregate.scale.toFixed(1)}
                </span>
              </p>
            </div>
            <div className="border-l border-slate-200 pl-6 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">
                {siteConfig.reviews.aggregate.reviewCount} Audited Projects
              </p>
              <p className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {siteConfig.reviews.aggregate.verifiedPercentage}% Verified Homeowners
              </p>
              <p className="text-slate-400">Zero Unresolved Complaints</p>
            </div>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {siteConfig.reviews.items.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                    ))}
                  </div>
                  {/* Unboxed clean metadata (anti-slop rule) */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{review.city}, {review.state}</span>
                    <span aria-hidden="true">·</span>
                    <span>{review.date}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  "{review.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{review.name}</p>
                  <p className="text-slate-500 text-[11px]">{review.projectType}</p>
                </div>
                <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Completion
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges & Insurance Proof Strip */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {siteConfig.trust.badges.map((badge, bIdx) => (
              <div key={bIdx} className="space-y-1.5">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  {badge.highlight}
                </span>
                <p className="text-base font-bold text-white">{badge.title}</p>
                <p className="text-xs text-slate-400">{badge.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">50-Year Golden Pledge® Warranty:</strong>
                {siteConfig.trust.warrantyCopy}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Insurance &amp; Bonding Guarantee:</strong>
                {siteConfig.trust.insuranceCopy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
