## 필요한 엔드포인트
- `GET /api/v1/designs` — 핵심 요청 필드: `q`, `region`, `colors`, `moods`, `sort`, `limit`, `cursor` / 핵심 응답 필드: `items` (디자인 객체 배열), `next_cursor` (다음 페이지 커서), `recommendations` (출처: frontend_app.ai.txt / 레시피: 디자인 검색해서 예약하기)
- `GET /api/v1/search` — 통합 검색 (출처: frontend_app.ai.txt / 유저 앱 엔드포인트 카탈로그)

## 관련 에러코드
- `INVALID_CURSOR` (400 BAD_REQUEST) — 페이지 커서가 올바르지 않습니다. (출처: frontend_app.ai.txt / 에러 코드 카탈로그)
- `DISTANCE_SORT_NOT_SUPPORTED` (400 BAD_REQUEST) — 거리 정렬은 아직 지원하지 않습니다. (출처: frontend_app.ai.txt / 에러 코드 카탈로그)
- `VALIDATION_ERROR` (400 BAD_REQUEST) — 요청 파라미터 유효성 검증 실패 (출처: frontend_app.ai.txt / 에러 envelope)

## 비즈니스 규칙·플로우 주의점
- **선택적 인증:** API 호출 시 `Authorization: Bearer <optional_access_token>` 헤더는 선택 사항이므로 비로그인 유저도 목록 조회 및 검색이 가능하다. 단, 로그인 시 `favorited_by_me` 등의 개인화된 응답을 받을 수 있다. (출처: frontend_app.ai.txt / 레시피: 디자인 검색해서 예약하기)
- **커서 기반 페이징:** 응답 객체 내 `next_cursor` 값을 활용해 다음 페이지를 요청해야 한다. (출처: frontend_app.ai.txt / 레시피: 디자인 검색해서 예약하기)

## 매핑할 TS 타입 (src/types/api.ts 기준 이름만; 없으면 '확인필요')
- 디자인 목록 응답 타입 (확인필요)
- 단일 디자인 아이템 타입 (확인필요)
- 디자인 검색 쿼리 파라미터 타입 (확인필요)
