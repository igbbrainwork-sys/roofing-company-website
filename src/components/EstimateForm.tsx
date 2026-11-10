import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { siteConfig } from '../site.config.js';
import { trackEstimateRequested } from '../lib/track.js';
import { estimateFormSchema } from '../lib/schemas.js';
import { apiRequest } from '../lib/api-client.js';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  service: string;
  roofAge: string;
  message?: string;
  consent: boolean;
  hp_field?: string;
}

export const EstimateForm: React.FC = () => {
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: siteConfig.serviceArea.states[0] ? 'GA' : 'GA',
    zip: '',
    service: siteConfig.services[0].slug,
    roofAge: '11-15 years',
    message: '',
    consent: true,
    hp_field: '',
  });

  // Track initial render timestamp to catch instant bot submissions (< 2s)
  const [formLoadTimestamp, setFormLoadTimestamp] = useState<number>(0);
  useEffect(() => {
    setFormLoadTimestamp(Date.now());
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    leadId: string;
    message: string;
    isMock?: boolean;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const payloadToValidate = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      service: formData.service,
      roofAge: formData.roofAge,
      message: formData.message,
      consent: formData.consent,
      accountId: siteConfig.whop.accountId,
      referrer: typeof window !== 'undefined' ? window.location.href : '',
      hp_field: formData.hp_field,
      formLoadTimestamp,
    };

    const validation = estimateFormSchema.safeParse(payloadToValidate);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      (validation.error as any).issues.forEach((err: any) => {
        const fieldKey = err.path.join('.');
        // Map address fields to flat input names for form rendering
        const formInputName = err.path[0] === 'address' && err.path[1] ? err.path[1] : err.path[0];
        if (formInputName) {
          fieldErrors[formInputName as string] = err.message;
        } else {
          fieldErrors[fieldKey] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<{
        leadId: string;
        message: string;
        isMock?: boolean;
      }>('/api/estimate', {
        method: 'POST',
        body: JSON.stringify(validation.data),
      });

      if (!response.ok || !response.data) {
        if (response.errors) {
          setErrors(response.errors);
        }
        throw new Error(response.message || 'Failed to submit estimate request');
      }

      setSubmitSuccess({
        leadId: response.data.leadId,
        message: response.data.message || 'Estimate request logged directly with Whop CRM.',
        isMock: response.data.isMock,
      });

      // Fire whop pixel estimate_requested custom event ONLY in success handler
      const matchedService = siteConfig.services.find((s) => s.slug === formData.service);
      trackEstimateRequested({
        service: formData.service,
        startingPrice: matchedService?.startingPrice,
        leadId: response.data.leadId,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="estimate" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            05. Request An On-Site Estimate
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Get an Itemized Xactimate® Quote for Your Property.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            No high-pressure sales. Our master inspectors provide comprehensive damage reports and insurance-ready bids within 24 hours.
          </p>
        </div>

        {submitSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Estimate Request Received!
            </h3>

            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
              Your inquiry has been registered in Whop CRM under reference:{' '}
              <span className="font-mono font-bold text-slate-900">{submitSuccess.leadId}</span>.
              A senior estimator has been assigned and will call you at{' '}
              <span className="font-semibold text-slate-900">{formData.phone}</span>.
            </p>

            {submitSuccess.isMock && (
              <p className="text-xs text-amber-800 bg-amber-100/70 py-1.5 px-3 rounded-lg max-w-md mx-auto">
                Demo Notice: Whop Leads API was simulated because API credentials or account ID are placeholders.
              </p>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(null);
                  setFormData((prev) => ({ ...prev, message: '' }));
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6"
          >
            {/* Honeypot field (hidden from real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="hp_field">Do not fill this field</label>
              <input
                id="hp_field"
                type="text"
                name="hp_field"
                value={formData.hp_field}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Robert Vance"
                  aria-invalid={!!errors.name}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="robert@example.com"
                  aria-invalid={!!errors.email}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                />
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(404) 555-0199 or +14045550199"
                  aria-invalid={!!errors.phone}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                    errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="service" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Service Needed <span className="text-rose-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {siteConfig.services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Address */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Property Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-12">
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street Address (e.g. 4200 North Highland Ave)"
                    aria-invalid={!!errors.street}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                      errors.street ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                  />
                  {errors.street && <p className="text-[11px] text-rose-600 mt-1">{errors.street}</p>}
                </div>

                <div className="sm:col-span-5">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City (e.g. Atlanta)"
                    aria-invalid={!!errors.city}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                      errors.city ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                  />
                  {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                </div>

                <div className="sm:col-span-4">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    aria-label="State"
                    className="w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="GA">Georgia (GA)</option>
                    <option value="TN">Tennessee (TN)</option>
                    <option value="NC">North Carolina (NC)</option>
                    <option value="AL">Alabama (AL)</option>
                    <option value="FL">Florida (FL)</option>
                    <option value="SC">South Carolina (SC)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP Code (e.g. 30306)"
                    aria-invalid={!!errors.zip}
                    className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border ${
                      errors.zip ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-slate-900`}
                  />
                  {errors.zip && <p className="text-[11px] text-rose-600 mt-1">{errors.zip}</p>}
                </div>
              </div>
            </div>

            {/* Approximate Roof Age */}
            <div>
              <label htmlFor="roofAge" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approximate Roof Age
              </label>
              <select
                id="roofAge"
                name="roofAge"
                value={formData.roofAge}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="0-5 years">0 - 5 Years (Recent Installation)</option>
                <option value="6-10 years">6 - 10 Years</option>
                <option value="11-15 years">11 - 15 Years (Mid-Life Assessment)</option>
                <option value="16-20 years">16 - 20 Years (Likely Replacement Candidate)</option>
                <option value="20+ years">20+ Years (End of Life)</option>
                <option value="unknown">Unknown / Recent Home Purchase</option>
              </select>
            </div>

            {/* Message / Description */}
            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Observed Damage, Leaks, or Special Instructions (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe visible shingle loss, interior water staining, skylight leaks, or insurance adjuster dates..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I authorize {siteConfig.brand.name} to contact me via phone, email, or SMS regarding this estimate request. We respect your privacy and never sell customer data.
                </span>
              </label>
              {errors.consent && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.consent}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center px-6 py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transmitting to Whop CRM...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Estimate Request to Whop
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transmitted securely via Whop Leads API · Pinned Api-Version-Date 2026-10-24</span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
