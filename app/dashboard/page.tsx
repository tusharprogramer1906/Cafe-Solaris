import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { type Database } from "@/types/database";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { CheckoutButtons } from "@/components/dashboard/checkout-buttons";
import { AITools } from "@/components/dashboard/ai-tools";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default async function DashboardPage() {
  const supabaseAuth = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = getSupabaseAdminClient();

  const [leadsResult, recentLeadsResult, conversationsResult] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("conversations").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const totalLeads = leadsResult.count ?? 0;
  const recentLeads = (recentLeadsResult.data ?? []) as Database["public"]["Tables"]["leads"]["Row"][];
  const conversations = (conversationsResult.data ?? []) as Database["public"]["Tables"]["conversations"]["Row"][];

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Cafe Growth Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          </div>
          <SignOutButton />
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Total Leads</p>
            <p className="mt-1 text-3xl font-bold">{totalLeads}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Recent Leads</p>
            <p className="mt-1 text-3xl font-bold">{recentLeads.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Conversations</p>
            <p className="mt-1 text-3xl font-bold">{conversations.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Lead Status</p>
            <p className="mt-1 text-3xl font-bold">Live</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <p className="mt-1 text-sm text-zinc-400">Choose your monthly plan.</p>
          <div className="mt-4">
            <CheckoutButtons
              defaultBusinessName={process.env.CAFE_NAME ?? "My Cafe"}
              defaultOwnerName={user.email ?? "Owner"}
              defaultPhone={process.env.DEFAULT_OWNER_PHONE ?? "9999999999"}
              defaultEmail={user.email ?? "owner@example.com"}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-xl font-semibold">Recent Leads</h2>
            <div className="mt-4 space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-zinc-400">No leads yet.</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm">
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-zinc-400">{lead.phone}</p>
                    <p className="mt-1 text-zinc-300">{lead.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-emerald-400">{lead.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-xl font-semibold">Conversations</h2>
            <div className="mt-4 space-y-3">
              {conversations.length === 0 ? (
                <p className="text-sm text-zinc-400">No conversations yet.</p>
              ) : (
                conversations.map((conversation) => (
                  <div key={conversation.id} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm">
                    <p className="text-zinc-300">
                      <span className="font-semibold text-zinc-100">Lead:</span> {conversation.message}
                    </p>
                    <p className="mt-1 text-zinc-200">
                      <span className="font-semibold text-emerald-400">AI Reply:</span> {conversation.reply}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">{formatDate(conversation.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <AITools />
        </section>
      </div>
    </main>
  );
}

