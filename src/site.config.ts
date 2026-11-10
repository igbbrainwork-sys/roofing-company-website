/**
 * Site Configuration for US Roofing Contractor Template
 * 
 * TEMPLATE REUSABILITY CONTRACT:
 * To customize this template for a new roofing client, edit ONLY this file.
 * All branding, services, prices, plans, service areas, contact numbers,
 * warranty copy, and FAQs propagate automatically throughout the application.
 */

import { z } from 'zod';

export interface WhopPlanConfig {
  planId: string;
  productId: string;
  title: string;
  priceUSD: number;
  description: string;
  badge?: string;
  features: string[];
}

export interface RoofingService {
  slug: string;
  title: string;
  blurb: string;
  icon: 'ShieldCheck' | 'Hammer' | 'SearchCheck' | 'Sparkles' | 'CloudRain' | 'Wrench';
  startingPrice?: number;
  bullets: string[];
  featuredPlan?: 'inspection' | 'deposit' | 'flatRate';
  detailedDescription?: string;
}

export interface ReviewItem {
  name: string;
  city: string;
  state: string;
  rating: number;
  text: string;
  date: string;
  projectType: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface SiteConfig {
  /**
   * Set isSample to true when using illustrative demo copy, placeholder license,
   * or sample reviews. Setting this to false activates verified production mode
   * and includes full credentials in Schema.org JSON-LD structured data.
   */
  isSample: boolean;
  motion: {
    intensity: 'full' | 'reduced';
  };
  brand: {
    name: string;
    tagline: string;
    shortTagline: string;
    phone: string;
    phoneFormatted: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    licenseNumber: string;
    yearsInBusiness: number;
    hours: string;
    emergencyAvailable: boolean;
    colors: {
      primary: string; // e.g. slate-900 / navy
      accent: string;  // e.g. amber-600 / gold
      neutral: string;
    };
    fontStack: string;
  };
  whop: {
    accountId: string; // biz_...
    plans: {
      inspection: WhopPlanConfig;
      deposit: WhopPlanConfig;
      flatRate: WhopPlanConfig;
    };
    finalBalancePlanId: string;
    environment: 'production' | 'sandbox';
  };
  services: RoofingService[];
  serviceArea: {
    states: string[];
    cities: string[];
    radiusNote: string;
    dispatchNote: string;
  };
  financing: {
    headline: string;
    body: string;
    learnMoreCopy: string;
    highlights: string[];
  };
  reviews: {
    aggregate: {
      score: number;
      reviewCount: number;
      scale: number;
      verifiedPercentage: number;
    };
    items: ReviewItem[];
  };
  trust: {
    badges: {
      title: string;
      subtitle: string;
      highlight: string;
    }[];
    warrantyCopy: string;
    insuranceCopy: string;
    materialsPartner: string;
  };
  faq: FaqItem[];
}

export const siteConfig: SiteConfig = {
  isSample: true, // Marked as sample content for demo/pitch mode
  motion: {
    intensity: 'full',
  },
  brand: {
    name: "Apex Roofing & Restoration",
    tagline: "Architectural Roofing, Certified Storm Restorations & Commercial Envelopes",
    shortTagline: "Trusted US Certified Master Elite Roofing Contractor",
    phone: "18005557663",
    phoneFormatted: "(800) 555-ROOF",
    email: "estimates@apexroofingrestoration.com",
    address: {
      street: "4200 North Highland Avenue, Suite 300",
      city: "Atlanta",
      state: "GA",
      zip: "30306",
      country: "US",
    },
    licenseNumber: "GA-ROC #894210-B / Insured #POL-9924-US",
    yearsInBusiness: 18,
    hours: "Mon - Sat: 7:00 AM - 7:00 PM EST (24/7 Storm Response Dispatch)",
    emergencyAvailable: true,
    colors: {
      primary: "#0F172A", // Deep Navy / Obsidian
      accent: "#D97706",  // Rich Architectural Amber
      neutral: "#F8FAFC", // Clean Crisp Canvas
    },
    fontStack: "Plus Jakarta Sans, system-ui, sans-serif",
  },

  whop: {
    // Replace with your real Whop Company Account ID (biz_...)
    accountId: (typeof process !== "undefined" && process.env?.VITE_WHOP_ACCOUNT_ID) || "biz_REPLACE_ME",
    plans: {
      inspection: {
        planId: "plan_REPLACE_ME_INSPECTION",
        productId: "prod_REPLACE_ME_INSPECTION",
        title: "Comprehensive Drone & Infrared Roof Inspection",
        priceUSD: 149,
        description: "100% credited toward any repair or replacement contract. Includes certified 28-point forensic report, high-resolution aerial imagery, thermal leak audit, and insurance documentation.",
        badge: "Most Popular First Step",
        features: [
          "4K aerial drone photography of all slopes & flashings",
          "Infrared thermal moisture scan behind shingles",
          "Certified written insurance-grade engineering report",
          "Attic ventilation, decking & insulation check",
          "Full inspection fee credited toward approved repairs",
        ],
      },
      deposit: {
        planId: "plan_REPLACE_ME_DEPOSIT",
        productId: "prod_REPLACE_ME_DEPOSIT",
        title: "Project Booking & Material Lock Deposit",
        priceUSD: 500,
        description: "Lock in your crew calendar date, manufacturer shingle pricing, and dedicated project manager. Saved card on file for seamless final balance upon 100% completion.",
        badge: "Card Kept on File",
        features: [
          "Priority crew schedule reservation (guaranteed start date)",
          "Material price lock against wholesale lumber & asphalt tariffs",
          "Dedicated on-site master foreman assignment",
          "Digital permit filing with local building authority",
          "Card securely vaulted with Whop for final signoff balance",
        ],
      },
      flatRate: {
        planId: "plan_REPLACE_ME_FLATRATE",
        productId: "prod_REPLACE_ME_FLATRATE",
        title: "Emergency Tarping & Rapid Leak Defense",
        priceUSD: 395,
        description: "Same-day heavy-duty industrial vinyl tarping, secondary seal caulking, and temporary roof envelope stabilization following high wind, hail, or sudden puncture.",
        badge: "Same-Day Dispatch",
        features: [
          "Up to 400 sq. ft. heavy-duty reinforced woven tarping",
          "Batten strip mechanical anchoring (prevents blowoff)",
          "Temporary flashing seal around chimneys & vent boots",
          "Immediate photo package for your insurance adjuster",
          "24-hour storm response crew deployment",
        ],
      },
    },
    finalBalancePlanId: "plan_REPLACE_ME_FINAL_BALANCE",
    environment: "production",
  },

  services: [
    {
      slug: "complete-replacement",
      title: "Complete Architectural Roof Replacement",
      blurb: "Turnkey residential and commercial re-roofing using Class-4 impact resistant shingles, standing seam metal, or synthetic slate built for severe US weather.",
      icon: "ShieldCheck",
      startingPrice: 6500,
      featuredPlan: "deposit",
      detailedDescription: "Full tear-off down to the bare decking, re-nailing of sub-deck panels, ice & water barrier shield in all valleys, synthetic underlayment, and premium architectural shingles backed by our 50-year non-prorated system warranty.",
      bullets: [
        "GAF Timberline HDZ & Owens Corning Duration Class-4 options",
        "Full deck inspection with up to 3 complimentary OSB sheet swaps",
        "Lifetime manufacturer warranty with certified transferability",
        "Magnetic sweep of grounds, driveways, and landscaped beds",
      ],
    },
    {
      slug: "leak-detection-repair",
      title: "Precision Leak Detection & Roof Repair",
      blurb: "Pinpoint diagnosis and forensic repair of wind-torn shingles, failed flashing, compromised pipe boots, and chimney saddle deterioration before structural rot occurs.",
      icon: "Wrench",
      startingPrice: 350,
      featuredPlan: "flatRate",
      detailedDescription: "Our forensic repair specialists find the true source of water entry—which is often 15 feet away from the interior ceiling water ring. We replace rusted step flashing, reseat popped fasteners, and install silicone polymer collars.",
      bullets: [
        "Flashing reseal around skylights, dormers & chimneys",
        "Color-matched shingle bundle replacements",
        "Pipe boot collar upgrades with lifetime UV silicones",
        "Preventative maintenance reports with every repair",
      ],
    },
    {
      slug: "storm-damage-inspection",
      title: "Hail & Storm Damage Forensic Audit",
      blurb: "Certified drone aerial photography and infrared moisture scans to document bruised fiberglass mats, wind crease fractures, and hail spatter for insurance adjusters.",
      icon: "SearchCheck",
      startingPrice: 149,
      featuredPlan: "inspection",
      detailedDescription: "Navigating roof insurance claims requires airtight forensic proof. We provide granular 4K aerial photography of all slope quadrants, collateral impact proof on gutters, and itemized Xactimate-compatible estimates.",
      bullets: [
        "High-resolution 4K drone photography of steep slopes",
        "Hail bruise testing and granule loss assessment",
        "Written photographic report formatted for all major insurance carriers",
        "On-site representation during insurance adjuster walk-throughs",
      ],
    },
    {
      slug: "commercial-flat-roofing",
      title: "Commercial & Multi-Family Low-Slope Roofing",
      blurb: "TPO, EPDM, PVC single-ply membranes and elastomeric silicone roof coatings for commercial warehouses, retail strips, and apartment complexes.",
      icon: "Sparkles",
      startingPrice: 4200,
      detailedDescription: "Energy Star certified reflective cool-roof coatings and mechanically fastened 60-mil TPO membranes engineered to lower summer HVAC loads by up to 28% while extending flat roof longevity by decades.",
      bullets: [
        "High-reflectivity white TPO membranes reduce heat island effect",
        "Seamless silicone liquid coatings with 20-year leakproof warranties",
        "Zero tenant disruption with low-odor cold-applied adhesives",
        "Annual commercial roof maintenance contracts available",
      ],
    },
  ],

  serviceArea: {
    states: ["Georgia", "Tennessee", "Alabama", "North Carolina"],
    cities: [
      "Atlanta Metro",
      "Alpharetta",
      "Roswell",
      "Marietta",
      "Decatur",
      "Sandy Springs",
      "Cumming",
      "Chattanooga",
      "Athens",
      "Gainesville",
      "Knoxville",
      "Greenville",
    ],
    radiusNote: "Guaranteed 45-minute dispatch radius within our primary metro hubs. Extended regional emergency response across our four-state operational footprint.",
    dispatchNote: "Fully licensed, bonded, and registered in each municipal building jurisdiction.",
  },

  financing: {
    headline: "0% APR & Flexible Monthly Roofing Financing",
    body: "A sudden roof failure shouldn't drain your emergency savings. We offer flexible, stress-free installment plans right at Whop checkout. Financing options such as Klarna, Afterpay, or Splitit appear at Whop checkout for approved merchants, subject to customer eligibility and regional approval.",
    learnMoreCopy: "No impact on your credit score to check eligibility. Split your project deposit or final balance into predictable monthly payments with zero hidden prepayment penalties.",
    highlights: [
      "Instant soft credit check with no impact on score",
      "Low monthly terms or 0% promotional APR for qualified homeowners",
      "Available for emergency repairs, full replacements, and deductibles",
      "Seamlessly integrated into Whop secure checkout",
    ],
  },

  reviews: {
    aggregate: {
      score: 4.96,
      reviewCount: 384,
      scale: 5.0,
      verifiedPercentage: 99,
    },
    items: [
      {
        name: "Marcus Vance",
        city: "Sandy Springs",
        state: "GA",
        rating: 5,
        text: "After severe hail swept through North Fulton, Apex sent a drone out within 3 hours. Their 28-point forensic report was accepted by State Farm on the first submission with zero dispute. The crew stripped and re-shingled 42 squares in a single day and left the perimeter cleaner than they found it.",
        date: "October 2026",
        projectType: "Full Architectural Roof Replacement",
      },
      {
        name: "Elena Rostova",
        city: "Alpharetta",
        state: "GA",
        rating: 5,
        text: "The Whop checkout system is fantastic—so much more professional than the shady contractors who ask for paper checks or Cash App. We paid the $500 project deposit online, our card was kept securely on file, and the final balance was only billed after the city building inspector signed the permit.",
        date: "September 2026",
        projectType: "Hail Damage Re-Roofing & Gutters",
      },
      {
        name: "David Chen",
        city: "Chattanooga",
        state: "TN",
        rating: 5,
        text: "Had a stubborn leak around an internal chimney cricket that two previous companies failed to fix. Apex found water entering 8 feet higher at an unsealed dormer flashing. Fair flat-rate price, high quality metalwork, and zero leaks through two tropical downpours.",
        date: "August 2026",
        projectType: "Forensic Chimney & Valley Leak Repair",
      },
      {
        name: "Sarah & Thomas Jenkins",
        city: "Roswell",
        state: "GA",
        rating: 5,
        text: "From drone inspection to final magnetic sweep, Apex operated like true structural engineers rather than salesmen. The financing option at checkout let us upgrade to Class-4 impact shingles for an extra $40/month, which also lowered our annual homeowner insurance premium.",
        date: "July 2026",
        projectType: "Class-4 Impact Architectural Roof",
      },
    ],
  },

  trust: {
    badges: [
      {
        title: "Master Elite Certified",
        subtitle: "Top 2% of US Roofers",
        highlight: "Certified Tier",
      },
      {
        title: "50-Year Warranty",
        subtitle: "Non-prorated materials & labor",
        highlight: "Direct Manufacturer",
      },
      {
        title: "$2,000,000 Insured",
        subtitle: "Full general liability & workers' comp",
        highlight: "Comprehensive Bond",
      },
      {
        title: "Class-4 Impact Rated",
        subtitle: "Eligible for insurance discounts",
        highlight: "UL 2218 Certified",
      },
    ],
    warrantyCopy: "Every full replacement includes our 50-Year Golden Pledge Non-Prorated System Warranty backed directly by the manufacturer, covering 100% of material defects, labor costs, disposal, and workmanship.",
    insuranceCopy: "Apex carries $2,000,000 in commercial general liability insurance, full statutory workers' compensation on every on-roof technician, and complete municipal bonding across our service jurisdictions.",
    materialsPartner: "GAF Master Elite® · Owens Corning Platinum® · CertainTeed Select ShingleMaster®",
  },

  faq: [
    {
      question: "How does paying online with Whop protect me as a homeowner?",
      answer: "Whop is an enterprise-grade payment and commerce infrastructure. When you pay a deposit or book an inspection through this site, your transaction is processed with bank-level 256-bit encryption. Card details are securely vaulted—not stored on our servers. For deposits, your card is kept securely on file and final payments are only invoiced after final building inspection and your 100% satisfaction.",
      category: "Payments",
    },
    {
      question: "Will the $149 inspection fee be credited toward my repair or replacement?",
      answer: "Yes, 100% of your inspection fee is credited directly onto your invoice when you move forward with any recommended repair or replacement over $500.",
      category: "Inspections",
    },
    {
      question: "How does the card-on-file deposit work for large projects?",
      answer: "When you book your project deposit ($500), your payment details are securely saved via Whop's off-session credential vault. Once your roof replacement is completed, inspected by local code officials, and you have signed off on the final walkthrough, our team generates your itemized final balance invoice. You can choose to have it charged automatically or receive an email checkout link to pay manually.",
      category: "Payments",
    },
    {
      question: "Can I pay with installments or buy now pay later?",
      answer: "Yes. Flexible installment financing options such as Klarna, Afterpay, or Splitit automatically appear on the Whop checkout page for eligible purchases and approved buyers. You can review exact monthly payment schedules before confirming your transaction.",
      category: "Financing",
    },
    {
      question: "How quickly can an emergency leak or storm crew arrive?",
      answer: "For emergency tarping or active storm leaks, our rapid response units dispatch within 45 to 90 minutes across our core metro service areas. We carry heavy-duty reinforced tarps, structural batten boards, and temporary sealants to stop water ingress immediately.",
      category: "Emergency",
    },
    {
      question: "Do you assist with insurance claims and adjuster meetings?",
      answer: "Absolutely. Our certified inspectors build itemized 28-point forensic photo reports formatted specifically for insurance claims adjusters. We attend adjuster walkthroughs in person to advocate for complete and proper roof scope replacement.",
      category: "Insurance",
    },
  ],
};

/**
 * Zod schema to validate siteConfig integrity at compile and test time
 */
export const siteConfigSchema = z.object({
  isSample: z.boolean(),
  motion: z.object({
    intensity: z.enum(['full', 'reduced']),
  }),
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    shortTagline: z.string().min(1),
    phone: z.string().min(7),
    phoneFormatted: z.string().min(7),
    email: z.string().email(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    }),
    licenseNumber: z.string().min(1),
    yearsInBusiness: z.number().positive(),
    hours: z.string().min(1),
    emergencyAvailable: z.boolean(),
    colors: z.object({
      primary: z.string(),
      accent: z.string(),
      neutral: z.string(),
    }),
    fontStack: z.string(),
  }),
  whop: z.object({
    accountId: z.string(),
    plans: z.object({
      inspection: z.object({
        planId: z.string(),
        productId: z.string(),
        title: z.string(),
        priceUSD: z.number().positive(),
        description: z.string(),
        badge: z.string().optional(),
        features: z.array(z.string()),
      }),
      deposit: z.object({
        planId: z.string(),
        productId: z.string(),
        title: z.string(),
        priceUSD: z.number().positive(),
        description: z.string(),
        badge: z.string().optional(),
        features: z.array(z.string()),
      }),
      flatRate: z.object({
        planId: z.string(),
        productId: z.string(),
        title: z.string(),
        priceUSD: z.number().positive(),
        description: z.string(),
        badge: z.string().optional(),
        features: z.array(z.string()),
      }),
    }),
    finalBalancePlanId: z.string(),
    environment: z.enum(['production', 'sandbox']),
  }),
  services: z.array(
    z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      blurb: z.string().min(1),
      icon: z.enum(['ShieldCheck', 'Hammer', 'SearchCheck', 'Sparkles', 'CloudRain', 'Wrench']),
      startingPrice: z.number().optional(),
      bullets: z.array(z.string()),
      featuredPlan: z.enum(['inspection', 'deposit', 'flatRate']).optional(),
      detailedDescription: z.string().optional(),
    })
  ),
  serviceArea: z.object({
    states: z.array(z.string()),
    cities: z.array(z.string()),
    radiusNote: z.string(),
    dispatchNote: z.string(),
  }),
  financing: z.object({
    headline: z.string(),
    body: z.string(),
    learnMoreCopy: z.string(),
    highlights: z.array(z.string()),
  }),
  reviews: z.object({
    aggregate: z.object({
      score: z.number(),
      reviewCount: z.number(),
      scale: z.number(),
      verifiedPercentage: z.number(),
    }),
    items: z.array(
      z.object({
        name: z.string(),
        city: z.string(),
        state: z.string(),
        rating: z.number(),
        text: z.string(),
        date: z.string(),
        projectType: z.string(),
      })
    ),
  }),
  trust: z.object({
    badges: z.array(
      z.object({
        title: z.string(),
        subtitle: z.string(),
        highlight: z.string(),
      })
    ),
    warrantyCopy: z.string(),
    insuranceCopy: z.string(),
    materialsPartner: z.string(),
  }),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      category: z.string().optional(),
    })
  ),
});

/**
 * Helper to detect if siteConfig contains unconfigured placeholder Whop IDs.
 * Used to fail loudly in dev with a prominent notice banner.
 */
export function hasPlaceholderWhopIds(config: SiteConfig = siteConfig): boolean {
  const { accountId, plans } = config.whop;
  if (!accountId || accountId.includes("REPLACE_ME")) return true;
  if (plans.inspection.planId.includes("REPLACE_ME")) return true;
  if (plans.deposit.planId.includes("REPLACE_ME")) return true;
  if (plans.flatRate.planId.includes("REPLACE_ME")) return true;
  return false;
}
