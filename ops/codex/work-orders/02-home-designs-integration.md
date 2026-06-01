# Work Order 02: 홈 디자인 목록 실제 API 연동

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선.

**executor: codex**  <!-- API 응답→UI 타입 매핑 판단이 있어 codex 유지 -->

## 목표
`useHome`의 mock 디자인 목록을 실제 `GET /api/v1/designs` 호출로 교체한다. 화면(`HomeScreen`)이 깨지지 않도록 **기존 훅·함수 시그니처와 반환 타입(`Design[]`)을 그대로 유지**한다.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/designsApi.ts` (신규)
- `src/hooks/useHome.ts` (수정 — fetchDesigns 본문만 교체, useDesigns/useLikeToggle 시그니처 유지)

<!-- ALLOWED-FILES-START
src/api/designsApi.ts
src/hooks/useHome.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것 (사전소화 브리프 + 결정적 타입)
- `ops/codex/briefs/홈-디자인-목록검색-api-연동.md` — 엔드포인트/규칙 요약 (원본 대신 이걸 본다)
- `src/types/api.ts` — `paths["/api/v1/designs"]["get"]`의 query/response 타입이 **계약의 ground truth**. 응답 스키마와 items 요소 타입을 여기서 확인해 매핑하라.
- `src/types/index.ts` — UI `Design` 타입(목표 반환형)
- `src/api/client.ts` — `apiClient`(Bearer/Idempotency/401 이미 처리됨). 이걸 써라.

## 작업 단계
1. `src/api/designsApi.ts`: `apiClient.get('/designs', { params })`로 호출하고, 응답 `items`를 UI `Design[]`로 매핑하는 `fetchDesignList(tab, filters)`를 만든다. 매핑은 `src/types/api.ts`의 실제 필드명을 근거로 한다(추측 금지, 필드가 불명확하면 주석으로 가정 표기).
2. `src/hooks/useHome.ts`: 기존 mock `fetchDesigns`를 위 함수 호출로 교체. `useDesigns(tab, filters)`/`useLikeToggle()`의 시그니처·queryKey는 유지.

## 매핑/범위 지침 (모호성 제거)
- `tab`(추천/랭킹/이달의 아트) → query의 `sort` 등으로 매핑하되, 정확한 enum이 불명확하면 **가장 합리적인 값 + `// TODO: 백엔드 sort enum 확인` 주석**으로 처리.
- `isLiked` ← 응답의 `favorited_by_me`(있으면), 없으면 `false`.
- 페이지네이션은 **이번 범위 밖**: 첫 페이지만(limit 지정), `next_cursor`는 무시(후속 work-order). 무한스크롤 구현하지 마라.
- mock(`getMockDesigns`) import는 제거. `src/api/mockData.ts`는 수정하지 마라(다른 화면이 씀).

## 절대 하지 말 것
- 의존성 추가 / 화면·컴포넌트·네비·테마 변경 / `src/types/*` 수정 / git 커밋

## 완료 조건
- [ ] `npx tsc --noEmit` 에러 0
- [ ] `fetchDesignList`가 `apiClient`로 `/designs`를 호출하고 `Design[]`을 반환
- [ ] `useDesigns`/`useLikeToggle` 시그니처·queryKey 불변, mock import 제거
- [ ] 의존성 0 변경
- [ ] 보고: 수정 파일 + 매핑 가정 + 남은 우려(페이지네이션 등)
