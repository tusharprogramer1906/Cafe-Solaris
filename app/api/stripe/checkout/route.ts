import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient, PLANS, type PlanKey } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["starter", "pro"]),
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.parse(payload);
    const stripe = getStripeClient();
    const plan = PLANS[parsed.plan as PlanKey];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: parsed.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            recurring: { interval: "month" },
            unit_amount: plan.amount * 100,
            product_data: {
              name: plan.label,
            },
          },
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
      metadata: {
        businessName: parsed.businessName,
        ownerName: parsed.ownerName,
        phone: parsed.phone,
        plan: parsed.plan,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to start checkout." },
      { status: 400 },
    );
  }
}

