import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, ZoomIn, ArrowRight } from 'lucide-react';
import { trackWhopEvent } from '../lib/track.js';

interface ShowcaseItem {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  image: string;
  category: 'audit' | 'restoration' | 'metal';
  badge: string;
  points: { title: string; desc: string }[];
  insuranceTip?: string;
}

const SHOWCASES: ShowcaseItem[] = [
  {
    id: 'hail_damage',
    tabLabel: '01. Hail & Wind Forensic Audit',
    title: 'Severe Storm Impact & Fracture Documentation',
    subtitle: 'High-velocity hail spatter ruptures the underlying fiberglass matting, destroying waterproofing.',
    image: '/src/assets/images/roof_storm_damage_audit_1794315228015.jpg',
    category: 'audit',
    badge: 'Forensic Audit Sample',
    points: [
      {
        title: 'Bruised Fiberglass Matting',
        desc: 'Hail stones compress mineral granules into asphalt, causing micro-fractures that leak over time.',
      },
      {
        title: 'Wind-Lifted Seal Failure',
        desc: 'Sustained 60+ MPH gusts break thermal bonding adhesives, allowing wind-driven rain under tabs.',
      },
      {
        title: 'Contractor Forensic Chalking',
        desc: 'Documented 10ft x 10ft test squares formatted specifically for insurance adjuster approvals.',
      },
    ],
    insuranceTip:
      'Adjuster Walkthrough Tip: Hail damage is often invisible from the ground. Our 4K drone audit logs verifiable slope damage before adjuster deadlines lapse.',
  },
  {
    id: 'architectural_shingle',
    tabLabel: '02. Complete Class-4 Restoration',
    title: 'GAF Master Elite® Class-4 Architectural Replacement',
    subtitle: 'Turnkey full deck strip, synthetic moisture barrier, and impact-resistant shingles.',
    image: '/src/assets/images/roofing_hero_craftsman_1794307300936.jpg',
    category: 'restoration',
    badge: 'Master Elite Craftsmanship',
    points: [
      {
        title: 'Self-Adhered Valley Ice & Water Shield',
        desc: 'High-temperature polymer membrane installed in all valleys, eaves, and chimney crickets.',
      },
      {
        title: 'Ridge Vent Continuous Airflow System',
        desc: 'Equalized intake and exhaust ventilation to reduce summer attic heat loads by up to 25°F.',
      },
      {
        title: '50-Year Golden Pledge® Non-Prorated Warranty',
        desc: 'Direct manufacturer coverage for 100% of material, labor, and tear-off costs.',
      },
    ],
    insuranceTip:
      'Insurance Premium Discount: Installing Class-4 UL 2218 impact shingles qualifies homeowners for up to a 28% discount on annual hazard premiums.',
  },
  {
    id: 'standing_seam_metal',
    tabLabel: '03. Architectural Standing Seam Metal',
    title: 'Lifetime 24-Gauge Concealed Fastener Metal Envelope',
    subtitle: 'Engineered for 140+ MPH hurricane wind resistance and modern architectural durability.',
    image: '/src/assets/images/roof_standing_seam_metal_1794315228287.jpg',
    category: 'metal',
    badge: 'Lifetime Metal Engineering',
    points: [
      {
        title: 'Concealed Fastener Clip System',
        desc: 'Expansion clips allow thermal movement without exposing screw heads or rubber washers to UV degradation.',
      },
      {
        title: 'Kynar 500® Fluoropolymer Finish',
        desc: 'High-solar reflectivity pigments resist fading, chalking, and coastal humidity corrosion for 40+ years.',
      },
      {
        title: 'Class A Fire & Impact Resistance',
        desc: 'Highest possible non-combustible building code classification for wildfire and severe weather zones.',
      },
    ],
    insuranceTip:
      'Commercial & High-End Residential: Metal roofing increases home appraisal resale values while lowering summer cooling costs.',
  },
];

export const CraftsmanshipShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(SHOWCASES[0].id);

  const activeItem = SHOWCASES.find((s) => s.id === activeTab) || SHOWCASES[0];

  const handleTabSwitch = (id: string) => {
    setActiveTab(id);
    trackWhopEvent('showcase_tab_switched', { showcaseId: id });
  };

  return (
    <section id="craftsmanship" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              04. Forensic Proof &amp; Craftsmanship
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
              Forensic Damage Audits vs. Master Elite Installation.
            </h2>
            <p className="text-base text-slate-600 mt-2">
              See the exact difference between hidden storm fractures and our certified replacement standard.
            </p>
          </div>

          {/* Interactive segmented tab bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl overflow-x-auto shrink-0">
            {SHOWCASES.map((item) => {
              const isSelected = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSwitch(item.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Showcase Container */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Image visual with contrast scrim (col-span-6) */}
          <div className="lg:col-span-6 relative bg-slate-950 aspect-[16/10] lg:aspect-auto min-h-[360px] group">
            <img
              src={activeItem.image}
              alt={activeItem.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono font-semibold">
              {activeItem.badge}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
              <p className="font-semibold">{activeItem.title}</p>
              <p className="text-slate-300 text-[11px] mt-0.5">{activeItem.subtitle}</p>
            </div>
          </div>

          {/* Technical Explanations (col-span-6) */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-700 mb-2">
                <span>Certified Engineering Standard</span>
                <span aria-hidden="true">·</span>
                <span>Xactimate® Line Item Compliance</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {activeItem.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {activeItem.subtitle}
              </p>

              <div className="space-y-4">
                {activeItem.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 text-xs block mb-0.5">
                        {pt.title}
                      </strong>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {pt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance tip callout */}
            {activeItem.insuranceTip && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">
                  Adjuster &amp; Insurance Insight:
                </span>
                {activeItem.insuranceTip}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/#estimate"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Request Forensic Inspection
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
              <a
                href="/checkout/inspection"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors"
              >
                Book Online ($149)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
