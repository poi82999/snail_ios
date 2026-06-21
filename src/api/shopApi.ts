import apiClient from './client';
import { isDesignPublic, mapDesignToUi } from './designsApi';
import type { Design, Shop } from '../types';
import type { components, paths } from '../types/api';

type ShopDetailResponse =
  paths['/api/v1/shops/{shop_id}']['get']['responses'][200]['content']['application/json'];
type DesignsQuery = NonNullable<paths['/api/v1/designs']['get']['parameters']['query']>;
type DesignsResponse =
  paths['/api/v1/designs']['get']['responses'][200]['content']['application/json'];
type ShopPublic = components['schemas']['ShopPublic'];

const SHOP_DESIGN_LIST_LIMIT = 50;

function formatHourPart(time?: string | null): string {
  return time ? time.slice(0, 5) : '';
}

function getTodayHoursLabel(shop: ShopPublic): string {
  const todayWeekday = new Date().getDay();
  const entry = shop.business_hours?.find((hour) => hour.weekday === todayWeekday);

  if (!entry || entry.is_closed || !entry.open_time || !entry.close_time) {
    return '휴무';
  }

  return `${formatHourPart(entry.open_time)} - ${formatHourPart(entry.close_time)}`;
}

function getShopThumbnailUri(shop: ShopPublic): string {
  const thumbnailImage = shop.images?.find((image) => image.is_thumbnail);
  return shop.thumbnail_url ?? thumbnailImage?.image_url ?? shop.images?.[0]?.image_url ?? '';
}

function mapShopToUi(shop: ShopPublic): Shop {
  return {
    id: shop.id,
    name: shop.name,
    thumbnailUri: getShopThumbnailUri(shop),
    rating: Number(shop.average_rating),
    reviewCount: shop.review_count,
    favoriteCount: shop.favorite_count,
    address: shop.address,
    todayHoursLabel: getTodayHoursLabel(shop),
    phoneNumber: shop.phone_number,
  };
}

export async function fetchShopDetail(shopId: string): Promise<Shop> {
  const response = await apiClient.get<ShopDetailResponse>(
    `/shops/${encodeURIComponent(shopId)}`
  );

  return mapShopToUi(response.data);
}

// 샵 단위 디자인 목록 전용 엔드포인트가 아직 없어, 검색 결과를 shop.id로 클라이언트에서 필터링한다.
// TODO(백엔드): GET /shops/{shop_id}/designs 추가되면 이 필터링을 제거하고 교체.
export async function fetchShopDesigns(shopId: string): Promise<Design[]> {
  const params: DesignsQuery = { sort: 'latest', limit: SHOP_DESIGN_LIST_LIMIT };
  const response = await apiClient.get<DesignsResponse>('/designs', { params });

  return response.data.items
    .filter(isDesignPublic)
    .filter((item) => item.shop.id === shopId)
    .map((item) => mapDesignToUi(item, '추천'));
}
