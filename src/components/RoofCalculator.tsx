import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, DollarSign, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { trackWhopEvent } from '../lib/track.js';
import { siteConfig } from '../site.config.js';

interface MaterialOption {
  id: string;
  name: string;
  costPerSquare: number;
  warrantyYears: number;
  impactRating: string;
  description: string;
  image?: string;
  serviceSlug: string;
}

const MATERIALS: MaterialOption[] = [
  {
    id: 'arch_shingles',
    name: 'Class-3 Architectural Shingles',
    costPerSquare: 420,
    warrantyYears: 30,
    impactRating: 'Class 3 (110 MPH Wind)',
    description: 'GAF Timberline HDZ / Owens Corning Oakridge dimensional shingles.',
    serviceSlug: 'complete-replacement',
  },
  {
    id: 'class4_impact',
    name: 'Class-4 Hail Impact Shingles',
    costPerSquare: 510,
    warrantyYears: 50,
    impactRating: 'Class 4 (UL 2218 Hail Impact)',
    description: 'SBS-modified asphalt shingles engineered to withstand 2-inch hail stones.',
    serviceSlug: 'complete-replacement',
  },
  {
    id: 'standing_seam',
    name: 'Standing Seam Metal (24-Gauge)',
    costPerSquare: 980,
    warrantyYears: 50,
    impactRating: 'Class 4 Impact & Class A Fire',
    description: 'Concealed fastener architectural standing seam panels with Kynar 500 finish.',
    serviceSlug: 'complete-replacement',
  },
];

export const RoofCalculator: React.FC = () => {
  const [homeSqFt, setHomeSqFt] = useState<number>(2400);
  const [pitchMultiplier, setPitchMultiplier] = useState<number>(1.25); // Standard 6/12 pitch
  const [pitchLabel, setPitchLabel] = useState<string>('Standard (6/12 Slope)');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('class4_impact');
  const [layersToTearOff, setLayersToTearOff] = useState<number>(1);

  const selectedMaterial = useMemo(
    () => MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[1],
    [selectedMaterialId]
  );

  // Calculation: Roof sqft is ground footprint * pitch factor + 10% waste
  const calculation = useMemo(() => {
    const roofAreaSqFt = Math.round(homeSqFt * pitchMultiplier * 1.12);
    const roofSquares = Math.round(roofAreaSqFt / 100);
    const tearOffCost = roofSquares * (layersToTearOff * 55);
    const materialCost = roofSquares * selectedMaterial.costPerSquare;
    const estimatedTotal = materialCost + tearOffCost;
    const estimatedLow = Math.round(estimatedTotal * 0.94);
    const estimatedHigh = Math.round(estimatedTotal * 1.08);

    // Estimated monthly installment at 0% or low APR financing
    const estimatedMonthly = Math.round(estimatedTotal / 60);

    return {
      roofAreaSqFt,
      roofSquares,
      estimatedLow,
      estimatedHigh,
      estimatedTotal,
      estimatedMonthly,
    };
  }, [homeSqFt, pitchMultiplier, selectedMaterial, layersToTearOff]);

  const handleApplyToEstimate = () => {
    trackWhopEvent('calculator_estimate_applied', {
      homeSqFt,
      roofSquares: calculation.roofSquares,
      material: selectedMaterial.name,
      estimatedTotal: calculation.estimatedTotal,
    });

    const estimateSection = document.getElementById('estimate');
    if (estimateSection) {
      estimateSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="calculator" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            03. Interactive Roof Cost Estimator
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Estimate Your Project Scope &amp; Monthly Terms in Real Time.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Calculate estimated square footage, tear-off costs, and material upgrades. Financing terms powered by Whop checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Box (col-span-7) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Square footage slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Home Living Area (Square Feet)
                </label>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {homeSqFt.toLocaleString()} sq. ft.
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={homeSqFt}
                onChange={(e) => setHomeSqFt(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1,000 sq ft</span>
                <span>2,500 sq ft</span>
                <span>5,000 sq ft</span>
              </div>
            </div>

            {/* Roof Pitch / Slope Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Roof Pitch &amp; Complexity
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Low Slope (4/12)', factor: 1.15 },
                  { label: 'Standard (6/12 - 8/12)', factor: 1.25 },
                  { label: 'Steep / Multi-Gable', factor: 1.45 },
                ].map((item) => {
                  const isSelected = pitchMultiplier === item.factor;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setPitchMultiplier(item.factor);
                        setPitchLabel(item.label);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-colors ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-bold truncate">{item.label}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.factor === 1.15 ? 'Walkable pitch' : item.factor === 1.25 ? 'Average slope' : 'Harness required'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Shingle &amp; Material Grade
              </label>
              <div className="space-y-2.5">
                {MATERIALS.map((mat) => {
                  const isSelected = selectedMaterialId === mat.id;
                  return (
                    <div
                      key={mat.id}
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-white ring-1 ring-amber-500 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{mat.name}</span>
                        <span className="text-xs font-mono font-bold text-amber-700">
                          ${mat.costPerSquare}/square
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{mat.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span>{mat.warrantyYears}-Year System Warranty</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-semibold">{mat.impactRating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Existing Layers Tear-off */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Existing Shingle Layers:</span>
                <span className="text-slate-500 text-[11px]">Includes disposal, dumpster &amp; magnet sweep</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map((layers) => (
                  <button
                    key={layers}
                    type="button"
                    onClick={() => setLayersToTearOff(layers)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      layersToTearOff === layers
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {layers} {layers === 1 ? 'Layer' : 'Layers'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Calculation Summary Card (col-span-5) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Forensic Estimate Preview
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Approx. {calculation.roofSquares} Roofing Squares ({calculation.roofAreaSqFt.toLocaleString()} sq. ft.)
                </p>
              </div>
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>

            {/* Estimated Total Range */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Estimated Full Replacement Cost:</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                  ${calculation.estimatedLow.toLocaleString()} – ${calculation.estimatedHigh.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Includes architectural tear-off, synthetic underlayment, ice &amp; water shield valleys, ventilation, and cleanup.
              </p>
            </div>

            {/* Financing Term Callout */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Flexible Whop Installments:</span>
                <span className="text-amber-400 font-bold tabular-nums">
                  From ~${calculation.estimatedMonthly}/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Eligible homeowners can finance with 0% promotional APR or low fixed monthly installments through Whop Checkout.
              </p>
            </div>

            {/* Key Inclusions */}
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50-Year Golden Pledge® Manufacturer Non-Prorated Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Complimentary replacement of up to 3 damaged decking panels</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>$500 Deposit locks crew calendar &amp; wholesale shingle pricing</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleApplyToEstimate}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <span>Apply Specs to Free On-Site Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="/checkout/deposit"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs border border-slate-700"
              >
                <span>Lock Calendar with $500 Deposit</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
