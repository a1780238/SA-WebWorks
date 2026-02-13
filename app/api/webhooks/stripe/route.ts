import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      console.log("[stripe] deposit_paid", event.data.object);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature", details: String(err) }, { status: 400 });
  }
}
