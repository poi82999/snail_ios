import apiClient from './client';
import { toApiError } from './errors';
import { mapDesignToUi } from './designsApi';
import { getShopThumbnailUri } from './shopApi';
import type { Design, ShopSearchResult } from '../types';
import type { components } from '../types/api';

type LikeToggleResponse = components['schemas']['LikeToggleResponse'];

export interface FavoriteToggleResult {
  liked: boolean;
  likeCount: number;
}

type DesignPublic = components['schemas']['DesignPublic'];
type ShopPublic   = components['schemas']['ShopPublic'];

type FavDesignsResponse = { items: DesignPublic[]; next_cursor: string | null };
type FavShopsResponse   = { items: ShopPublic[];   next_cursor: string | null };

export async function fetchFavoriteDesigns(cursor?: string): Promise<{ designs: Design[]; nextCursor: string | null }> {
  const params: Record<string, string> = { limit: '20' };
  if (cursor) params.cursor = cursor;
  const res = await apiClient.get<FavDesignsResponse>('/me/favorites/designs', { params });
  return {
    designs: res.data.items.map(d => mapDesignToUi(d, '추천')),
    nextCursor: res.data.next_cursor,
  };
}

export async function fetchFavoriteShops(cursor?: string): Promise<{ shops: ShopSearchResult[]; nextCursor: string | null }> {
  const params: Record<string, string> = { limit: '20' };
  if (cursor) params.cursor = cursor;
  const res = await apiClient.get<FavShopsResponse>('/me/favorites/shops', { params });
  return {
    shops: res.data.items.map(s => ({
      id: s.id,
      name: s.name,
      location: s.region ?? '',
      thumbnailUri: getShopThumbnailUri(s),
    })),
    nextCursor: res.data.next_cursor,
  };
}

function getFavoritePath(designId: string): string {
  return `/designs/${encodeURIComponent(designId)}/favorite`;
}

// 백엔드 즐겨찾기는 단일 POST 토글이다(찜/해제가 같은 엔드포인트). 별도 DELETE는 없다.
// 응답으로 토글 후 최종 상태({liked, like_count})를 돌려준다.
// Idempotency-Key는 apiClient 요청 인터셉터가 POST에 자동으로 붙인다.
export async function toggleFavorite(designId: string): Promise<FavoriteToggleResult> {
  try {
    const response = await apiClient.post<LikeToggleResponse>(getFavoritePath(designId));
    return { liked: response.data.liked, likeCount: response.data.like_count };
  } catch (error) {
    throw toApiError(error);
  }
}
