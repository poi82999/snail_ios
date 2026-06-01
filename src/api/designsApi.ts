import apiClient from './client';
import type { Design, FilterId, HomeTab } from '../types';
import type { components, paths } from '../types/api';

type DesignsQuery = NonNullable<paths['/api/v1/designs']['get']['parameters']['query']>;
type DesignsResponse =
  paths['/api/v1/designs']['get']['responses'][200]['content']['application/json'];
type DesignPublic = components['schemas']['DesignPublic'];
type SearchItem = DesignsResponse['items'][number];
type DesignSort = NonNullable<DesignsQuery['sort']>;

const DESIGN_LIST_LIMIT = 20;

function getSortForTab(tab: HomeTab): DesignSort {
  switch (tab) {
    case '랭킹':
      return 'popular';
    case '이달의 아트':
      // TODO: 백엔드 sort enum 확인 - 월간 아트 전용 정렬값이 없어 최신순으로 요청한다.
      return 'latest';
    case '추천':
    default:
      return 'relevance';
  }
}

function isDesignPublic(item: SearchItem): item is DesignPublic {
  return 'base_price' in item && 'shop' in item && 'favorite_count' in item;
}

function getDesignImageUri(design: DesignPublic): string {
  const thumbnailImage = design.images?.find((image) => image.is_thumbnail);
  const firstImage = thumbnailImage ?? design.images?.[0];

  return (
    design.thumbnail_url ??
    firstImage?.processed_url ??
    firstImage?.original_url ??
    ''
  );
}

function mapDesignToUi(design: DesignPublic, tab: HomeTab): Design {
  return {
    id: design.id,
    shopName: design.shop.name,
    location: design.shop.region ?? '',
    price: design.base_price,
    likeCount: design.favorite_count,
    imageUri: getDesignImageUri(design),
    isLiked: design.favorited_by_me ?? false,
    tab: [tab],
  };
}

export async function fetchDesignList(
  tab: HomeTab,
  filters: FilterId[]
): Promise<Design[]> {
  void filters;

  const params: DesignsQuery = {
    sort: getSortForTab(tab),
    limit: DESIGN_LIST_LIMIT,
  };

  const response = await apiClient.get<DesignsResponse>('/designs', { params });

  return response.data.items
    .filter(isDesignPublic)
    .map((design) => mapDesignToUi(design, tab));
}
