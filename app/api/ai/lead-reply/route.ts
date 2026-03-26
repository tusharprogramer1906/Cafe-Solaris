import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLeadReply } from "@/lib/ai/leadReply";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  leadId: z.string().uuid(),
  name: z.string().min(2),
  message: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.parse(payload);
    const reply = await generateLeadReply({
      name: parsed.name,
      message: parsed.message,
      cafeName: process.env.CAFE_NAME ?? "our cafe",
    });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("conversations").insert({
      lead_id: parsed.leadId,
      message: parsed.message,
      reply,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("AI lead reply route error:", error);
    return NextResponse.json(
      { success: false, message: "Could not generate reply." },
      { status: 400 },
    );
  }
}

