"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Database } from "@/types/database";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { CheckoutButtons } from "@/components/dashboard/checkout-buttons";
import { AITools } from "@/components/dashboard/ai-tools";

const LEAD_STATUSES = ["new", "contacted", "converted", "lost"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];
const WHATSAPP_DEFAULT_MESSAGE = "Hi, we received your inquiry";

function normalizeLeadStatus(status: string): LeadStatus {
  return LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : "new";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function getWhatsAppLink(phone: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Database["public"]["Tables"]["leads"]["Row"][]>([]);
  const [conversations, setConversations] = useState<Database["public"]["Tables"]["conversations"]["Row"][]>([]);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, LeadStatus>>({});
  const [conversionInputs, setConversionInputs] = useState<Record<string, string>>({});
  const [statusError, setStatusError] = useState<string>("");
  const [showNewLeadToast, setShowNewLeadToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const [leadsCountResult, recentLeadsResult, revenueResult, conversationsCountResult, recentConversationsResult] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("leads").select("conversion_value").eq("status", "converted"),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("conversations").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    const queryError =
      leadsCountResult.error ??
      recentLeadsResult.error ??
      revenueResult.error ??
      conversationsCountResult.error ??
      recentConversationsResult.error;

    if (queryError) {
      throw queryError;
    }

    setTotalLeads(leadsCountResult.count ?? 0);
    const revenue = (revenueResult.data ?? []).reduce((sum, row) => {
      return sum + Number(row.conversion_value ?? 0);
    }, 0);
    setTotalRevenue(revenue);
    setConversationsCount(conversationsCountResult.count ?? 0);
    setRecentLeads((recentLeadsResult.data ?? []) as Database["public"]["Tables"]["leads"]["Row"][]);
    setConversations((recentConversationsResult.data ?? []) as Database["public"]["Tables"]["conversations"]["Row"][]);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    const initializeDashboard = async () => {
      try {
        setError("");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUserEmail(session.user.email ?? "");
        await fetchDashboardData();
      } catch (loadError) {
        console.error(loadError);
        const message = loadError instanceof Error ? loadError.message : "Failed to load dashboard data.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeDashboard();

    const leadsChannel = supabase
      .channel("dashboard-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setShowNewLeadToast(true);
          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }
          toastTimeoutRef.current = setTimeout(() => {
            setShowNewLeadToast(false);
          }, 3000);
        }
        void fetchDashboardData();
      })
      .subscribe();

    const conversationsChannel = supabase
      .channel("dashboard-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        void fetchDashboardData();
      })
      .subscribe();

    return () => {
      active = false;
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      void supabase.removeChannel(leadsChannel);
      void supabase.removeChannel(conversationsChannel);
    };
  }, [fetchDashboardData, router, supabase]);

  async function updateLeadStatus(leadId: string, status: LeadStatus, conversionValue: number) {
    try {
      setStatusError("");
      setUpdatingLeadId(leadId);

      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          conversion_value: conversionValue,
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to update lead.");
      }

      setStatusDrafts((prev) => {
        const next = { ...prev };
        delete next[leadId];
        return next;
      });
      setConversionInputs((prev) => {
        const next = { ...prev };
        delete next[leadId];
        return next;
      });
      await fetchDashboardData();
    } catch (updateError) {
      console.error(updateError);
      const message = updateError instanceof Error ? updateError.message : "Unable to update lead status.";
      setStatusError(message);
    } finally {
      setUpdatingLeadId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {showNewLeadToast ? (
          <div className="fixed right-6 top-6 z-50 rounded-lg border border-emerald-500/50 bg-zinc-900 px-4 py-3 text-sm font-medium text-emerald-300 shadow-lg">
            New lead received
          </div>
        ) : null}

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Cafe Growth Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400">{userEmail || "Loading account..."}</p>
          </div>
          <SignOutButton />
        </header>

        {loading ? (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Loading dashboard data...</p>
          </section>
        ) : null}

        {!loading && error ? (
          <section className="rounded-2xl border border-rose-800 bg-rose-950/30 p-5">
            <p className="text-sm text-rose-300">{error}</p>
          </section>
        ) : null}

        {!loading && statusError ? (
          <section className="rounded-2xl border border-rose-800 bg-rose-950/30 p-5">
            <p className="text-sm text-rose-300">{statusError}</p>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-5">
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
            <p className="mt-1 text-3xl font-bold">{conversationsCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
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
              defaultBusinessName="My Cafe"
              defaultOwnerName={userEmail || "Owner"}
              defaultPhone="9999999999"
              defaultEmail={userEmail || "owner@example.com"}
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
                recentLeads.map((lead) => {
                  const safeStatus = statusDrafts[lead.id] ?? normalizeLeadStatus(lead.status);
                  const conversionInput = conversionInputs[lead.id] ?? String(Number(lead.conversion_value ?? 0) || "");
                  return (
                    <div key={lead.id} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm">
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-zinc-400">{lead.phone}</p>
                      <p className="mt-1 text-zinc-300">{lead.message}</p>
                      <a
                        href={getWhatsAppLink(lead.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:text-emerald-200"
                      >
                        WhatsApp
                      </a>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-wide text-emerald-400">{safeStatus}</p>
                        <select
                          value={safeStatus}
                          onChange={(event) => {
                            const nextStatus = event.target.value as LeadStatus;
                            setStatusDrafts((prev) => ({
                              ...prev,
                              [lead.id]: nextStatus,
                            }));

                            if (nextStatus !== "converted") {
                              void updateLeadStatus(lead.id, nextStatus, 0);
                            }
                          }}
                          disabled={updatingLeadId === lead.id}
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 disabled:opacity-60"
                        >
                          {LEAD_STATUSES.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </div>
                      {safeStatus === "converted" ? (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter amount (₹)"
                            value={conversionInput}
                            onChange={(event) => {
                              setConversionInputs((prev) => ({
                                ...prev,
                                [lead.id]: event.target.value,
                              }));
                            }}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
                          />
                          <button
                            type="button"
                            disabled={updatingLeadId === lead.id}
                            onClick={() => {
                              const amount = Number(conversionInputs[lead.id] ?? lead.conversion_value ?? 0);
                              if (!Number.isFinite(amount) || amount < 0) {
                                setStatusError("Please enter a valid conversion amount.");
                                return;
                              }
                              void updateLeadStatus(lead.id, "converted", amount);
                            }}
                            className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 disabled:opacity-60"
                          >
                            Save
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })
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

