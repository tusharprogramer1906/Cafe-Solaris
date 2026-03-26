import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReviewReply } from "@/lib/ai/reviewReply";

const schema = z.object({
  reviewText: z.string().min(2),
  rating: z.number().min(1).max(5),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.parse(payload);

    const reply = generateReviewReply({
      reviewText: parsed.reviewText,
      rating: parsed.rating,
      cafeName: process.env.CAFE_NAME ?? "our cafe",
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Review reply route error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate review reply." },
      { status: 400 },
    );
  }
}

