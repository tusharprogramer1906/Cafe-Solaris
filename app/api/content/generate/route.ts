import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCafeContent } from "@/lib/ai/contentGenerator";

const schema = z.object({
  cafeName: z.string().min(2),
  location: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.parse(payload);
    const content = await generateCafeContent(parsed);

    return NextResponse.json({
      success: true,
      ...content,
    });
  } catch (error) {
    console.error("Content generation route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate content." },
      { status: 400 },
    );
  }
}

