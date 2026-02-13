import { SiteLayout } from "@/components/site-layout";
import { tenantConfig } from "@/config/tenant";
import { QuoteForm } from "@/components/quote-form";

export default function ContactPage() {
  return <SiteLayout><main className="container-app py-10"><h1 className="text-3xl font-bold">Contact</h1><p className="mt-2">Call {tenantConfig.phone}</p><div className="mt-6 max-w-lg"><QuoteForm suburbs={tenantConfig.serviceSuburbs} services={tenantConfig.services} pageSource="contact" /></div></main></SiteLayout>;
}
