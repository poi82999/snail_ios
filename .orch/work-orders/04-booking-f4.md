# Work Order 04 (F4): 예약 흐름 데이터 배선 (훅 레벨)

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.

**executor: codex**

## 목표
예약 화면이 바로 쓸 수 있게 데이터/훅만 배선한다: (1) `AvailableSlot[]`을 표시용 슬롯으로 가공(로컬 시간 라벨 + 디자이너 필터), (2) `DesignOption[]`을 kind별로 그룹핑, (3) 예약 생성 호출 배선. **슬롯 그리드 비주얼·화면 레이아웃은 FE 몫 — 여기선 데이터/훅만.**

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/hooks/useBooking.ts`
- `src/api/bookingApi.ts`

<!-- ALLOWED-FILES-START
src/hooks/useBooking.ts
src/api/bookingApi.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/api/bookingApi.ts` — `AvailableSlot`(=`{start_at,end_at,available_designer_ids}`), `buildReservationPayload`, `fetchAvailability`, `createReservation` 기존 구현. **기존 export 시그니처 유지.**
- `src/hooks/useBooking.ts` — `useAvailability`, `useCreateReservation` 기존 훅(유지/확장).
- `src/types/index.ts` — `DesignOption = { id, kind:'extend'|'removal'|'care', name, priceDelta, durationDelta }`(읽기 전용).

## 작업 단계
1. `src/api/bookingApi.ts`에 순수 헬퍼 추가(기존 코드 유지):
   - `export interface DisplaySlot { startAt: string; endAt: string; label: string; availableDesignerIds: string[]; isAvailable: boolean }`
   - `export function formatSlotLabel(startAt: string): string` — ISO `start_at` → 로컬 `HH:mm`(24시간). RN Hermes 환경 안전하게 `new Date(startAt)`의 `getHours()/getMinutes()` zero-pad로 직접 포맷(Intl 의존 금지).
   - `export function toDisplaySlots(slots: AvailableSlot[]): DisplaySlot[]` — 각 슬롯을 DisplaySlot으로. `isAvailable = available_designer_ids.length > 0`.
   - `export function filterSlotsByDesigner(slots: DisplaySlot[], designerId?: string | null): DisplaySlot[]` — designerId 있으면 `availableDesignerIds.includes(designerId)`인 것만, 없으면 전체.
   - `export interface GroupedOptions { removal: DesignOption[]; extend: DesignOption[]; care: DesignOption[] }`
   - `export function groupOptionsByKind(options: DesignOption[]): GroupedOptions` — kind별 분류(없는 kind는 빈 배열). `DesignOption`은 `../types`에서 import.
2. `src/hooks/useBooking.ts`:
   - `useAvailability` 유지하되, 가공 결과를 주는 `export function useDisplaySlots(designId, date?, optionIds?, designerId?)` 추가 — 내부에서 `useAvailability` 호출 후 `select`/`useMemo`로 `toDisplaySlots` + `filterSlotsByDesigner` 적용해 `DisplaySlot[]`와 로딩/에러 상태를 반환.
   - `useCreateReservation`는 이미 존재 — 유지. 추가로 FE 편의를 위해 `buildReservationPayload`를 재노출(`export { buildReservationPayload } from '../api/bookingApi'`)해 한 곳에서 import 가능하게.

## 절대 하지 말 것
- 의존성 추가 / 범위 밖 파일 변경(특히 `src/screens/*` 금지) / git 커밋 / 기존 export 시그니처 변경 / 화면 UI 작성.

## node_modules / 타입체크
- worktree에 `node_modules`가 없을 수 있다. `tsc` 불가 시 코드 정확성에 집중하고 보고만. 최종 검증은 사령관이 메인에서.

## 완료 조건
- [ ] `toDisplaySlots`/`filterSlotsByDesigner`/`formatSlotLabel`/`groupOptionsByKind` 순수함수로 동작(Intl 비의존).
- [ ] `useDisplaySlots`가 가공된 `DisplaySlot[]` 반환, `useAvailability`/`useCreateReservation` 기존 동작 유지.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
