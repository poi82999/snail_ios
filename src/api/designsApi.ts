import apiClient from './client';
import type { Design, DesignSort, FilterId, HomeTab, SearchFilters } from '../types';
import type { components, paths } from '../types/api';

type DesignsQuery = NonNullable<paths['/api/v1/designs']['get']['parameters']['query']>;
type DesignsResponse =
  paths['/api/v1/designs']['get']['responses'][200]['content']['application/json'];
type DesignPublic = components['schemas']['DesignPublic'];
type SearchItem = DesignsResponse['items'][number];

const DESIGN_LIST_LIMIT = 20;

function getSortForTab(tab: HomeTab): DesignSort {
  switch (tab) {
    case '랭킹':
      return 'popular';
    case '이달의 아트':
      return 'monthly';
    case '추천':
    default:
      return 'relevance';
  }
}

export function isDesignPublic(item: SearchItem): item is DesignPublic {
  return 'base_price' in item && 'shop' in item && 'favorite_count' in item;
}

export function getDesignImageUri(design: DesignPublic): string {
  const thumbnailImage = design.images?.find((image) => image.is_thumbnail);
  const firstImage = thumbnailImage ?? design.images?.[0];

  return (
    design.thumbnail_url ??
    firstImage?.processed_url ??
    firstImage?.original_url ??
    ''
  );
}

export function mapDesignToUi(design: DesignPublic, tab: HomeTab): Design {
  return {
    id: design.id,
    shopId: design.shop.id,
    shopName: design.shop.name,
    location: design.shop.region ?? '',
    price: design.base_price,
    likeCount: design.favorite_count,
    imageUri: getDesignImageUri(design),
    isLiked: design.favorited_by_me ?? false,
    tab: [tab],
  };
}

function hasText(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function hasValues(values: string[] | undefined): values is string[] {
  return values !== undefined && values.length > 0;
}

export function buildDesignQuery(
  filters: SearchFilters,
  cursor?: string | null
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    limit: DESIGN_LIST_LIMIT,
  };

  if (hasText(filters.q)) params.q = filters.q.trim();
  if (hasText(filters.region)) params.region = filters.region.trim();
  if (hasValues(filters.colors)) params.colors = filters.colors;
  if (hasValues(filters.moods)) params.moods = filters.moods;
  if (filters.priceMin !== undefined) params.price_min = filters.priceMin;
  if (filters.priceMax !== undefined) params.price_max = filters.priceMax;
  if (filters.durationMin !== undefined) params.duration_min = filters.durationMin;
  if (filters.durationMax !== undefined) params.duration_max = filters.durationMax;
  if (filters.sort !== undefined) params.sort = filters.sort;
  if (cursor !== undefined && cursor !== null) params.cursor = cursor;

  return params;
}

export async function fetchDesignList(
  tab: HomeTab,
  filters: FilterId[]
): Promise<Design[]> {
  // FilterId는 값 없는 카테고리 칩이라 API 필터로 매핑할 수 없다.
  // 값 기반 필터링은 SearchFilters 경로(buildDesignQuery)를 사용한다.
  const params: DesignsQuery = buildDesignQuery({ sort: getSortForTab(tab) }) as DesignsQuery;

  const response = await apiClient.get<DesignsResponse>('/designs', { params });

  return response.data.items
    .filter(isDesignPublic)
    .map((design) => mapDesignToUi(design, tab));
}
