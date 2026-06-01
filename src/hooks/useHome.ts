import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { getAccessToken } from '../api/authToken';
import { fetchDesignList } from '../api/designsApi';
import { ApiError } from '../api/errors';
import { addFavorite, removeFavorite } from '../api/favoriteApi';
import { Design, FilterId, HomeTab } from '../types';

interface LikeToggleVariables {
  designId: string;
  isLiked: boolean;
}

interface LikeToggleContext {
  previousDesigns: Array<[QueryKey, Design[] | undefined]>;
}

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

  return useMutation<void, ApiError, LikeToggleVariables, LikeToggleContext>({
    mutationFn: async ({ designId, isLiked }) => {
      // 토큰이 없으면 네트워크 요청 전에 로그인 필요 상태를 화면에 전달한다.
      if (!getAccessToken()) {
        throw new ApiError({
          code: 'UNAUTHORIZED',
          message: '로그인이 필요합니다.',
          status: 401,
        });
      }

      if (isLiked) {
        await addFavorite(designId);
        return;
      }

      await removeFavorite(designId);
    },
    onMutate: async ({ designId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['designs'] });

      const previousDesigns = queryClient.getQueriesData<Design[]>({
        queryKey: ['designs'],
      });

      // 모든 홈 디자인 캐시에 같은 찜 상태를 반영해 탭 간 표시가 어긋나지 않게 한다.
      // ['designs'] prefix는 무한쿼리(['designs','infinite',...]: InfiniteData)도 매칭되므로,
      // Design[] 배열 형태가 아닌 캐시는 건드리지 않는다(런타임 타입 오류 방지).
      queryClient.setQueriesData<Design[]>({ queryKey: ['designs'] }, (old) =>
        Array.isArray(old)
          ? old.map((d) =>
              d.id === designId
                ? {
                    ...d,
                    isLiked,
                    likeCount: Math.max(
                      0,
                      d.likeCount + (d.isLiked === isLiked ? 0 : isLiked ? 1 : -1)
                    ),
                  }
                : d
            )
          : old
      );

      return { previousDesigns };
    },
    onError: (_error, _variables, context) => {
      context?.previousDesigns.forEach(([queryKey, data]) => {
        queryClient.setQueryData<Design[]>(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
  });
}
