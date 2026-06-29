import apiClient from './client';
import { toApiError } from './errors';
import { mapDesignToUi } from './designsApi';
import { getShopThumbnailUri } from './shopApi';
import type { Design, ShopSearchResult } from '../types';
import type { components } from '../types/api';

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

export async function addFavorite(designId: string): Promise<void> {
  try {
    await apiClient.post(getFavoritePath(designId));
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeFavorite(designId: string): Promise<void> {
  try {
    await apiClient.delete(getFavoritePath(designId));
  } catch (error) {
    throw toApiError(error);
  }
}
