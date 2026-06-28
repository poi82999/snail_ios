import apiClient from './client';
import { toApiError } from './errors';
import type { components } from '../types/api';

type LikeToggleResponse = components['schemas']['LikeToggleResponse'];

export interface FavoriteToggleResult {
  liked: boolean;
  likeCount: number;
}

function getFavoritePath(designId: string): string {
  return `/designs/${encodeURIComponent(designId)}/favorite`;
}

// 백엔드 즐겨찾기는 단일 POST 토글이다(찜/해제가 같은 엔드포인트). 별도 DELETE는 없다.
// 응답으로 토글 후 최종 상태({liked, like_count})를 돌려준다.
export async function toggleFavorite(designId: string): Promise<FavoriteToggleResult> {
  try {
    const response = await apiClient.post<LikeToggleResponse>(getFavoritePath(designId));
    return { liked: response.data.liked, likeCount: response.data.like_count };
  } catch (error) {
    throw toApiError(error);
  }
}
