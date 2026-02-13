import { SiteLayout } from "@/components/site-layout";
import { tenantConfig } from "@/config/tenant";

export default function ServicesPage() {
  return <SiteLayout><main className="container-app py-10"><h1 className="text-3xl font-bold">Services</h1><div className="mt-6 grid gap-3 md:grid-cols-3">{tenantConfig.services.map((s)=><div key={s} className="rounded border bg-white p-4">{s}</div>)}</div></main></SiteLayout>;
}
