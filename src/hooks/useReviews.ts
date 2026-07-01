import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, fetchDesignReviews, fetchShopReviews } from '../api/reviewsApi';

export function useDesignReviews(designId: string) {
  return useQuery({
    queryKey: ['design', designId, 'reviews'],
    queryFn: () => fetchDesignReviews(designId),
    enabled: Boolean(designId),
  });
}

export function useShopReviews(shopId: string) {
  return useQuery({
    queryKey: ['shop', shopId, 'reviews'],
    queryFn: () => fetchShopReviews(shopId),
    enabled: Boolean(shopId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, rating, body }: { reservationId: string; rating: number; body: string }) =>
      createReview(reservationId, { rating, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
