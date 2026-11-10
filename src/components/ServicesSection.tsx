import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  SearchCheck,
  Sparkles,
  Check,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';
import { siteConfig, RoofingService } from '../site.config.js';
import { trackServiceViewed } from '../lib/track.js';

const iconMap = {
  ShieldCheck,
  Wrench,
  SearchCheck,
  Sparkles,
  CloudRain: Wrench,
  Hammer: Wrench,
};

export const ServicesSection: React.FC = () => {
  const [activeModalService, setActiveModalService] = useState<RoofingService | null>(null);
  const observedServicesRef = useRef<Set<string>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // IntersectionObserver to fire service_viewed once per service per session
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute('data-service-slug');
            if (slug && !observedServicesRef.current.has(slug)) {
              observedServicesRef.current.add(slug);
              trackServiceViewed(slug, 'scroll');
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleServiceClick = (service: RoofingService) => {
    trackServiceViewed(service.slug, 'click');
    setActiveModalService(service);
  };

  return (
    <section id="services" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            01. Structural Capabilities &amp; Services
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Commercial &amp; Residential Roofing Systems Built for US Weather.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Every project is backed by manufacturer master certifications, dedicated on-site foremen, and digital progress tracking via Whop.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {siteConfig.services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || ShieldCheck;
            // First service spans 7 cols on desktop, second spans 5 cols for asymmetric bento feel
            const colSpan = index === 0 ? 'lg:col-span-7' : index === 1 ? 'lg:col-span-5' : 'lg:col-span-6';

            return (
              <div
                key={service.slug}
                ref={(el) => { cardRefs.current[index] = el; }}
                data-service-slug={service.slug}
                className={`${colSpan} bg-white rounded-xl border border-slate-200 p-7 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                      <IconComponent className="w-5 h-5 text-amber-600" />
                    </div>
                    {service.startingPrice && (
                      <span className="text-xs font-semibold text-slate-500 tabular-nums">
                        Starting from ${service.startingPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {service.blurb}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {service.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleServiceClick(service)}
                    className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    View Engineering Specs
                  </button>

                  {service.featuredPlan ? (
                    <a
                      href={`/checkout/${service.featuredPlan}`}
                      onClick={() => trackServiceViewed(service.slug, 'click')}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Book Now
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </a>
                  ) : (
                    <a
                      href="/#estimate"
                      onClick={() => trackServiceViewed(service.slug, 'click')}
                      className="inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors"
                    >
                      Get Estimate
                      <ArrowRight className="w-3 h-3 ml-1.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engineering Specs Detail Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveModalService(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
              <span>Engineering Specification</span>
              <span aria-hidden="true">·</span>
              <span>GAF Master Elite Standard</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {activeModalService.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {activeModalService.detailedDescription || activeModalService.blurb}
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-5 border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-900 mb-2">Included In This Scope:</p>
              <ul className="space-y-1.5">
                {activeModalService.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              {activeModalService.featuredPlan ? (
                <a
                  href={`/checkout/${activeModalService.featuredPlan}`}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Proceed to Whop Checkout
                </a>
              ) : (
                <a
                  href="/#estimate"
                  onClick={() => setActiveModalService(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  Request On-Site Estimate
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
