export type TenantConfig = {
  tenantKey: string;
  businessName: string;
  tradeHeadline: string;
  phone: string;
  ownerEmail: string;
  ownerSms?: string;
  address: string;
  services: string[];
  serviceSuburbs: string[];
  trustBar: string[];
  faqs: Array<{ q: string; a: string }>;
  hero: { heading: string; subheading: string };
  pricing: Array<{ name: string; price: string; description: string }>;
  analytics: { ga4Id?: string; metaPixelId?: string };
};

export const tenantConfig: TenantConfig = {
  tenantKey: process.env.NEXT_PUBLIC_TENANT_KEY ?? "sa-webworks-template",
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "SA WebWorks",
  tradeHeadline: process.env.NEXT_PUBLIC_TRADE_HEADLINE ?? "Emergency Plumbing Adelaide",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "0481000000",
  ownerEmail: process.env.OWNER_EMAIL ?? "hello@sawebworks.com.au",
  ownerSms: process.env.OWNER_SMS,
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Adelaide, SA",
  services: ["Emergency Plumbing", "Blocked Drains", "Hot Water", "Leak Detection", "Gas Fitting", "Maintenance"],
  serviceSuburbs: ["Adelaide", "Morphett Vale", "Glenelg", "Unley", "Marion", "Prospect"],
  trustBar: ["Licensed", "5-star rated", "Family owned"],
  faqs: [
    { q: "How quickly can you respond?", a: "Emergency jobs are prioritised with immediate callback." },
    { q: "Do you service my suburb?", a: "We service Adelaide metro suburbs listed on this page." },
    { q: "Can I request after-hours service?", a: "Yes, choose Emergency in the quote form and we escalate instantly." }
  ],
  hero: {
    heading: "Get Booked. Not Stressed.",
    subheading: "Client-grade websites and lead pipelines for Adelaide tradies."
  },
  pricing: [
    { name: "Starter", price: "$49/mo", description: "Landing page + quote form + notifications" },
    { name: "Growth", price: "$149/mo", description: "Adds admin dashboard + analytics + automations" },
    { name: "Booked-Jobs Engine", price: "$299/mo", description: "Adds deposits + reporting + priority support" }
  ],
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID
  }
};
