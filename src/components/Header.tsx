import React, { useState } from 'react';
import { Phone, Menu, X, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../site.config.js';

interface HeaderProps {
  currentPath?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPath = '/' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Single text element, no badges attached) */}
          <a
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors"
          >
            {siteConfig.brand.name}
          </a>

          {/* Zone 2: Navigation Links (single line, no capsules) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="/#services" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Services
            </a>
            <a href="/#calculator" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Calculator
            </a>
            <a href="/#craftsmanship" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Forensic Proof
            </a>
            <a href="/#service-area" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Service Area
            </a>
            <a href="/#pricing" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Book Online
            </a>
          </nav>

          {/* Zone 3: Primary Actions (Phone CTA & Estimate Button) */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <a
              href={`tel:${siteConfig.brand.phone}`}
              className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-amber-600 transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{siteConfig.brand.phoneFormatted}</span>
            </a>

            <a
              href="/#estimate"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              Request an Estimate
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={`tel:${siteConfig.brand.phone}`}
              className="p-2 text-slate-700 hover:text-amber-600"
              aria-label="Call Apex Roofing"
            >
              <Phone className="w-5 h-5 text-amber-600" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Services
            </a>
            <a
              href="/#service-area"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Service Area
            </a>
            <a
              href="/#financing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Financing
            </a>
            <a
              href="/#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Reviews & Proof
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Book Online & Pricing
            </a>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              FAQ
            </a>
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              Admin Demo Tool <ArrowUpRight className="w-3 h-3" />
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="/#estimate"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Request Free Estimate
            </a>
            <a
              href={`tel:${siteConfig.brand.phone}`}
              className="w-full text-center px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Call {siteConfig.brand.phoneFormatted}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
