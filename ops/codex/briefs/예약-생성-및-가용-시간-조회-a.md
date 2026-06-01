## 필요한 엔드포인트

- **GET /api/v1/designs/{design_id}/availability** (가용 시간 조회)
  - 핵심 요청 필드: `date` (쿼리, 예: 2026-06-01), `option_ids` (쿼리, 선택한 옵션 ID)
  - 핵심 응답 필드: `start_at`, `end_at`, `available_designer_ids` 배열
  - (출처: frontend_app.ai.txt / 3. 예약 가능 시간 조회)

- **POST /api/v1/reservations** (예약 생성)
  - 핵심 요청 헤더: `Authorization: Bearer <access_token>`, `Idempotency-Key: <unique-key>`
  - 핵심 요청 필드: `design_id`, `start_at`, `designer_id`, `selected_option_ids`, `user_request`
  - 핵심 응답 필드: `id`, `status` (pending 등), `total_price`, `payment_method_snapshot`, `deposit_amount_snapshot`, `bank_snapshot` (은행명, 계좌번호, 예금주 등)
  - (출처: frontend_app.ai.txt / 4. 예약 생성, api_cookbook.ai.txt / Recipe A)

## 관련 에러코드

- **DUPLICATE_RESERVATION_SAME_DAY**: 같은 샵에는 같은 날 한 번만 예약할 수 있습니다. (409)
- **NO_AVAILABLE_DESIGNER**: 예약 가능한 디자이너가 없습니다. (409)
- **RESERVATION_LIMIT_EXCEEDED**: 동시에 보유할 수 있는 활성 예약 수를 초과했습니다. (409)
- **SLOT_IN_PAST**: 이미 지난 시간은 예약할 수 없습니다. (422)
- **SLOT_TAKEN**: 이미 예약된 시간입니다. (409)
- **IDEMPOTENCY_KEY_REQUIRED** / **IDEMPOTENCY_MISMATCH**: Idempotency-Key 헤더 누락 및 불일치 (400, 409)
- **UNAUTHORIZED** / **INVALID_TOKEN_TYPE**: 인증 토큰 에러 (401)
- (출처: frontend_app.ai.txt / 에러 코드 카탈로그)

## 비즈니스 규칙·플로우 주의점

- **가용 시간에 옵션 소요 시간 반영**: 디자인 상세 조회 후 옵션을 선택했다면, 해당 옵션 ID들을 가용 시간 조회 API의 `option_ids` 쿼리 파라미터로 반드시 함께 넘겨야 한다. 선택한 옵션의 추가 소요 시간이 예약 가능 슬롯에 자동으로 반영된다. (출처: frontend_app.ai.txt / 3. 예약 가능 시간 조회)
- **멱등성 및 인증 헤더 필수**: 예약 생성(`POST`) 시 `Authorization` 헤더는 물론, 중복 결제 및 예약을 방지하기 위한 유니크한 `Idempotency-Key` 헤더를 반드시 포함해야 한다. (출처: frontend_app.ai.txt / 공통 계약, api_cookbook.ai.txt / Recipe A)
- **예약 완료 후 분기 처리**: 예약 성공 후 화면은 생성된 예약 객체의 `status`, `payment_method_snapshot`, `deposit_amount_snapshot`, `bank_snapshot` 값을 확인하여 현장 결제 안내 혹은 계좌이체 안내 화면 등으로 분기해야 한다. (출처: api_cookbook.ai.txt / Recipe A)

## 매핑할 TS 타입 (src/types/api.ts 기준 이름만; 없으면 '확인필요')

- 확인필요 (예: `AvailabilityItem`, `GetAvailabilityRequest`, `CreateReservationRequest`, `ReservationResponse`, `BankSnapshot`, `PaymentMethod` 등 `src/types/api.ts` 내부 선언 확인 요망)
