import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import apiClient from '../api/client';
import {
  buildDesignQuery,
  isDesignPublic,
  mapDesignToUi,
} from '../api/designsApi';
import type { Design, DesignSort, HomeTab, SearchFilters } from '../types';
import type { paths } from '../types/api';

type DesignsResponse =
  paths['/api/v1/designs']['get']['responses'][200]['content']['application/json'];
type InfiniteDesignsQueryKey = readonly [
  'designs',
  'infinite',
  HomeTab,
  SearchFilters,
];

interface DesignListPage {
  designs: Design[];
  nextCursor: string | null;
}

type InfiniteDesignsQueryResult = UseInfiniteQueryResult<
  InfiniteData<DesignListPage>,
  Error
>;

export type UseInfiniteDesignsResult = InfiniteDesignsQueryResult & {
  designs: Design[];
  query: InfiniteDesignsQueryResult;
};

function getSortForTab(tab: HomeTab): DesignSort {
  switch (tab) {
    case '랭킹':
      return 'popular';
    case '이달의 아트':
      return 'latest';
    case '추천':
    default:
      return 'relevance';
  }
}

function mergeTabSort(tab: HomeTab, filters: SearchFilters | undefined): SearchFilters {
  return {
    ...filters,
    sort: getSortForTab(tab),
  };
}

async function fetchDesignPage(
  tab: HomeTab,
  filters: SearchFilters,
  cursor?: string | null
): Promise<DesignListPage> {
  // 홈 탭은 화면 탭 의미를 유지해야 하므로 /designs 응답을 탭별 UI 모델로 직접 매핑한다.
  const response = await apiClient.get<DesignsResponse>('/designs', {
    params: buildDesignQuery(filters, cursor),
  });

  return {
    designs: response.data.items
      .filter(isDesignPublic)
      .map((design) => mapDesignToUi(design, tab)),
    nextCursor: response.data.next_cursor ?? null,
  };
}

export function useInfiniteDesigns(
  tab: HomeTab,
  filters?: SearchFilters
): UseInfiniteDesignsResult {
  const mergedFilters = mergeTabSort(tab, filters);
  const query = useInfiniteQuery<
    DesignListPage,
    Error,
    InfiniteData<DesignListPage>,
    InfiniteDesignsQueryKey,
    string | null
  >({
    queryKey: ['designs', 'infinite', tab, mergedFilters],
    queryFn: ({ pageParam }) => fetchDesignPage(tab, mergedFilters, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    ...query,
    designs: query.data?.pages.flatMap((page) => page.designs) ?? [],
    query,
  };
}
