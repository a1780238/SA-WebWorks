export type TenantConfig = {
  tenantKey: string;
  businessName: string;
  tradeHeadline: string;
  phone: string;
  ownerEmail: string;
  ownerSms?: string;
  serviceSuburbs: string[];
  services: string[];
  faqs: Array<{ q: string; a: string }>;
  trustBar: string[];
  hero: { heading: string; subheading: string };
  analytics: { ga4Id?: string; metaPixelId?: string };
};

export const tenantConfig: TenantConfig = {
  tenantKey: process.env.NEXT_PUBLIC_TENANT_KEY ?? "sa-webworks-template",
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "SA WebWorks",
  tradeHeadline: process.env.NEXT_PUBLIC_TRADE_HEADLINE ?? "Emergency Plumbing Adelaide",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "0481 000 000",
  ownerEmail: process.env.OWNER_EMAIL ?? "hello@sawebworks.com.au",
  ownerSms: process.env.OWNER_SMS,
  serviceSuburbs: ["Adelaide", "Morphett Vale", "Glenelg", "Unley", "Marion", "Prospect"],
  services: ["Emergency Plumbing", "Blocked Drains", "Hot Water", "Leak Detection", "Gas Fitting", "Maintenance"],
  faqs: [
    { q: "How quickly can you respond?", a: "Emergency jobs are prioritised with immediate callback." },
    { q: "Do you service my suburb?", a: "We service key Adelaide metro suburbs listed on this page." },
    { q: "Can I request after-hours service?", a: "Yes. Choose Emergency in the quote form and we escalate instantly." }
  ],
  trustBar: ["Licensed", "5-star rated", "Family owned"],
  hero: {
    heading: "Get Booked. Not Stressed.",
    subheading: "Conversion-first websites and lead automation for Adelaide tradies."
  },
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID
  }
};
