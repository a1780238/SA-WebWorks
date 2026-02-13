import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET);
    const supabase = createSupabaseAdminClient();

    const idempotent = await supabase.from("webhook_events").insert({
      provider: "stripe",
      event_id: event.id,
      payload: event as unknown as Record<string, unknown>
    });

    if (idempotent.error) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const leadId = session.metadata?.lead_id;
      if (leadId) {
        await supabase.from("leads").update({ status: "deposit_paid", deposit_status: "paid" }).eq("id", leadId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature", details: String(err) }, { status: 400 });
  }
}
