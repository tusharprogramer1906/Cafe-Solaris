"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  phone: "",
  message: "",
};

export function LeadForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: "landing-page",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Submission failed.");
      }

      setSuccess("Thanks! Our team will contact you shortly.");
      setForm(initialState);
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to submit right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <input
        type="text"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Name"
        required
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-emerald-500 transition focus:ring-2"
      />
      <input
        type="tel"
        value={form.phone}
        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        placeholder="Phone"
        required
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-emerald-500 transition focus:ring-2"
      />
      <textarea
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        placeholder="Message"
        required
        rows={4}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-emerald-500 transition focus:ring-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Submitting..." : "Book Demo"}
      </button>
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}

