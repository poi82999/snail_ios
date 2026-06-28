import { useQuery } from '@tanstack/react-query';

import { searchDesigns, searchShops } from '../api/searchApi';
import type { SearchFilters } from '../types';

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

export function useSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['search', 'designs', filters],
    queryFn: () => searchDesigns(filters),
    enabled: hasActiveSearchFilters(filters),
  });
}

export function useSearchShops(filters: SearchFilters) {
  return useQuery({
    queryKey: ['search', 'shops', filters],
    queryFn: () => searchShops(filters),
    enabled: hasActiveSearchFilters(filters),
  });
}
