import apiClient from './client';
import { mapDesignToUi } from './designsApi';
import type { Design, Designer, DesignDetail, DesignOption } from '../types';
import type { components, paths } from '../types/api';

type DesignDetailResponse =
  paths['/api/v1/designs/{design_id}']['get']['responses'][200]['content']['application/json'];
type RelatedOperation = paths['/api/v1/designs/{design_id}/related']['get'];
type RelatedResponse =
  RelatedOperation['responses'][200]['content']['application/json'];
type DesignPublic = components['schemas']['DesignPublic'];
type DesignDesignerPublic = components['schemas']['DesignDesignerPublic'];
type DesignOptionPublic = components['schemas']['DesignOptionPublic'];

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

function mapDesigner(designer: DesignDesignerPublic): Designer {
  return {
    id: designer.id,
    name: designer.name,
    position: designer.position ?? '',
    profileImageUri: designer.profile_image_url ?? '',
    specialtyTags: designer.specialty_tags ?? [],
    // 백엔드에 duration_minutes 필드가 추가되면 자동으로 반영됨
    durationMinutes: (designer as any).duration_minutes ?? null,
  };
}

function mapOption(option: DesignOptionPublic): DesignOption {
  return {
    id: option.id,
    kind: option.kind,
    name: option.name,
    priceDelta: option.price_delta,
    durationDelta: option.duration_delta_min,
  };
}

function mapDesignToDetail(design: DesignPublic): DesignDetail {
  return {
    id: design.id,
    shopId: design.shop.id,
    shopName: design.shop.name,
    location: design.shop.region ?? '',
    price: design.base_price,
    likeCount: design.favorite_count,
    imageUri: getDesignImageUri(design),
    isLiked: design.favorited_by_me ?? false,
    tab: [],
    duration: design.duration_minutes,
    tags: [],
    designers: (design.designers ?? []).map(mapDesigner),
    options: (design.options ?? [])
      .filter((option) => option.is_active)
      .map(mapOption),
  };
}

export async function fetchDesignDetail(id: string): Promise<DesignDetail> {
  const response = await apiClient.get<DesignDetailResponse>(
    `/designs/${encodeURIComponent(id)}`
  );

  return mapDesignToDetail(response.data);
}

// GET /designs/{id}/related — 연관 추천 디자인(상세 화면 하단 섹션).
// 응답은 DesignPublic[] → 홈/검색과 동일한 Design 카드 모델로 매핑.
export async function fetchRelatedDesigns(
  id: string,
  limit?: number
): Promise<Design[]> {
  const response = await apiClient.get<RelatedResponse>(
    `/designs/${encodeURIComponent(id)}/related`,
    { params: limit !== undefined ? { limit } : undefined }
  );

  return response.data.map((design) => mapDesignToUi(design, '추천'));
}
