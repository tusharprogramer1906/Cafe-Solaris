import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { runLeadAutomation } from "@/lib/automation";
import { type Database } from "@/types/database";

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  message: z.string().min(5),
  source: z.string().default("landing-page"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = leadSchema.parse(payload);
    const supabase = getSupabaseAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name: parsed.name,
        phone: parsed.phone,
        message: parsed.message,
        source: parsed.source,
      })
      .select("id, name, phone, message, status, created_at")
      .single();

    if (leadError || !lead) {
      throw leadError ?? new Error("Could not create lead.");
    }

    const createdLead = lead as Database["public"]["Tables"]["leads"]["Row"];

    const aiReply = await runLeadAutomation({
      leadId: createdLead.id,
      name: createdLead.name,
      phone: createdLead.phone,
      message: createdLead.message,
      status: createdLead.status,
      createdAt: createdLead.created_at,
      email: process.env.LEAD_REPLY_FALLBACK_EMAIL,
    });

    return NextResponse.json({
      success: true,
      leadId: createdLead.id,
      aiReply,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit lead right now.",
      },
      { status: 400 },
    );
  }
}

