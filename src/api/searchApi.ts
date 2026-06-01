import apiClient from './client';
import { buildDesignQuery, isDesignPublic, mapDesignToUi } from './designsApi';
import type { Design, SearchFilters } from '../types';
import type { paths } from '../types/api';

type SearchQuery = NonNullable<paths['/api/v1/search']['get']['parameters']['query']>;
type SearchResponse =
  paths['/api/v1/search']['get']['responses'][200]['content']['application/json'];
type SearchScope = NonNullable<SearchQuery['scope']>;

export interface DesignSearchPage {
  designs: Design[];
  nextCursor: string | null;
}

export async function searchDesigns(
  filters: SearchFilters,
  cursor?: string | null
): Promise<DesignSearchPage> {
  const scope: SearchScope = 'designs';
  const params = {
    scope,
    ...buildDesignQuery(filters, cursor),
  };

  const response = await apiClient.get<SearchResponse>('/search', { params });

  return {
    designs: response.data.items
      .filter(isDesignPublic)
      .map((design) => mapDesignToUi(design, '추천')),
    nextCursor: response.data.next_cursor ?? null,
  };
}
