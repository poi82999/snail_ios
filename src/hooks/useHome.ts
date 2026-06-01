import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDesignList } from '../api/designsApi';
import { Design, FilterId, HomeTab } from '../types';

async function fetchDesigns(tab: HomeTab, filters: FilterId[]): Promise<Design[]> {
  return fetchDesignList(tab, filters);
}

export function useDesigns(tab: HomeTab, filters: FilterId[]) {
  return useQuery({
    queryKey: ['designs', tab, filters],
    queryFn: () => fetchDesigns(tab, filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLikeToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ designId, isLiked }: { designId: string; isLiked: boolean }) => {
      // TODO: API 연결 시 교체
      // await axios.post(`${BASE_URL}/designs/${designId}/like`, { isLiked });
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { designId, isLiked };
    },
    onSuccess: ({ designId, isLiked }) => {
      queryClient.setQueriesData<Design[]>({ queryKey: ['designs'] }, (old) =>
        old?.map((d) =>
          d.id === designId
            ? { ...d, isLiked, likeCount: d.likeCount + (isLiked ? 1 : -1) }
            : d
        )
      );
    },
  });
}
