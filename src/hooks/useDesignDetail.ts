import { useQuery } from '@tanstack/react-query';
import { fetchDesignDetail, fetchRelatedDesigns } from '../api/designDetailApi';

export function useDesignDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => fetchDesignDetail(id),
    enabled: options?.enabled ?? Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

// 상세 화면 하단 "연관 추천" 섹션용. design 상세와 별개 쿼리.
export function useRelatedDesigns(id: string, limit?: number) {
  return useQuery({
    queryKey: ['design', id, 'related', limit ?? null],
    queryFn: () => fetchRelatedDesigns(id, limit),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
