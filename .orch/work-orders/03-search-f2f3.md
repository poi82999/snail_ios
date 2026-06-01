# Work Order 03 (F2+F3): 검색 연동 + 필터 파라미터 매핑

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.

**executor: codex**

## 목표
구조화된 `SearchFilters` 타입을 도입하고, `GET /api/v1/search`(scope=designs) 연동(`searchApi.ts` + `useSearch` 훅)과 홈/검색 공유 쿼리 파라미터 매퍼를 만든다. `designsApi`가 지금 `void filters`로 통째 무시하는 필터를 공유 매퍼로 전환한다. (별도 `/taxonomy` 엔드포인트는 **존재하지 않음** — colors/moods는 한국어 자유 문자열을 그대로 쿼리에 싣는다.)

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/searchApi.ts` (신규)
- `src/api/designsApi.ts`
- `src/hooks/useSearch.ts` (신규)
- `src/types/index.ts`

<!-- ALLOWED-FILES-START
src/api/searchApi.ts
src/api/designsApi.ts
src/hooks/useSearch.ts
src/types/index.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/api/designsApi.ts` — `mapDesignToUi`, `isDesignPublic`, `getDesignImageUri`, `getSortForTab` 기존 구현(재사용/export 대상). `Design` 매핑 규약.
- `src/types/index.ts` — `Design`, `HomeTab`, `FilterId` 기존 정의(유지). `SearchFilters`를 **추가만** 한다(기존 타입 변경/삭제 금지).
- `src/hooks/useHome.ts` — `useDesigns(tab, filters)` 패턴 참고(읽기 전용).

## 백엔드 계약 (발췌 — 스펙 다시 뒤지지 말 것)
`GET /api/v1/search` 와 `GET /api/v1/designs` 는 **동일한 쿼리 파라미터**를 받는다(둘 다 응답 `SearchResult`):
- `q?: string`, `region?: string`, `colors?: string[]`, `moods?: string[]`,
  `price_min?: int`, `price_max?: int`, `duration_max?: int`,
  `sort?: 'relevance'|'popular'|'latest'|'price_asc'|'price_desc'|'rating'|'distance'`,
  `cursor?: string`, `limit?: int(1..50, default 20)`
- `/search`는 추가로 `scope: 'designs'|'shops'|'reviews'`(default designs) — **scope='designs'만 사용**.
- 응답 `SearchResult` = `{ items: (DesignPublic|ShopPublic|ReviewPublic)[], next_cursor?: string|null, recommendations?: DesignPublic[] }`.
  scope=designs면 items는 DesignPublic — 기존 `isDesignPublic` 가드로 필터 후 `mapDesignToUi`.
- 타입 근거: `paths['/api/v1/search']['get']`, `paths['/api/v1/designs']['get']`, `components['schemas']['SearchResult'|'DesignPublic']` (`src/types/api.ts`).

## 작업 단계
1. `src/types/index.ts`에 추가:
   ```ts
   export type DesignSort =
     | 'relevance' | 'popular' | 'latest'
     | 'price_asc' | 'price_desc' | 'rating' | 'distance';
   export interface SearchFilters {
     q?: string;
     region?: string;
     colors?: string[];   // 한국어 자유 문자열 (예: '핑크')
     moods?: string[];    // 예: '러블리'
     priceMin?: number;
     priceMax?: number;
     durationMax?: number; // 분
     sort?: DesignSort;
   }
   ```
   (기존 `FilterId`/`FilterChipItem`은 UI 칩 카테고리로 유지 — 값 선택 UI는 FE 몫. 여기선 값 컨테이너만 제공.)
2. `src/api/designsApi.ts`:
   - `mapDesignToUi`, `isDesignPublic`, `getDesignImageUri`를 **export**(searchApi가 재사용).
   - 신규 `export function buildDesignQuery(filters: SearchFilters, cursor?: string | null): Record<string, unknown>` — `SearchFilters`(+cursor)를 백엔드 스네이크케이스 쿼리(`q/region/colors/moods/price_min/price_max/duration_max/sort/cursor/limit`)로 변환. undefined/빈 배열은 생략. `limit`는 기존 `DESIGN_LIST_LIMIT` 사용.
   - 기존 `fetchDesignList(tab, filters: FilterId[])` **시그니처 유지**하되 본문은 `buildDesignQuery`를 거치도록 정리(현재처럼 sort는 tab에서, FilterId 카테고리는 값이 없으므로 그대로 무시되 — `void filters` 대신 "값 없는 카테고리 칩은 매핑 불가, 값 기반 필터링은 SearchFilters 경로 사용" 주석으로 대체). 동작/반환은 기존과 동일해야 함.
3. 신규 `src/api/searchApi.ts`:
   - `export interface DesignSearchPage { designs: Design[]; nextCursor: string | null }`
   - `export async function searchDesigns(filters: SearchFilters, cursor?: string | null): Promise<DesignSearchPage>` — `apiClient.get('/search', { params: { scope:'designs', ...buildDesignQuery(filters, cursor) } })` → items를 `isDesignPublic` 필터 후 `mapDesignToUi(design, '추천')` 매핑(검색엔 탭 개념 없음 — 임의 탭 라벨 OK), `next_cursor`를 `nextCursor`로.
4. 신규 `src/hooks/useSearch.ts`:
   - `export function useSearch(filters: SearchFilters)` — `useQuery({ queryKey:['search', filters], queryFn:()=>searchDesigns(filters), enabled: <q가 비어있지 않거나 필터가 하나라도 있을 때> })`. 반환은 useQuery 결과 그대로.

## 절대 하지 말 것
- 의존성 추가 / 범위 밖 파일 변경 / git 커밋 / `Design`·`HomeTab`·`FilterId` 기존 정의 변경 / `fetchDesignList`·`useDesigns` 시그니처 변경.

## node_modules / 타입체크
- worktree에 `node_modules`가 없을 수 있다. `tsc` 불가 시 코드 정확성에 집중하고 보고만. 최종 검증은 사령관이 메인에서.

## 완료 조건
- [ ] `SearchFilters` 추가, 기존 타입 무변경.
- [ ] `searchDesigns`가 `/search?scope=designs`로 호출하고 `Design[]`+`nextCursor` 반환.
- [ ] `buildDesignQuery`를 designsApi/searchApi가 공유.
- [ ] `fetchDesignList`/`useDesigns` 외부 동작 동일.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
