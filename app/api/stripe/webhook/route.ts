import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Missing webhook config." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription" && session.metadata) {
      const supabase = getSupabaseAdminClient();

      await supabase.from("clients").insert({
        business_name: session.metadata.businessName ?? "Unknown Cafe",
        owner_name: session.metadata.ownerName ?? "Unknown Owner",
        phone: session.metadata.phone ?? "Unknown",
        plan: session.metadata.plan ?? "starter",
      });
    }
  }

  return NextResponse.json({ received: true });
}

