import apiClient from './client';
import { toApiError } from './errors';
import type { Taxonomy } from '../types';
import type { paths } from '../types/api';

type TaxonomyResponse =
  paths['/api/v1/taxonomy']['get']['responses'][200]['content']['application/json'];

// GET /taxonomy — 필터 값 선택 UI(색상/무드/시즌/지역)가 쓰는 통제어휘 SSOT.
// 응답 형태가 이미 Taxonomy와 동일(스네이크 없음)하지만, 계약 경계로 명시 매핑한다.
export async function fetchTaxonomy(): Promise<Taxonomy> {
  try {
    const response = await apiClient.get<TaxonomyResponse>('/taxonomy');

    return {
      colors: response.data.colors,
      moods: response.data.moods,
      seasons: response.data.seasons,
      regions: response.data.regions,
    };
  } catch (error) {
    throw toApiError(error);
  }
}
