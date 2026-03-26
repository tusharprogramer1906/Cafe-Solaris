import { getOpenAIClient } from "@/lib/openai";

type ContentInput = {
  cafeName: string;
  location: string;
};

export async function generateCafeContent({ cafeName, location }: ContentInput) {
  const openai = getOpenAIClient();

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a social media strategist for cafes. Return valid JSON only with keys: captions (array of 5 strings), hashtags (array of strings), reelIdeas (array of 3 strings). Tone: trendy, engaging, local SEO optimized.",
      },
      {
        role: "user",
        content: `Cafe name: ${cafeName}\nLocation: ${location}`,
      },
    ],
  });

  const raw = completion.output_text.trim();
  const parsed = JSON.parse(raw) as {
    captions: string[];
    hashtags: string[];
    reelIdeas: string[];
  };

  return parsed;
}

