import Link from "next/link";
import { tenantConfig } from "@/config/tenant";
import { QuoteForm } from "@/components/quote-form";
import { TrackingScripts } from "@/components/tracking";
import { CallButton } from "@/components/call-button";
import { SiteLayout } from "@/components/site-layout";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";

export default function HomePage() {
  return (
    <SiteLayout>
      <main className="pb-24">
        <TrackingScripts />
        <section className="bg-slate-950 py-14 text-white">
          <div className="container-app grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-blue-300">{tenantConfig.tradeHeadline}</p>
              <h1 className="text-4xl font-bold">{tenantConfig.hero.heading}</h1>
              <p className="text-slate-200">{tenantConfig.hero.subheading}</p>
              <div className="flex gap-3">
                <CallButton phone={tenantConfig.phone} className="rounded bg-white px-4 py-2 font-semibold text-slate-900" />
                <Link href="#quote" className="rounded border border-white px-4 py-2">Get Quote</Link>
              </div>
            </div>
            <div id="quote">
              <QuoteForm suburbs={tenantConfig.serviceSuburbs} services={tenantConfig.services} pageSource="home" />
            </div>
          </div>
        </section>

        <section className="container-app mt-8">
          <div className="grid gap-3 rounded border bg-white p-4 md:grid-cols-3">
            {tenantConfig.trustBar.map((item) => <div key={item} className="text-center font-medium">{item}</div>)}
          </div>
        </section>
      </main>
      <MobileStickyCta />
    </SiteLayout>
  );
}
