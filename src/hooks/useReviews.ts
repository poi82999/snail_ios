import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, fetchDesignReviews } from '../api/reviewsApi';

export function useDesignReviews(designId: string) {
  return useQuery({
    queryKey: ['design', designId, 'reviews'],
    queryFn: () => fetchDesignReviews(designId),
    enabled: Boolean(designId),
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
