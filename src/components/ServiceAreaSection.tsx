import React, { useState } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const ServiceAreaSection: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>(siteConfig.serviceArea.cities[0]);

  return (
    <section id="service-area" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Cities, States & Dispatch Info */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                02. Regional Operational Footprint
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
                Rapid Emergency Dispatch Across {siteConfig.serviceArea.states.join(', ')}.
              </h2>
              <p className="text-base text-slate-600 mt-3 leading-relaxed">
                {siteConfig.serviceArea.radiusNote}
              </p>
            </div>

            {/* States Supported Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Licensed States:</span>
              {siteConfig.serviceArea.states.map((state, i) => (
                <React.Fragment key={state}>
                  <span>{state}</span>
                  {i < siteConfig.serviceArea.states.length - 1 && <span aria-hidden="true" className="text-slate-400">·</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Municipal Hubs List */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Key Metro Hubs &amp; Service Zones:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {siteConfig.serviceArea.cities.map((city) => {
                  const isSelected = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center justify-between border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{city}</span>
                      <MapPin className={`w-3.5 h-3.5 ml-1 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900 block mb-0.5">
                  Storm Damage Rapid Mobilization
                </span>
                Dispatching from nearest hub to {selectedCity}. Emergency roof stabilization crews maintain loaded equipment trailers on standby 24/7.
              </div>
            </div>
          </div>

          {/* Right Column: CSS/SVG Map Graphic (No External Map Embeds) */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
              {/* Decorative technical grid lines */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                      Regional Coverage Map
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      Southeast Regional Dispatch Quadrant
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>HQ ONLINE</span>
                  </div>
                </div>

                {/* Vector Map Graphic */}
                <div className="relative w-full aspect-[4/3] bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg
                    viewBox="0 0 500 350"
                    className="w-full h-full text-slate-700"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Stylized Southeastern States Outlines */}
                    <path
                      d="M 60 70 L 190 60 L 330 50 L 440 70 L 430 140 L 360 170 L 330 290 L 220 310 L 150 250 L 110 180 Z"
                      className="fill-slate-900 stroke-slate-700"
                      strokeWidth="2"
                    />

                    {/* Regional hub circles & rings */}
                    <circle cx="260" cy="180" r="70" className="stroke-amber-500/20 fill-amber-500/5" strokeDasharray="4 4" />
                    <circle cx="260" cy="180" r="35" className="stroke-amber-500/40 fill-amber-500/10" />
                    <circle cx="260" cy="180" r="6" className="fill-amber-400" />
                    <text x="272" y="184" className="fill-white text-[11px] font-sans font-bold">Atlanta HQ</text>

                    {/* Secondary Hubs */}
                    <circle cx="340" cy="120" r="4" className="fill-emerald-400" />
                    <text x="350" y="124" className="fill-slate-300 text-[9px] font-sans">Greenville</text>

                    <circle cx="240" cy="110" r="4" className="fill-emerald-400" />
                    <text x="175" y="114" className="fill-slate-300 text-[9px] font-sans">Chattanooga</text>

                    <circle cx="290" cy="90" r="4" className="fill-emerald-400" />
                    <text x="300" y="94" className="fill-slate-300 text-[9px] font-sans">Knoxville</text>

                    <circle cx="280" cy="240" r="4" className="fill-emerald-400" />
                    <text x="290" y="244" className="fill-slate-300 text-[9px] font-sans">Macon Hub</text>

                    {/* Connector Flightlines */}
                    <line x1="260" y1="180" x2="340" y2="120" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="260" y1="180" x2="240" y2="110" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="260" y1="180" x2="290" y2="90" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="260" y1="180" x2="280" y2="240" stroke="rgba(217, 119, 6, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>

                  {/* Active selected hub indicator */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-400">Selected Hub: </span>
                    <span className="font-semibold text-amber-400">{selectedCity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-amber-500" />
                    <span>Average On-Site Response: 45 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fully Bonded Municipal Jurisdictions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
