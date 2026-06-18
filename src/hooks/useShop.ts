import { useQuery } from '@tanstack/react-query';
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
