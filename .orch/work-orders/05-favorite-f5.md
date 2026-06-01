# Work Order 05 (F5): 찜(favorite) 실연동

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.

**executor: codex**

## 목표
홈 좋아요(`useLikeToggle`)를 실제 favorite API로 연동한다: `POST`/`DELETE /designs/{id}/favorite` + 낙관적 업데이트 + 롤백 + 비로그인(토큰 없음/401) 시 "로그인 필요" 시그널. FE는 하트 버튼 + 로그인 모달 트리거 UI만 붙인다.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/favoriteApi.ts` (신규)
- `src/hooks/useHome.ts`

<!-- ALLOWED-FILES-START
src/api/favoriteApi.ts
src/hooks/useHome.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/hooks/useHome.ts` — 현재 `useLikeToggle`이 목(setTimeout). `useDesigns`가 `['designs', tab, filters]` queryKey로 `Design[]` 캐시. 낙관적 업데이트가 `setQueriesData<Design[]>({queryKey:['designs']})`로 동작 중 — 이 패턴 유지/개선.
- `src/api/client.ts` — `apiClient` 기본 export. 변이(POST/DELETE)에 Idempotency-Key 자동 부착됨.
- `src/api/authToken.ts` — `getAccessToken()`(동기). 토큰 없으면 비로그인.
- `src/api/errors.ts` — `ApiError`, `toApiError`. 비로그인 시그널은 code `'UNAUTHORIZED'` 사용.

## 백엔드 계약 (발췌)
- `POST /api/v1/designs/{design_id}/favorite` — 찜 추가. Idempotency-Key 필수(인터셉터 자동). 인증 필요(없으면 401 UNAUTHORIZED).
- `DELETE /api/v1/designs/{design_id}/favorite` — 찜 해제. 동일.

## 작업 단계
1. 신규 `src/api/favoriteApi.ts`:
   - `export async function addFavorite(designId: string): Promise<void>` — `apiClient.post('/designs/${designId}/favorite')`. 에러 `toApiError`.
   - `export async function removeFavorite(designId: string): Promise<void>` — `apiClient.delete(...)`.
2. `src/hooks/useHome.ts`의 `useLikeToggle` 재구현(목 제거):
   - `mutationFn({designId, isLiked})`:
     - **비로그인 선제 체크**: `getAccessToken()`이 없으면 `throw new ApiError({ code:'UNAUTHORIZED', message:'로그인이 필요합니다.', status:401 })` (네트워크 호출 전).
     - 토큰 있으면 `isLiked ? addFavorite : removeFavorite` 호출.
   - 낙관적 업데이트: `onMutate`에서 이전 캐시 스냅샷 저장 + `['designs']` 캐시에 즉시 반영(isLiked/likeCount). `onError`에서 스냅샷으로 롤백. `onSettled`에서 `queryClient.invalidateQueries({queryKey:['designs']})`.
   - 비로그인 식별: 에러가 `ApiError` & `code==='UNAUTHORIZED'`면 화면이 로그인 모달을 띄울 수 있도록 그대로 throw(에러를 삼키지 말 것). FE는 `mutation.error`의 code로 분기.
   - `useDesigns` 등 다른 export는 손대지 말 것.

## 절대 하지 말 것
- 의존성 추가 / 범위 밖 파일 변경(특히 `src/screens/*`) / git 커밋 / `useDesigns` 변경 / 새 상태관리 라이브러리.

## node_modules / 타입체크
- worktree에 `node_modules`가 없을 수 있다. `tsc` 불가 시 코드 정확성에 집중하고 보고만. 최종 검증은 사령관이 메인에서.

## 완료 조건
- [ ] 토큰 없을 때 네트워크 호출 없이 `UNAUTHORIZED` ApiError throw.
- [ ] 낙관적 업데이트 + 실패 롤백 + 성공/실패 후 `['designs']` 무효화.
- [ ] `useDesigns` 동작 유지.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
