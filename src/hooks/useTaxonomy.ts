import { useQuery } from '@tanstack/react-query';

import { fetchTaxonomy } from '../api/taxonomyApi';
import type { ApiError } from '../api/errors';
import type { Taxonomy } from '../types';

// 필터 값 선택 UI용 통제어휘. 거의 변하지 않으므로 길게 캐시한다.
export function useTaxonomy() {
  return useQuery<Taxonomy, ApiError>({
    queryKey: ['taxonomy'],
    queryFn: fetchTaxonomy,
    staleTime: 1000 * 60 * 60, // 1시간
  });
}
