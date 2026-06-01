# Work Order 06 (F7): 커서 페이지네이션 무한스크롤 래퍼

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.
> ⚠️ 이 WO는 **WO-03(F2/F3) 머지 이후** 디스패치된다. `searchApi.ts`/`designsApi.ts`의 cursor 지원에 의존.

**executor: codex**

## 목표
홈/검색 목록을 `useInfiniteQuery`(TanStack Query v5)로 감싸 FE가 FlatList `onEndReached`만 연결하면 되게 한다. 백엔드 `next_cursor` 규약을 한 곳에서 처리.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/hooks/useInfiniteDesigns.ts` (신규)
- `src/hooks/useInfiniteSearch.ts` (신규)

<!-- ALLOWED-FILES-START
src/hooks/useInfiniteDesigns.ts
src/hooks/useInfiniteSearch.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/api/searchApi.ts` — `searchDesigns(filters, cursor?)` → `{ designs: Design[]; nextCursor: string|null }` (WO-03 산출물).
- `src/api/designsApi.ts` — `buildDesignQuery`, `mapDesignToUi`, `isDesignPublic` (WO-03에서 export됨). `/designs`도 `next_cursor` 포함 `SearchResult` 반환.
- `src/types/index.ts` — `SearchFilters`, `Design`, `HomeTab`.
- `src/hooks/useHome.ts`/`useSearch.ts` — 기존 단발 쿼리 패턴(읽기 전용, 수정 금지).

## 작업 단계
1. `src/hooks/useInfiniteSearch.ts`:
   - `export function useInfiniteSearch(filters: SearchFilters)` — `useInfiniteQuery`:
     - `queryKey: ['search','infinite', filters]`
     - `queryFn: ({pageParam}) => searchDesigns(filters, pageParam)`
     - `initialPageParam: null as string | null`
     - `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined` (undefined면 더 없음)
     - `enabled`: q가 있거나 필터가 하나라도 있을 때.
   - 편의 셀렉터: `data.pages.flatMap(p => p.designs)`를 바로 쓰도록, 평탄화된 `designs`를 함께 반환하는 얇은 래퍼(원본 infinite query 객체도 노출).
2. `src/hooks/useInfiniteDesigns.ts`:
   - 홈 목록용. `/designs`도 `SearchResult`(`next_cursor`)를 주므로, `designsApi`에 cursor 페치가 없다면 **`searchApi.searchDesigns`를 그대로 재사용**(scope=designs로 동일 결과)하거나, `buildDesignQuery`로 `/designs` 직접 호출하는 작은 페치 함수를 이 파일 내부에 둔다(범위 파일만 수정 가능하므로 designsApi 수정 금지 — 내부 헬퍼로 해결).
   - `export function useInfiniteDesigns(tab: HomeTab, filters?: SearchFilters)` — tab→sort 매핑은 `SearchFilters.sort`로 흡수(추천=relevance, 랭킹=popular, 이달의아트=latest). `useInfiniteQuery` 동일 패턴. 평탄화 `designs` 동반 반환.

## 절대 하지 말 것
- 의존성 추가 / 범위 밖 파일 변경(designsApi/searchApi/useHome/useSearch 수정 금지 — 읽기만) / git 커밋.

## node_modules / 타입체크
- worktree에 `node_modules` junction이 있으면 `npx tsc --noEmit`로 자체검증. 불가 시 코드 정확성 집중 후 보고.

## 완료 조건
- [ ] `useInfiniteSearch`/`useInfiniteDesigns`가 `getNextPageParam`으로 `nextCursor` 처리, 평탄화 `designs` 제공.
- [ ] 기존 단발 훅 무변경.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
