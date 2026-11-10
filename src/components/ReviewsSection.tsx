import React, { useState, useEffect, useRef } from 'react';
import { Star, Award, FileCheck, CheckCircle2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const ReviewsSection: React.FC = () => {
  const reviews = siteConfig.reviews.items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance reviews carousel every 6 seconds if playing and not hovered
  useEffect(() => {
    // If reduced motion is preferred, default to paused
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, reviews.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

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

        {/* Accessible Reviews Carousel */}
        <div
          role="region"
          aria-label="Homeowner Reviews Carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          className="relative bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-10 mb-16 shadow-xs"
        >
          {siteConfig.isSample && (
            <div className="absolute top-4 right-4 bg-amber-100/80 border border-amber-300 text-amber-900 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold">
              Sample Case Studies
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Stars & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-amber-500" />
                ))}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                <span>{reviews[currentIndex].city}, {reviews[currentIndex].state}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>{reviews[currentIndex].date}</span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic">
              "{reviews[currentIndex].text}"
            </blockquote>

            {/* Customer identity */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{reviews[currentIndex].name}</p>
                <p className="text-slate-500 text-xs">{reviews[currentIndex].projectType}</p>
              </div>
              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Verified Municipal Inspection Signoff
              </span>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 max-w-3xl mx-auto">
            {/* Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Review select">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to review ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === idx ? 'w-6 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Play/Pause & Arrow buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause automatic carousel advance' : 'Resume automatic carousel advance'}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous review"
                className="p-2 rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next review"
                className="p-2 rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
