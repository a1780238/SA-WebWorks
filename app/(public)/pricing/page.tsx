import Link from "next/link";
import { SiteLayout } from "@/components/site-layout";
import { tenantConfig } from "@/config/tenant";

export default function PricingPage() {
  return <SiteLayout><main className="container-app py-10"><h1 className="text-3xl font-bold">Pricing</h1><div className="mt-6 grid gap-4 md:grid-cols-3">{tenantConfig.pricing.map((p)=><div key={p.name} className="rounded border bg-white p-4"><h2 className="font-semibold">{p.name}</h2><p className="text-2xl font-bold">{p.price}</p><p>{p.description}</p></div>)}</div><Link href="/pay" className="mt-6 inline-block rounded bg-brand px-4 py-2 text-white">Pay Deposit</Link></main></SiteLayout>;
}
