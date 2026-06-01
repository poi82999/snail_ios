# Work Order 07 (BugFix): 예약 완료 순서 — 명시적 "예약 요청 보내기" + 요청사항/체크박스

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만.

**executor: codex**

## 버그 (시나리오 불일치)
현재 `BookingConfirmScreen`이 **mount 즉시 `useCreateReservation`을 자동 호출**해서, 사용자가 확인하기도 전에 예약이 "완료"된다. IA_SPEC `[BOOKING-01]`은 마지막에 **요청사항 입력 + 취소/노쇼 필수 체크박스 + 하단 CTA "예약 요청 보내기"**를 누른 뒤에야 예약이 생성되고, 그 다음 완료 상태를 보여줘야 한다.

## 목표
`BookingConfirmScreen`을 **확인/요청 화면**으로 바꾼다: 예약 요약 + 요청사항 + 필수 체크박스 + "예약 요청 보내기" CTA. CTA를 눌렀을 때만 생성. 생성 성공 시 완료 UI, 실패 시 에러 메시지. **자동 mount 생성 제거.**

## 수정 허용 파일
- `src/screens/BookingConfirmScreen.tsx`

<!-- ALLOWED-FILES-START
src/screens/BookingConfirmScreen.tsx
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/screens/BookingConfirmScreen.tsx` (현재: useEffect로 자동 mount 생성 — 이 패턴 제거)
- `src/hooks/useBooking.ts` — `useCreateReservation`, `buildReservationPayload` (재노출됨), `useDisplaySlots`
- `src/api/bookingApi.ts` — `formatSlotLabel(startAt)`(시간 라벨), `buildReservationPayload`, `groupOptionsByKind`
- `src/hooks/useDesignDetail.ts` — `useDesignDetail(id)` (요약·옵션명·디자이너명 표시용)
- `src/types/index.ts` — `RootStackParamList['BookingConfirm']` = `{ designId, startAt, designerId?, selectedOptionIds }`
- `IA_SPEC.md` [BOOKING-01] 구조/완료 후

## 작업 단계
1. 자동 생성 제거: mount용 `useEffect`/`firedRef` 자동 호출 삭제.
2. 화면 구성(twrnc + theme/tokens `colors`, 기존 스타일 톤 유지):
   - **예약 요약**: `useDesignDetail(designId)`로 디자인명/가격/소요시간, 선택 정보 표시 — 날짜·시간은 `formatSlotLabel(startAt)`로 시간 라벨 + `startAt`의 날짜(YYYY-MM-DD) 표기, 디자이너는 `designerId`로 `design.designers`에서 이름(없으면 "자동 배정"), 옵션은 `selectedOptionIds`를 `design.options`에서 이름 매핑.
   - **요청사항**: `TextInput` multiline, `maxLength={200}`, placeholder "요청사항을 입력해주세요 (선택)". 상태로 보관.
   - **취소/노쇼 안내 + 필수 체크박스**: 안내 문구 + 체크박스. 체크해야 CTA 활성.
   - **하단 CTA "예약 요청 보내기"**: 체크박스 체크 시에만 활성. onPress에서 `buildReservationPayload({ designId, startAt, designerId, selectedOptionIds, userRequest })` → `useCreateReservation().mutate(payload)`.
   - **상태**: 전송 중 로딩, 성공 시 기존 완료 UI("예약을 요청했어요!" + "홈으로 돌아가기" `navigation.popToTop()`), 실패 시 에러 메시지(`getErrorMessage(error)` from `../api/errors`) + "다시 시도".
3. `userRequest`는 빈 문자열이면 payload에서 생략(`buildReservationPayload`가 `undefined` 처리). `ReservationSelection.userRequest`로 전달.

## 절대 하지 말 것
- 다른 화면/네비게이터/타입 수정, 의존성 추가, git 커밋, 자동 mount 생성 복구.

## node_modules / 타입체크
- worktree에 node_modules junction이 있으면 `npx tsc --noEmit`로 자체검증. 불가 시 보고만. 최종 검증은 사령관이 메인에서.

## 완료 조건
- [ ] mount 시 자동 생성 안 함. "예약 요청 보내기"를 눌러야만 생성.
- [ ] 요청사항(≤200) + 필수 체크박스(미체크 시 CTA 비활성) 존재.
- [ ] 성공/실패/로딩 상태 처리, 기존 useCreateReservation/payload 헬퍼 사용.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
