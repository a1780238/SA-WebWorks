import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thanks?deposit=paid`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          product_data: { name: "Booking Deposit" },
          unit_amount: body.amount_cents ?? 10000
        }
      }
    ],
    metadata: {
      lead_id: body.lead_id ?? ""
    }
  });

  return NextResponse.json({ url: session.url });
}
