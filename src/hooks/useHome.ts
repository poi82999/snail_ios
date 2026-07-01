import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { getAccessToken } from '../api/authToken';
import { fetchDesignList } from '../api/designsApi';
import { ApiError } from '../api/errors';
import { toggleFavorite } from '../api/favoriteApi';
import { useRequireAuth } from './useRequireAuth';
import { Design, FilterId, HomeTab } from '../types';

interface LikeToggleVariables {
  designId: string;
  isLiked: boolean;
}

interface LikeToggleContext {
  previousDesigns: [QueryKey, unknown][];
  previousShopDesigns: [QueryKey, unknown][];
}

async function fetchDesigns(tab: HomeTab, filters: FilterId[]): Promise<Design[]> {
  return fetchDesignList(tab, filters);
}

function patchDesign(d: Design, designId: string, isLiked: boolean): Design {
  if (d.id !== designId) return d;
  return {
    ...d,
    isLiked,
    likeCount: Math.max(0, d.likeCount + (d.isLiked === isLiked ? 0 : isLiked ? 1 : -1)),
  };
}

// ['designs'] prefix는 단발 쿼리(Design[])와 무한 쿼리(InfiniteData<{designs:Design[]}>)를
// 모두 매칭한다. 두 캐시 형태를 모두 안전하게 패치한다.
function patchDesignsCache(old: unknown, designId: string, isLiked: boolean): unknown {
  if (Array.isArray(old)) {
    return (old as Design[]).map((d) => patchDesign(d, designId, isLiked));
  }
  if (old && typeof old === 'object' && 'pages' in old) {
    const data = old as { pages: { designs: Design[] }[] };
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        designs: page.designs.map((d) => patchDesign(d, designId, isLiked)),
      })),
    };
  }
  return old;
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
    mutationFn: async ({ designId }) => {
      // 토큰이 없으면 네트워크 요청 전에 로그인 필요 상태를 화면에 전달한다.
      if (!getAccessToken()) {
        throw new ApiError({
          code: 'UNAUTHORIZED',
          message: '로그인이 필요합니다.',
          status: 401,
        });
      }

      // 백엔드는 단일 POST 토글이다. isLiked는 onMutate의 낙관적 패치에만 쓰고,
      // 실제 최종 상태는 onSettled의 invalidate로 서버 기준으로 다시 맞춘다.
      await toggleFavorite(designId);
    },
    onMutate: async ({ designId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['designs'] });
      await queryClient.cancelQueries({ queryKey: ['shop'] });

      const previousDesigns = queryClient.getQueriesData({ queryKey: ['designs'] });
      const previousShopDesigns = queryClient.getQueriesData({ queryKey: ['shop'] });

      // 홈/검색 디자인 캐시 낙관적 반영
      queryClient.setQueriesData({ queryKey: ['designs'] }, (old) =>
        patchDesignsCache(old, designId, isLiked)
      );
      // 샵 상세 디자인 캐시 낙관적 반영
      queryClient.setQueriesData({ queryKey: ['shop'] }, (old) =>
        patchDesignsCache(old, designId, isLiked)
      );

      return { previousDesigns, previousShopDesigns };
    },
    onError: (_error, _variables, context) => {
      context?.previousDesigns.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousShopDesigns.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design'] });
      queryClient.invalidateQueries({ queryKey: ['shop'] });
    },
  });
}

const LIKE_LOGIN_MESSAGE = '로그인하고 마음에 드는 디자인을 찜해보세요';

/**
 * 비회원 게이팅이 적용된 찜 토글.
 * 로그인 상태면 실제 토글을 실행하고, 비회원이면 로그인 유도 모달을 띄운다.
 * 호출부 시그니처는 useLikeToggle().mutate와 동일: toggleLike({ designId, isLiked }).
 */
export function useGuardedLikeToggle() {
  const { mutate } = useLikeToggle();
  const { requireAuth } = useRequireAuth();

  function toggleLike(variables: LikeToggleVariables): void {
    requireAuth(() => mutate(variables), LIKE_LOGIN_MESSAGE);
  }

  return { toggleLike };
}
