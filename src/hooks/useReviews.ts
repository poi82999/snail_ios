import { useQuery } from '@tanstack/react-query';
import { fetchDesignReviews } from '../api/reviewsApi';

export function useDesignReviews(designId: string) {
  return useQuery({
    queryKey: ['design', designId, 'reviews'],
    queryFn: () => fetchDesignReviews(designId),
    enabled: Boolean(designId),
  });
}
