# Work Order 09 (BugFix 배치2): 시나리오 대조 추가 수정 4건

> 사령관(Opus) 직접 수정. IA_SPEC 대조 기반. read-only 교차검수 요청.

## 수정 내용 (4건)

1. **BookingTimeScreen.tsx — CTA 라벨**: 하단 버튼이 "예약하기"였으나 실제로는 BookingConfirm(확인 화면)으로 이동만 함(Bug-1 수정으로 실제 생성은 Confirm의 "예약 요청 보내기"로 이동). → "다음"으로 변경.

2. **BookingConfirmScreen.tsx — 예약 상태 분기 (Bug-3)**: IA_SPEC [BOOKING-01]은 자동수락 샵="예약이 확정되었어요", 수동수락="승인 대기"로 분기해야 함. 기존엔 반환 status와 무관하게 항상 "기다리는 중" 하드코딩. → `useCreateReservation().data?.status === 'confirmed'`이면 확정 UI(체크 아이콘/문구), 아니면 기존 대기 UI.

3. **SearchScreen.tsx — 검색 결과 카드 배선 (Bug-4)**: 검색 결과 `<DesignCard>`에 onPress/onLike 미연결이라 결과 탭→상세 진입 불가, 하트 토글 불가. → 타입드 navigation으로 DesignDetail 이동 + useLikeToggle 연결(홈과 동일 패턴).

4. **ProfileScreen.tsx — 실유저 표시 (Bug-5)**: 닉네임 "사용자"/소개/프사가 전부 하드코딩. → `useAuth().user`의 nickname/bio/profile_image_url 연결. 통계(게시물/팔로워/팔로잉)·게시물 그리드는 전용 엔드포인트가 없어 placeholder 유지.

## 검수 관점
- 치명 버그(널 안전성, 타입, 네비 파라미터), 계약/범위 위반, IA_SPEC 정합성.
- ReservationStatus 허용값: pending, payment_pending, confirmed, rejected, cancelled_by_user, cancelled_by_shop, no_show, completed.
