import { useQuery } from '@tanstack/react-query';
import { fetchDesignDetail } from '../api/designDetailApi';

export function useDesignDetail(id: string) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => fetchDesignDetail(id),
    staleTime: 1000 * 60 * 5,
  });
}
