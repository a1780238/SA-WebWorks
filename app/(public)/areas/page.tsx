import { SiteLayout } from "@/components/site-layout";
import { tenantConfig } from "@/config/tenant";

export default function AreasPage() {
  return <SiteLayout><main className="container-app py-10"><h1 className="text-3xl font-bold">Service Areas</h1><p className="mt-4 rounded border bg-white p-4">{tenantConfig.serviceSuburbs.join(" • ")}</p></main></SiteLayout>;
}
