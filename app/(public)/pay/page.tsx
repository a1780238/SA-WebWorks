"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { trackClientEvent } from "@/components/tracking";

export default function PayPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cents: 10000 })
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setError(data.error ?? "Unable to start checkout");
      setLoading(false);
      return;
    }
    trackClientEvent("deposit_paid");
    window.location.href = data.url;
  }

  return (
    <SiteLayout>
      <main className="container-app py-10">
        <h1 className="text-3xl font-bold">Pay Booking Deposit</h1>
        <p className="mt-2">Secure Stripe checkout for call-out fee/deposit.</p>
        <button onClick={startCheckout} disabled={loading} className="mt-6 rounded bg-brand px-4 py-2 text-white">
          {loading ? "Redirecting..." : "Pay $100 Deposit"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </main>
    </SiteLayout>
  );
}
