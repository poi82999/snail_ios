import apiClient from './client';
import { mapDesignToUi } from './designsApi';
import type { Design, Shop } from '../types';
import type { components, paths } from '../types/api';

type ShopDetailResponse =
  paths['/api/v1/shops/{shop_id}']['get']['responses'][200]['content']['application/json'];
type ShopDesignsQuery = NonNullable<
  paths['/api/v1/shops/{shop_id}/designs']['get']['parameters']['query']
>;
type ShopDesignsResponse =
  paths['/api/v1/shops/{shop_id}/designs']['get']['responses'][200]['content']['application/json'];
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

export function getShopThumbnailUri(shop: ShopPublic): string {
  const thumbnailImage = shop.images?.find((image) => image.is_thumbnail);
  return shop.thumbnail_url ?? thumbnailImage?.image_url ?? shop.images?.[0]?.image_url ?? '';
}

// favorited_by_me는 백엔드 PR #10/#12에서 추가 — 스펙 publish 전이라 옵셔널 확장으로 읽는다.
// publish 후 gen:api 재생성 시 ShopPublic에 흡수되면 이 확장 타입은 제거 가능.
type ShopPublicWithFavorite = ShopPublic & { favorited_by_me?: boolean | null };

function mapShopToUi(shop: ShopPublicWithFavorite): Shop {
  return {
    id: shop.id,
    name: shop.name,
    thumbnailUri: getShopThumbnailUri(shop),
    rating: Number(shop.average_rating),
    reviewCount: shop.review_count,
    favoriteCount: shop.favorite_count,
    isFavorited: shop.favorited_by_me ?? false,
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

export async function fetchShopDesigns(shopId: string): Promise<Design[]> {
  const params: ShopDesignsQuery = { sort: 'latest', limit: SHOP_DESIGN_LIST_LIMIT };
  const response = await apiClient.get<ShopDesignsResponse>(
    `/shops/${encodeURIComponent(shopId)}/designs`,
    { params }
  );

  return response.data.items.map((item) => mapDesignToUi(item, '추천'));
}
