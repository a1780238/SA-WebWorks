import { SiteLayout } from "@/components/site-layout";
import { tenantConfig } from "@/config/tenant";

export default function AboutPage() {
  return <SiteLayout><main className="container-app py-10"><h1 className="text-3xl font-bold">About {tenantConfig.businessName}</h1><p className="mt-4 rounded border bg-white p-4">We build digital chassis for Adelaide tradies to end the second shift and turn website traffic into booked jobs.</p></main></SiteLayout>;
}
