import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFavoriteDesigns, fetchFavoriteShops } from '../api/favoriteApi';

export function useFavoriteDesigns() {
  return useInfiniteQuery({
    queryKey: ['favorites', 'designs'],
    queryFn: ({ pageParam }) => fetchFavoriteDesigns(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useFavoriteShops() {
  return useInfiniteQuery({
    queryKey: ['favorites', 'shops'],
    queryFn: ({ pageParam }) => fetchFavoriteShops(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
