import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { searchDesigns, type DesignSearchPage } from '../api/searchApi';
import type { Design, SearchFilters } from '../types';

type InfiniteSearchQueryKey = readonly ['search', 'infinite', SearchFilters];
type InfiniteSearchQueryResult = UseInfiniteQueryResult<
  InfiniteData<DesignSearchPage>,
  Error
>;

export type UseInfiniteSearchResult = InfiniteSearchQueryResult & {
  designs: Design[];
  query: InfiniteSearchQueryResult;
};

function hasText(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

function hasValues(values: string[] | undefined): boolean {
  return values !== undefined && values.length > 0;
}

function hasActiveSearchFilters(filters: SearchFilters): boolean {
  return (
    hasText(filters.q) ||
    hasText(filters.region) ||
    hasValues(filters.colors) ||
    hasValues(filters.moods) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.durationMax !== undefined
  );
}

export function useInfiniteSearch(filters: SearchFilters): UseInfiniteSearchResult {
  const query = useInfiniteQuery<
    DesignSearchPage,
    Error,
    InfiniteData<DesignSearchPage>,
    InfiniteSearchQueryKey,
    string | null
  >({
    queryKey: ['search', 'infinite', filters],
    queryFn: ({ pageParam }) => searchDesigns(filters, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: hasActiveSearchFilters(filters),
  });

  return {
    ...query,
    designs: query.data?.pages.flatMap((page) => page.designs) ?? [],
    query,
  };
}
