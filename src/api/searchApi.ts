import apiClient from './client';
import { buildDesignQuery, isDesignPublic, mapDesignToUi } from './designsApi';
import type { Design, SearchFilters, ShopSearchResult } from '../types';
import type { components, paths } from '../types/api';

type SearchQuery = NonNullable<paths['/api/v1/search']['get']['parameters']['query']>;
type SearchResponse =
  paths['/api/v1/search']['get']['responses'][200]['content']['application/json'];
type SearchScope = NonNullable<SearchQuery['scope']>;
type ShopPublic = components['schemas']['ShopPublic'];

export interface DesignSearchPage {
  designs: Design[];
  nextCursor: string | null;
}

export interface ShopSearchPage {
  shops: ShopSearchResult[];
  nextCursor: string | null;
}

function isShopPublic(item: unknown): item is ShopPublic {
  return typeof item === 'object' && item !== null && 'phone_number' in item && 'average_rating' in item;
}

function mapShopToSearchResult(shop: ShopPublic): ShopSearchResult {
  return {
    id: shop.id,
    name: shop.name,
    location: shop.region ?? shop.address,
    thumbnailUri: shop.thumbnail_url ?? '',
  };
}

export async function searchDesigns(
  filters: SearchFilters,
  cursor?: string | null
): Promise<DesignSearchPage> {
  const scope: SearchScope = 'designs';
  const params = { scope, ...buildDesignQuery(filters, cursor) };
  const response = await apiClient.get<SearchResponse>('/search', { params });
  return {
    designs: response.data.items.filter(isDesignPublic).map((d) => mapDesignToUi(d, '추천')),
    nextCursor: response.data.next_cursor ?? null,
  };
}

export async function searchShops(
  filters: SearchFilters,
  cursor?: string | null
): Promise<ShopSearchPage> {
  const scope: SearchScope = 'shops';
  const params = { scope, ...buildDesignQuery(filters, cursor) };
  const response = await apiClient.get<SearchResponse>('/search', { params });
  return {
    shops: response.data.items.filter(isShopPublic).map(mapShopToSearchResult),
    nextCursor: response.data.next_cursor ?? null,
  };
}
