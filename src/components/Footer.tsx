import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../site.config.js';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-lg font-bold text-white tracking-tight">
              {siteConfig.brand.name}
            </p>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              {siteConfig.brand.tagline}. Fully licensed, insured, and certified master roofing contractor operating across the Southeastern US.
            </p>
            <div className="space-y-1.5 text-slate-300">
              <p className="font-mono text-slate-400">{siteConfig.brand.licenseNumber}</p>
              <p className="text-slate-400">{siteConfig.brand.hours}</p>
            </div>
          </div>

          {/* Direct Navigation (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-white font-bold uppercase tracking-wider text-[11px]">
              Contractor Solutions
            </p>
            <ul className="space-y-2">
              {siteConfig.services.map((service) => (
                <li key={service.slug}>
                  <a href={`/#services`} className="hover:text-white transition-colors">
                    {service.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="/checkout/inspection" className="hover:text-white transition-colors">
                  Book Forensic Inspection ($149)
                </a>
              </li>
              <li>
                <a href="/checkout/deposit" className="hover:text-white transition-colors">
                  Lock Project Deposit ($500)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Dispatch (col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-white font-bold uppercase tracking-wider text-[11px]">
              Headquarters &amp; Dispatch
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  {siteConfig.brand.address.street}, {siteConfig.brand.address.city},{' '}
                  {siteConfig.brand.address.state} {siteConfig.brand.address.zip}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${siteConfig.brand.phone}`} className="text-white font-bold hover:underline">
                  {siteConfig.brand.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${siteConfig.brand.email}`} className="hover:text-white">
                  {siteConfig.brand.email}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/admin"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Contractor Admin Portal <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.brand.name}. All rights reserved. Built for Whop Websites.
          </p>
          <div className="flex items-center gap-4">
            <span>Powered by Whop Payments</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              PCI-DSS Level 1 Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
