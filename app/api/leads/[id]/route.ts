import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUSES = new Set(["new", "contacted", "converted", "lost"]);

type PatchPayload = {
  status?: unknown;
  conversion_value?: unknown;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ success: false, message: "Lead id is required." }, { status: 400 });
  }

  let body: PatchPayload;
  try {
    body = (await request.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ success: false, message: "Invalid status value." }, { status: 400 });
  }

  let conversionValue: number | undefined;
  if (body.conversion_value !== undefined) {
    const parsed = Number(body.conversion_value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return NextResponse.json({ success: false, message: "Invalid conversion_value." }, { status: 400 });
    }
    conversionValue = parsed;
  }

  const updatePayload: { status: string; conversion_value?: number } = { status };

  if (status === "converted") {
    if (conversionValue === undefined) {
      return NextResponse.json(
        { success: false, message: "conversion_value is required when status is converted." },
        { status: 400 },
      );
    }
    updatePayload.conversion_value = conversionValue;
  } else {
    updatePayload.conversion_value = conversionValue ?? 0;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("leads").update(updatePayload).eq("id", id);

    if (error) {
      console.error("PATCH /api/leads/[id] supabase error:", error);
      return NextResponse.json({ success: false, message: "Failed to update lead." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
