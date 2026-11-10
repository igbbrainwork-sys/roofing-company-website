import React from 'react';
import { ShieldCheck, CalendarCheck, Clock, Award, Star, ArrowRight } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Grid: Value Proposition & High-Fidelity Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Proposition (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed Metadata Kicker (Anti-slop zero pill rule) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-amber-700 uppercase">
              <span>{siteConfig.brand.shortTagline}</span>
              <span aria-hidden="true">·</span>
              <span>License {siteConfig.brand.licenseNumber.split('/')[0]}</span>
              <span aria-hidden="true">·</span>
              <span>{siteConfig.brand.yearsInBusiness} Years Built</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] text-balance">
              Architectural Roofing &amp; Certified Storm Restoration.
            </h1>

            {/* Subtitle / Proposition */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              Precision installation using Class-4 hail impact shingles, drone-verified forensic inspections, and seamless online project booking backed by Whop secure checkout.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="/#estimate"
                className="inline-flex justify-center items-center px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                Request Free Estimate
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>

              <a
                href="/checkout/inspection"
                className="inline-flex justify-center items-center px-6 py-3.5 text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
              >
                Book Inspection (${siteConfig.whop.plans.inspection.priceUSD})
              </a>
            </div>

            {/* Social Proof Line */}
            <div className="pt-4 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                ))}
              </div>
              <span className="font-semibold text-slate-800">
                {siteConfig.reviews.aggregate.score} / {siteConfig.reviews.aggregate.scale}
              </span>
              <span aria-hidden="true">·</span>
              <span>{siteConfig.reviews.aggregate.reviewCount} Verified US Homeowners</span>
              <span aria-hidden="true">·</span>
              <span>100% Whop Protected</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity 16:9 Image Container (col-span-5) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] group">
              <img
                src="/src/assets/images/roofing_hero_craftsman_1794307300936.jpg"
                alt="Architectural asphalt shingle roof on craftsman home"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Quiet caption badge */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span>Class-4 Shingle Installation</span>
                  <span className="text-amber-400 font-semibold">GAF Master Elite®</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  50-Year Non-Prorated Golden Pledge® System Warranty
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item KPI & Trust Strip (Full-Width Row Below Hero Split) */}
        <div className="mt-14 pt-10 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Liability &amp; Bond</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">$2M Insured &amp; Bonded</p>
              <p className="text-xs text-slate-500 mt-0.5">Workers' comp on every tech</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Manufacturer Tier</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">50-Yr System Warranty</p>
              <p className="text-xs text-slate-500 mt-0.5">100% non-prorated labor &amp; material</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Emergency Tarping</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">45-Min Storm Dispatch</p>
              <p className="text-xs text-slate-500 mt-0.5">Rapid leak defense units</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <CalendarCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Checkout Security</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Whop Secure Vault</p>
              <p className="text-xs text-slate-500 mt-0.5">Card-on-file final balance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
