"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackClientEvent } from "@/components/tracking";

function getUtm() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
    utm_term: p.get("utm_term") ?? undefined,
    utm_content: p.get("utm_content") ?? undefined
  };
}

export function QuoteForm({ suburbs, services, pageSource = "home" }: { suburbs: string[]; services: string[]; pageSource?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    trackClientEvent("quote_submit");

    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": crypto.randomUUID()
      },
      body: JSON.stringify({
        ...payload,
        source: "direct",
        page_source: pageSource,
        turnstileToken: (payload.turnstileToken as string) || "dev-bypass",
        ...getUtm()
      })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Unable to submit quote");
      setLoading(false);
      return;
    }

    trackClientEvent("quote_success");
    router.push("/thanks");
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Get Quote</h3>
      <input className="w-full rounded border p-2" name="name" placeholder="Name" required />
      <input className="w-full rounded border p-2" name="phone" placeholder="Phone" required />
      <input className="w-full rounded border p-2" name="email" placeholder="Email (optional)" type="email" />
      <select className="w-full rounded border p-2" name="suburb" required>
        {suburbs.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="w-full rounded border p-2" name="job_type" required>
        {services.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="w-full rounded border p-2" name="urgency" defaultValue="quote" required>
        <option value="emergency">Emergency</option>
        <option value="today">Today</option>
        <option value="this_week">This week</option>
        <option value="quote">Quote</option>
      </select>
      <textarea className="w-full rounded border p-2" name="description" placeholder="Notes (optional)" rows={3} />
      <input type="hidden" name="turnstileToken" value="dev-bypass" />
      <button disabled={loading} className="w-full rounded bg-brand px-4 py-2 font-semibold text-white">
        {loading ? "Submitting..." : "Submit Quote"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
