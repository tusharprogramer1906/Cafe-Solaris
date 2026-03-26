"use client";

import { useState } from "react";

type Props = {
  defaultBusinessName: string;
  defaultOwnerName: string;
  defaultPhone: string;
  defaultEmail: string;
};

export function CheckoutButtons({
  defaultBusinessName,
  defaultOwnerName,
  defaultPhone,
  defaultEmail,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<"starter" | "pro" | null>(null);

  async function handleCheckout(plan: "starter" | "pro") {
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          businessName: defaultBusinessName,
          ownerName: defaultOwnerName,
          phone: defaultPhone,
          email: defaultEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.message ?? "Checkout failed.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button
        onClick={() => handleCheckout("starter")}
        disabled={loadingPlan !== null}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-zinc-100 transition hover:border-emerald-400 disabled:opacity-60"
      >
        <p className="font-semibold">Starter Plan</p>
        <p className="text-sm text-zinc-400">₹4999 / month</p>
        <p className="mt-2 text-xs text-zinc-500">
          {loadingPlan === "starter" ? "Redirecting..." : "Start subscription"}
        </p>
      </button>
      <button
        onClick={() => handleCheckout("pro")}
        disabled={loadingPlan !== null}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-zinc-100 transition hover:border-emerald-400 disabled:opacity-60"
      >
        <p className="font-semibold">Pro Plan</p>
        <p className="text-sm text-zinc-400">₹9999 / month</p>
        <p className="mt-2 text-xs text-zinc-500">{loadingPlan === "pro" ? "Redirecting..." : "Start subscription"}</p>
      </button>
    </div>
  );
}

