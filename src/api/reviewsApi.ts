import apiClient from './client';
import type { components, paths } from '../types/api';

type ReviewsResponse =
  paths['/api/v1/designs/{design_id}/reviews']['get']['responses'][200]['content']['application/json'];
type ReviewPublic = components['schemas']['ReviewPublic'];

export interface DesignReview {
  id: string;
  username: string;
  rating: number;
  date: string; // "2026.06.07"
  comment: string;
}

function formatReviewDate(createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function mapReviewToUi(review: ReviewPublic): DesignReview {
  return {
    id: review.id,
    username: review.author.nickname,
    rating: review.rating,
    date: formatReviewDate(review.created_at),
    comment: review.body ?? '',
  };
}

export async function fetchDesignReviews(designId: string): Promise<DesignReview[]> {
  const response = await apiClient.get<ReviewsResponse>(
    `/designs/${encodeURIComponent(designId)}/reviews`
  );

  return response.data.map(mapReviewToUi);
}
