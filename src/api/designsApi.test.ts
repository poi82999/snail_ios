import { describe, expect, it } from '@jest/globals';
import {
  buildDesignQuery,
  getDesignImageUri,
  isDesignPublic,
  mapDesignToUi,
} from './designsApi';
import type { components } from '../types/api';

type DesignPublic = components['schemas']['DesignPublic'];

describe('buildDesignQuery', () => {
  it('빈 필터는 limit만 포함', () => {
    expect(buildDesignQuery({})).toEqual({ limit: 20 });
  });

  it('텍스트는 trim하고 공백뿐인 값은 제외', () => {
    expect(buildDesignQuery({ q: '  네일  ', region: '   ' })).toEqual({
      limit: 20,
      q: '네일',
    });
  });

  it('가격/소요시간 0도 포함된다 (undefined만 제외)', () => {
    const q = buildDesignQuery({ priceMin: 0, durationMax: 0 });
    expect(q.price_min).toBe(0);
    expect(q.duration_max).toBe(0);
  });

  it('배열 필터는 비어있지 않을 때만 포함', () => {
    expect(buildDesignQuery({ colors: [], moods: ['청순'] })).toEqual({
      limit: 20,
      moods: ['청순'],
    });
  });

  it('cursor는 null/undefined면 제외, 값이 있으면 포함', () => {
    expect(buildDesignQuery({}, null)).toEqual({ limit: 20 });
    expect(buildDesignQuery({}, 'cur')).toEqual({ limit: 20, cursor: 'cur' });
  });
});

describe('isDesignPublic', () => {
  it('base_price/shop/favorite_count가 있으면 DesignPublic', () => {
    const item = { base_price: 1, shop: {}, favorite_count: 0 } as unknown as DesignPublic;
    expect(isDesignPublic(item)).toBe(true);
  });

  it('해당 키가 없으면 false', () => {
    const item = { id: 'x', name: '샵' } as unknown as DesignPublic;
    expect(isDesignPublic(item)).toBe(false);
  });
});

function makeDesign(overrides: Partial<DesignPublic> = {}): DesignPublic {
  return {
    id: 'd1',
    title: '디자인',
    base_price: 30000,
    duration_minutes: 60,
    ai_tags: [],
    owner_tags: [],
    color_palette: [],
    shop: { id: 's1', name: '샵', region: '강남' },
    average_rating: 4.5,
    favorite_count: 12,
    favorited_by_me: false,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as DesignPublic;
}

describe('getDesignImageUri', () => {
  it('thumbnail_url을 최우선 사용', () => {
    const d = makeDesign({ thumbnail_url: 'thumb.jpg' });
    expect(getDesignImageUri(d)).toBe('thumb.jpg');
  });

  it('thumbnail_url이 없으면 썸네일 지정 이미지의 processed_url', () => {
    const d = makeDesign({
      thumbnail_url: null,
      images: [
        { id: 'i1', original_url: 'o1.jpg', processed_url: 'p1.jpg', is_thumbnail: true } as never,
      ],
    });
    expect(getDesignImageUri(d)).toBe('p1.jpg');
  });

  it('아무 이미지도 없으면 빈 문자열', () => {
    expect(getDesignImageUri(makeDesign({ thumbnail_url: null }))).toBe('');
  });
});

describe('mapDesignToUi', () => {
  it('서버 DesignPublic을 UI Design 모델로 평탄화', () => {
    const ui = mapDesignToUi(makeDesign({ thumbnail_url: 'thumb.jpg' }), '추천');
    expect(ui).toMatchObject({
      id: 'd1',
      shopId: 's1',
      shopName: '샵',
      location: '강남',
      price: 30000,
      likeCount: 12,
      imageUri: 'thumb.jpg',
      isLiked: false,
      tab: ['추천'],
    });
  });
});
