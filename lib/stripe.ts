import Stripe from "stripe";

export const PLANS = {
  starter: {
    label: "AI Growth Starter",
    amount: 4999,
  },
  pro: {
    label: "AI Growth Pro",
    amount: 9999,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(key);
}

