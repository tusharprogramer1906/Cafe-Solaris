"use client";

import { useState } from "react";

type ContentResult = {
  captions: string[];
  hashtags: string[];
  reelIdeas: string[];
};

export function AITools() {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewReply, setReviewReply] = useState("");

  const [cafeName, setCafeName] = useState("");
  const [location, setLocation] = useState("");
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);

  async function generateReviewReply() {
    const response = await fetch("/api/review-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewText, rating }),
    });
    const data = await response.json();
    if (response.ok) {
      setReviewReply(data.reply);
    }
  }

  async function generateContent() {
    const response = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cafeName, location }),
    });
    const data = await response.json();
    if (response.ok) {
      setContentResult({
        captions: data.captions,
        hashtags: data.hashtags,
        reelIdeas: data.reelIdeas,
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Review Reply Generator</h3>
        <p className="mt-1 text-sm text-zinc-400">Generate polished responses to customer reviews.</p>
        <textarea
          className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100"
          rows={4}
          placeholder="Paste review text"
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
        />
        <input
          type="number"
          min={1}
          max={5}
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        />
        <button
          onClick={generateReviewReply}
          className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Generate Reply
        </button>
        {reviewReply ? <p className="mt-3 text-sm text-zinc-200">{reviewReply}</p> : null}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Instagram Content Generator</h3>
        <p className="mt-1 text-sm text-zinc-400">Create local SEO content ideas in seconds.</p>
        <input
          className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100"
          placeholder="Cafe name"
          value={cafeName}
          onChange={(event) => setCafeName(event.target.value)}
        />
        <input
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100"
          placeholder="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button
          onClick={generateContent}
          className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Generate Content
        </button>
        {contentResult ? (
          <div className="mt-4 space-y-3 text-sm text-zinc-200">
            <p className="font-semibold">Captions:</p>
            <ul className="list-disc space-y-1 pl-5">
              {contentResult.captions.map((caption) => (
                <li key={caption}>{caption}</li>
              ))}
            </ul>
            <p>
              <span className="font-semibold">Hashtags:</span> {contentResult.hashtags.join(" ")}
            </p>
            <p className="font-semibold">Reel Ideas:</p>
            <ul className="list-disc space-y-1 pl-5">
              {contentResult.reelIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

