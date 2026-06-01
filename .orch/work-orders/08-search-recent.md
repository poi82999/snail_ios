# Work Order 08 (BugFix): 최근 검색어 실제 기록/갱신

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만.

**executor: codex**

## 버그 (시나리오 불일치)
`SearchScreen`의 "최근 검색어"가 하드코딩(`RECENT_SEARCHES`)이라, 사용자가 검색해도 목록이 갱신되지 않는다. 검색 제출 시 실제로 최근 검색어를 기록/표시해야 한다.

## 목표
검색 제출 시 검색어를 "최근 검색어" 목록 맨 앞에 추가(중복 제거, 최대 10개), expo-secure-store에 영속. 비검색 상태 화면의 최근 검색어를 이 목록으로 렌더. 항목 탭 시 그 검색어로 검색. 삭제(개별/전체)도 가능하면 추가.

## 수정 허용 파일
- `src/hooks/useRecentSearches.ts` (신규)
- `src/screens/SearchScreen.tsx`

<!-- ALLOWED-FILES-START
src/hooks/useRecentSearches.ts
src/screens/SearchScreen.tsx
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/screens/SearchScreen.tsx` — `query`/`setQuery`, `TextInput`(`returnKeyType="search"`, 현재 `onSubmitEditing` 없음), `RECENT_SEARCHES` 하드코딩 렌더 부분, `useSearch` 사용.
- `src/api/authToken.ts` — expo-secure-store 사용 예시(`SecureStore.getItemAsync/setItemAsync`).

## 작업 단계
1. 신규 `src/hooks/useRecentSearches.ts`:
   - expo-secure-store 키 `'snail.recentSearches'`에 JSON 문자열 배열 영속.
   - `useRecentSearches()` 반환: `{ recent: string[], add(term: string): void, remove(term: string): void, clear(): void }`.
   - 마운트 시 1회 로드(useEffect). `add`는 trim 후 빈 문자열 무시, 기존 동일 항목 제거 후 맨 앞 삽입, 최대 10개로 자르고 저장. 모든 변경은 state + secure-store 동기.
   - TanStack Query는 쓰지 말 것(로컬 영속 상태). React state + secure-store만.
2. `src/screens/SearchScreen.tsx`:
   - `RECENT_SEARCHES` 하드코딩 제거 → `useRecentSearches()`의 `recent` 사용.
   - `TextInput`에 `onSubmitEditing={() => { const q = query.trim(); if (q) add(q); }}` 추가(returnKeyType search 유지). 최근어/인기어/샵 칩을 탭해 `setQuery`로 검색을 실행할 때도 `add(term)` 호출(탭도 검색 행위).
   - 최근 검색어 섹션: 목록이 비면 섹션 숨기거나 "최근 검색어가 없어요" 표시. 각 칩에 X(삭제) 버튼으로 `remove(term)` 연결(선택). "전체 삭제"가 있으면 `clear()`.
   - **인기 검색어/최근 검색한 샵은 백엔드 엔드포인트가 없으므로 하드코딩 유지**(주석으로 명시). 변경 금지.
   - 검색 결과/로딩/빈/에러 로직(useSearch)은 건드리지 말 것.

## 절대 하지 말 것
- 의존성 추가(expo-secure-store는 이미 설치됨) / 범위 밖 파일 / git 커밋 / 검색 연동(useSearch) 로직 변경 / 인기·샵 목록을 임의 API로 바꾸기.

## node_modules / 타입체크
- worktree에 node_modules junction이 있으면 `npx tsc --noEmit`로 자체검증. 불가 시 보고만.

## 완료 조건
- [ ] 검색 제출/항목 탭 시 최근 검색어가 갱신·영속되고 화면에 반영.
- [ ] 인기 검색어/샵은 그대로(하드코딩 유지).
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
