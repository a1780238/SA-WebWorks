import Link from "next/link";
import { tenantConfig } from "@/config/tenant";
import { QuoteForm } from "@/components/quote-form";
import { TrackingScripts } from "@/components/tracking";

export default function LandingPage() {
  return (
    <main className="pb-16">
      <TrackingScripts />
      <section className="bg-slate-950 py-14 text-white">
        <div className="container-app grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-300">{tenantConfig.tradeHeadline}</p>
            <h1 className="text-4xl font-bold">{tenantConfig.hero.heading}</h1>
            <p className="text-slate-200">{tenantConfig.hero.subheading}</p>
            <div className="flex gap-3">
              <a href={`tel:${tenantConfig.phone}`} className="rounded bg-white px-4 py-2 font-semibold text-slate-900">Call Now</a>
              <Link href="#quote" className="rounded border border-white px-4 py-2">Get Quote</Link>
            </div>
          </div>
          <QuoteForm suburbs={tenantConfig.serviceSuburbs} services={tenantConfig.services} />
        </div>
      </section>

      <section className="container-app mt-8">
        <div className="grid gap-3 rounded border bg-white p-4 md:grid-cols-3">
          {tenantConfig.trustBar.map((item) => (
            <div key={item} className="text-center font-medium">{item}</div>
          ))}
        </div>
      </section>

      <section className="container-app mt-8">
        <h2 className="mb-3 text-2xl font-semibold">Services</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {tenantConfig.services.slice(0, 6).map((service) => (
            <article key={service} className="rounded border bg-white p-4">{service}</article>
          ))}
        </div>
      </section>

      <section className="container-app mt-8">
        <h2 className="mb-3 text-2xl font-semibold">Service Areas</h2>
        <p className="rounded border bg-white p-4">{tenantConfig.serviceSuburbs.join(" • ")}</p>
      </section>

      <section className="container-app mt-8" id="quote">
        <h2 className="mb-3 text-2xl font-semibold">FAQ</h2>
        <div className="space-y-2">
          {tenantConfig.faqs.map((faq) => (
            <details key={faq.q} className="rounded border bg-white p-4">
              <summary className="cursor-pointer font-medium">{faq.q}</summary>
              <p className="mt-2 text-slate-700">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
