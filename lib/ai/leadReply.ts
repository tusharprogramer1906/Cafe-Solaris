import { getOpenAIClient } from "@/lib/openai";

type LeadReplyInput = {
  name: string;
  message: string;
  cafeName?: string;
};

export async function generateLeadReply({
  name,
  message,
  cafeName = "our cafe",
}: LeadReplyInput) {
  const openai = getOpenAIClient();

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You write short WhatsApp-style replies for a premium cafe. Tone must be friendly, classy, human, and concise. Keep it under 45 words.",
      },
      {
        role: "user",
        content: `Lead name: ${name}\nCafe: ${cafeName}\nLead message: ${message}\nWrite a reply now.`,
      },
    ],
  });

  return completion.output_text.trim();
}

