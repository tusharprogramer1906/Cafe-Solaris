import Link from "next/link";
import { LeadForm } from "@/components/lead-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
              AI Growth System for Cafes
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Get More Customers Automatically for Your Cafe
            </h1>
            <p className="mt-4 max-w-xl text-zinc-300">
              Capture leads, send instant AI replies, automate follow-ups, and grow cafe revenue from one premium dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book-demo" className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950">
                Book Demo
              </a>
              <Link href="/dashboard" className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100">
                Open Dashboard
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8">
            <p className="text-sm text-zinc-400">What you get</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-200">
              <li>Instant AI auto-replies to incoming leads</li>
              <li>Supabase-backed CRM for leads and conversations</li>
              <li>Notion sync for operations teams</li>
              <li>Stripe subscriptions with webhook automation</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="book-demo" className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-2xl font-semibold text-white">Book Demo</h2>
        <p className="mt-2 text-sm text-zinc-400">Share your details and we will reach out with a growth plan.</p>
        <LeadForm />
      </section>
    </main>
  );
}
