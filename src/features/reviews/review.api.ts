import api from "@/lib/axios";
import {
  createMockReview,
  getMockReviews,
  type MockReviewInput,
} from "@/services/mockDatabase";
import type { Review } from "@/types/review";

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews?: Review[];
  };
}

interface ReviewResponse {
  success: boolean;
  data: Review;
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    const response = await api.get<ReviewsResponse>(`/v1/reviews/${productId}`);
    return response.data.data.reviews ?? [];
  } catch {
    return getMockReviews(productId);
  }
}

export async function submitProductReview(
  input: MockReviewInput
): Promise<Review> {
  if (!input.comment.trim()) {
    throw new Error("Review comment is required");
  }

  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  try {
    const response = await api.post<ReviewResponse>(
      `/v1/reviews/${input.productId}`,
      {
        rating: input.rating,
        comment: input.comment,
      }
    );
    return response.data.data;
  } catch {
    return createMockReview(input);
  }
}
