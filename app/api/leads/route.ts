import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  console.log("POST /api/leads body:", body);

  const payload = body as { name?: unknown; phone?: unknown; message?: unknown; email?: unknown };
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload?.phone === "string" ? payload.phone.trim() : "";
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  const ownerEmail = process.env.OWNER_EMAIL ?? process.env.SMTP_USER ?? "";

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields: name, email, phone, message.",
      },
      { status: 400 },
    );
  }

  if (!email.includes("@")) {
    return NextResponse.json({ success: false, message: "Please provide a valid email address." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("leads").insert([
      {
        name,
        email,
        phone,
        message,
        source: "website",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save lead.",
        },
        { status: 500 },
      );
    }

    console.log("🚀 Triggering email system...");
    console.log("Lead data:", { name, email, phone, message });

    try {
      console.log("📨 Sending email to lead...");
      console.log("Sending email to:", email);
      await sendEmail({
        to: email,
        subject: `Thanks for contacting ${process.env.CAFE_NAME ?? "our cafe"}`,
        text: `Hi ${name}, we received your inquiry: "${message}". Our team will contact you soon.`,
      });
      console.log("✅ Email sent to lead");

      console.log("📨 Sending email to owner...");
      if (!ownerEmail) {
        throw new Error("Owner email missing. Set OWNER_EMAIL or SMTP_USER.");
      }
      await sendEmail({
        to: ownerEmail,
        subject: `New lead received: ${name}`,
        text: `New lead details\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      });
      console.log("✅ Email sent to owner");
    } catch (error) {
      console.error("❌ EMAIL ERROR:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

