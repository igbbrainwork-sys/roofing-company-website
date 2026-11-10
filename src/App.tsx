import React, { useEffect, useState } from 'react';
import { siteConfig } from './site.config.js';
import { PlaceholderBanner } from './components/PlaceholderBanner.js';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { ServicesSection } from './components/ServicesSection.js';
import { RoofCalculator } from './components/RoofCalculator.js';
import { CraftsmanshipShowcase } from './components/CraftsmanshipShowcase.js';
import { ServiceAreaSection } from './components/ServiceAreaSection.js';
import { FinancingSection } from './components/FinancingSection.js';
import { ReviewsSection } from './components/ReviewsSection.js';
import { PricingSection } from './components/PricingSection.js';
import { EstimateForm } from './components/EstimateForm.js';
import { FaqSection } from './components/FaqSection.js';
import { Footer } from './components/Footer.js';
import { MobileBottomBar } from './components/MobileBottomBar.js';
import { EventsDebugDrawer } from './components/EventsDebugDrawer.js';
import { CheckoutPage } from './routes/CheckoutPage.js';
import { CheckoutReturnPage } from './routes/CheckoutReturnPage.js';
import { AdminPage } from './routes/AdminPage.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept navigation links that point to /checkout, /admin, etc.
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && (href.startsWith('/checkout') || href.startsWith('/admin') || href === '/')) {
        // Allow anchor jumps on the same page
        if (href.includes('#') && href.startsWith(window.location.pathname)) {
          return;
        }

        e.preventDefault();
        window.history.pushState({}, '', href);
        setCurrentPath(href.split('#')[0]);

        // If there is an anchor, smooth scroll to it
        if (href.includes('#')) {
          const hash = href.split('#')[1];
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // Inject LocalBusiness + RoofingContractor Schema.org JSON-LD structured data from siteConfig
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'RoofingContractor',
      'name': siteConfig.brand.name,
      'description': siteConfig.brand.tagline,
      'telephone': siteConfig.brand.phone,
      'email': siteConfig.brand.email,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': siteConfig.brand.address.street,
        'addressLocality': siteConfig.brand.address.city,
        'addressRegion': siteConfig.brand.address.state,
        'postalCode': siteConfig.brand.address.zip,
        'addressCountry': siteConfig.brand.address.country,
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': siteConfig.reviews.aggregate.score,
        'reviewCount': siteConfig.reviews.aggregate.reviewCount,
        'bestRating': siteConfig.reviews.aggregate.scale,
      },
      'areaServed': siteConfig.serviceArea.cities.map((city) => ({
        '@type': 'City',
        'name': city,
      })),
      'priceRange': '$$',
      'openingHours': 'Mo-Sa 07:00-19:00',
    };

    let scriptTag = document.getElementById('roofing-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'roofing-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  }, []);

  // Simple client router
  if (currentPath === '/checkout/return') {
    return <CheckoutReturnPage />;
  }

  if (currentPath.startsWith('/checkout')) {
    const planParam = currentPath.replace('/checkout/', '').replace('/checkout', '') || 'inspection';
    return <CheckoutPage planParam={planParam} />;
  }

  if (currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }

  // Root Landing Page
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <PlaceholderBanner />
      <Header currentPath="/" />

      <main className="flex-1">
        <Hero />
        <ServicesSection />
        <RoofCalculator />
        <CraftsmanshipShowcase />
        <ServiceAreaSection />
        <FinancingSection />
        <ReviewsSection />
        <PricingSection />
        <EstimateForm />
        <FaqSection />
      </main>

      <Footer />
      <MobileBottomBar />
      <EventsDebugDrawer />
    </div>
  );
}
