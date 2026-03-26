type ReviewReplyInput = {
  reviewText: string;
  rating: number;
  cafeName?: string;
};

export function generateReviewReply({
  reviewText,
  rating,
  cafeName = "our cafe",
}: ReviewReplyInput) {
  const safeReviewText = reviewText.trim();

  if (rating >= 4) {
    return `Thank you so much for your kind words about ${cafeName}. We are happy you enjoyed your visit. Your support means a lot to our team, and we look forward to serving you again soon.`;
  }

  return `Thank you for your honest feedback. We are sorry your experience did not meet your expectations. We take this seriously and would love to make it right. Please reach out to us directly so we can improve: "${safeReviewText}".`;
}

