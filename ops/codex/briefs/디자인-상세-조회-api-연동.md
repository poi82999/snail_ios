## 필요한 엔드포인트
- `GET /api/v1/designs/{design_id}` — 핵심 요청 필드: `design_id` (path param), `Authorization` (header, optional) / 핵심 응답 필드: `id`, `title`, `description`, `base_price`, `duration_minutes`, `thumbnail_url`, `images` 배열(원본/처리된 이미지, 썸네일 여부), `ai_tags`, `color_palette`, `shop` 객체, `designers` 배열, `options` 배열, `average_rating`, `favorite_count`, `favorited_by_me` (출처: frontend_app.ai.txt / 2. 디자인 상세, 유저 앱 엔드포인트 카탈로그)
- `POST /api/v1/designs/{design_id}/favorite` — 핵심 요청 필드: `design_id` (path param), `Idempotency-Key` (header), `Authorization` (header) / 핵심 응답 필드: 상태 코드 (토글 성공 여부) (출처: frontend_app.ai.txt / 보조 시나리오, 유저 앱 엔드포인트 카탈로그)
- `GET /api/v1/designs/{design_id}/reviews` — 핵심 요청 필드: `design_id` (path param) / 핵심 응답 필드: 디자인 리뷰 목록 (출처: frontend_app.ai.txt / 유저 앱 엔드포인트 카탈로그)

## 관련 에러코드
- `DESIGN_NOT_FOUND` | 404 NOT_FOUND | 디자인을 찾을 수 없습니다. (출처: frontend_app.ai.txt / 에러 코드 카탈로그)
- `UNAUTHORIZED` | 401 UNAUTHORIZED | 로그인이 필요합니다. (즐겨찾기 토글 등 인증이 필요한 변이 요청 시) (출처: frontend_app.ai.txt / 에러 코드 카탈로그)
- `IDEMPOTENCY_KEY_REQUIRED` | 400 BAD_REQUEST | Idempotency-Key 헤더가 필요합니다. (즐겨찾기 등 POST 요청 시) (출처: frontend_app.ai.txt / 에러 코드 카탈로그)

## 비즈니스 규칙·플로우 주의점
- 디자인 상세 조회(`GET /api/v1/designs/{design_id}`) 시 `Authorization` 헤더는 선택 사항입니다. 단, `favorited_by_me` 값 등 개인화된 정보를 정확히 받기 위해서는 로그인된 사용자의 경우 Access Token을 전송해야 합니다. (출처: frontend_app.ai.txt / 2. 디자인 상세)
- 즐겨찾기 토글(`POST /api/v1/designs/{design_id}/favorite`)과 같은 변이(Mutation) 요청 시에는 `Authorization` 헤더와 고유한 `Idempotency-Key` 헤더를 반드시 함께 포함해야 합니다. (출처: frontend_app.ai.txt / 공통 계약, 보조 시나리오)

## 매핑할 TS 타입 (src/types/api.ts 기준 이름만; 없으면 '확인필요')
- `DesignResponse` 또는 `DesignDetailDto` (확인필요) (출처: frontend_app.ai.txt / 2. 디자인 상세 응답 참조)
- `DesignImage` (확인필요) (출처: frontend_app.ai.txt / 2. 디자인 상세 응답 참조)
- `DesignOption` (확인필요) (출처: frontend_app.ai.txt / 2. 디자인 상세 응답 참조)
- `ShopBrief` (확인필요) (출처: frontend_app.ai.txt / 2. 디자인 상세 응답 참조)
- `DesignerBrief` (확인필요) (출처: frontend_app.ai.txt / 2. 디자인 상세 응답 참조)
