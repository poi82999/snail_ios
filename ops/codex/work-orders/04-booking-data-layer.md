# Work Order 04: 예약 데이터 레이어 (가용시간 + 예약생성)

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선.

**executor: codex**  <!-- 요청/응답 타입 매핑 + 훅 설계 → codex -->

## 목표
예약 플로우의 **데이터 레이어만** 신규 구축한다(화면 배선은 이번 범위 밖). 가용 시간 조회와 예약 생성을 `apiClient` 기반 함수 + React Query 훅으로 만든다.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/bookingApi.ts` (신규)
- `src/hooks/useBooking.ts` (신규)

<!-- ALLOWED-FILES-START
src/api/bookingApi.ts
src/hooks/useBooking.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `ops/codex/briefs/예약-생성-및-가용-시간-조회-a.md` (브리프 — 원본 대신)
- `src/types/api.ts` — `paths["/api/v1/designs/{design_id}/availability"]["get"]`, `paths["/api/v1/reservations"]["post"]`, `components["schemas"]["ReservationCreate"]` 등 (ground truth)
- `src/api/client.ts` — `apiClient`. **POST에는 이미 Idempotency-Key가 인터셉터로 붙으니 중복 추가하지 마라.**
- `src/hooks/useHome.ts` — useQuery/useMutation 패턴 참고

## 작업 지침 (모호성 제거)
- `src/api/bookingApi.ts`:
  - `fetchAvailability(designId, date, optionIds)` → `apiClient.get('/designs/{id}/availability', { params: { date, option_ids } })`. 응답을 그대로(또는 가벼운 정규화) 반환하되 **반환 타입은 `src/types/api.ts`의 응답 타입에서 파생**시켜라(직접 인터페이스 날조 금지).
  - `createReservation(payload)` → `apiClient.post('/reservations', payload)`. payload/응답 타입은 `ReservationCreate`/예약 응답 스키마에서 파생.
- `src/hooks/useBooking.ts`:
  - `useAvailability(designId, date, optionIds)` = `useQuery` (date 없으면 `enabled:false`).
  - `useCreateReservation()` = `useMutation(createReservation)`.
- 에러는 `src/api/errors.ts`의 `ApiError`로 이미 정규화됨 — 그대로 전파.

## 절대 하지 말 것
- 화면(`src/screens/Booking*.tsx`) 수정 / 네비·테마 변경 / 의존성 추가 / `src/types/*` 수정 / Idempotency-Key 수동 추가 / git 커밋

## 완료 조건
- [ ] `npx tsc --noEmit` 에러 0
- [ ] `fetchAvailability`/`createReservation`가 `apiClient` 사용, 타입은 `src/types/api.ts`에서 파생
- [ ] `useAvailability`/`useCreateReservation` 훅 export
- [ ] 보고: 생성 파일 + 타입 파생 근거 + 남은 우려(화면 배선 후속)
