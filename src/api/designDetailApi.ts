import apiClient from './client';
import type { DesignDetail } from '../types';
import type { components, paths } from '../types/api';

type DesignDetailResponse =
  paths['/api/v1/designs/{design_id}']['get']['responses'][200]['content']['application/json'];
type DesignPublic = components['schemas']['DesignPublic'];

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

function mapDesignToDetail(design: DesignPublic): DesignDetail {
  return {
    id: design.id,
    shopName: design.shop.name,
    location: design.shop.region ?? '',
    price: design.base_price,
    likeCount: design.favorite_count,
    imageUri: getDesignImageUri(design),
    isLiked: design.favorited_by_me ?? false,
    tab: [],
    duration: design.duration_minutes,
    tags: design.ai_tags ?? [],
    // TODO: 별도 엔드포인트 필요
    snailPosts: [],
    // TODO: 별도 엔드포인트 필요
    relatedDesigns: [],
  };
}

export async function fetchDesignDetail(id: string): Promise<DesignDetail> {
  const response = await apiClient.get<DesignDetailResponse>(
    `/designs/${encodeURIComponent(id)}`
  );

  return mapDesignToDetail(response.data);
}
