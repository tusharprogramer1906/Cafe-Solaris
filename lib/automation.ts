import { createNotionLead } from "@/lib/notion";
import { sendLeadReplyEmail } from "@/lib/email";
import { generateLeadReply } from "@/lib/ai/leadReply";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type LeadAutomationInput = {
  leadId: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  email?: string;
};

export async function runLeadAutomation(input: LeadAutomationInput) {
  const reply = await generateLeadReply({
    name: input.name,
    message: input.message,
    cafeName: process.env.CAFE_NAME ?? "our cafe",
  });

  const supabase = getSupabaseAdminClient();

  const { error: conversationError } = await supabase.from("conversations").insert({
    lead_id: input.leadId,
    message: input.message,
    reply,
  });

  if (conversationError) {
    throw conversationError;
  }

  await Promise.allSettled([
    createNotionLead({
      name: input.name,
      phone: input.phone,
      status: input.status,
      message: input.message,
      createdAt: input.createdAt,
    }),
    input.email
      ? sendLeadReplyEmail({
          to: input.email,
          leadName: input.name,
          reply,
        })
      : Promise.resolve(),
  ]);

  return reply;
}

