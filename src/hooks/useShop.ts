import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleShopFavorite, type FavoriteToggleResult } from '../api/favoriteApi';
import type { ApiError } from '../api/errors';
import { fetchShopDesigns, fetchShopDetail } from '../api/shopApi';

export function useShopDetail(shopId: string) {
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => fetchShopDetail(shopId),
    enabled: Boolean(shopId),
  });
}

export function useShopDesigns(shopId: string) {
  return useQuery({
    queryKey: ['shop', shopId, 'designs'],
    queryFn: () => fetchShopDesigns(shopId),
    enabled: Boolean(shopId),
  });
}

// 샵 찜 토글 — 디자인 찜(useLikeToggle)과 동일하게 응답({liked, likeCount})이 최종 상태다.
// 화면은 낙관적 오버라이드로 즉시 반영하고, 여기서는 관련 캐시만 서버 기준으로 재동기화한다.
export function useShopFavoriteToggle(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation<FavoriteToggleResult, ApiError, void>({
    mutationFn: () => toggleShopFavorite(shopId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'shops'] });
    },
  });
}
