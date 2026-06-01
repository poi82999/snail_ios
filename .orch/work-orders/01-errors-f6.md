# Work Order 01 (F6): 에러코드 → 한국어 메시지 중앙 맵

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.

**executor: codex**

## 목표
백엔드 `ErrorResponse.error.code`(UPPER_SNAKE) → 사용자 노출용 한국어 메시지 중앙 맵을 만들고, `ApiError`에서 메시지를 뽑는 단일 함수 `getErrorMessage(err)`를 제공한다. 화면은 이 함수 결과를 그대로 표시하면 된다.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/errorMessages.ts` (신규)
- `src/api/errors.ts`

<!-- ALLOWED-FILES-START
src/api/errorMessages.ts
src/api/errors.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/api/errors.ts` — 기존 `ApiError`(필드: `code`, `status`, `message`, `fieldErrors`). 시그니처 유지.

## 작업 단계
1. 신규 `src/api/errorMessages.ts`:
   - `export const ERROR_MESSAGES: Record<string, string>` — 아래 카탈로그를 코드→한국어로 매핑(전부 포함).
   - `export function getErrorMessage(err: unknown): string` — 우선순위:
     (1) `err`가 `ApiError`이고 `ERROR_MESSAGES[err.code]`가 있으면 그것,
     (2) 없으면 서버가 준 `err.message`(비어있지 않으면),
     (3) 그래도 없으면 기본 폴백 `'잠시 후 다시 시도해주세요.'`.
   - `fieldErrors`가 있으면 첫 필드 메시지를 우선 노출하는 보조 함수 `export function getFieldErrorMessage(err): string | null`도 추가(없으면 null).
2. `src/api/errors.ts`: 파일 하단에 `export { getErrorMessage, getFieldErrorMessage, ERROR_MESSAGES } from './errorMessages';` 재노출 한 줄 추가. (기존 코드는 손대지 말 것 — import 순환 주의: errorMessages가 errors의 `ApiError` 타입만 `import type`으로 가져온다.)

## 에러코드 카탈로그 (코드 → 한국어 메시지)
아래 의미를 자연스러운 한국어 사용자 문구로. 핵심만 발췌(전부 매핑):
- UNAUTHORIZED → 로그인이 필요합니다.
- INVALID_TOKEN_TYPE → 다시 로그인해주세요.
- INVALID_REFRESH_TOKEN → 세션이 만료되었습니다. 다시 로그인해주세요.
- APPLE_VERIFY_FAILED → Apple 로그인에 실패했습니다. 다시 시도해주세요.
- FORBIDDEN → 권한이 없습니다.
- USER_DISABLED → 비활성화된 계정입니다.
- ACCOUNT_LOCKED → 잠시 후 다시 시도해주세요.
- VALIDATION_ERROR → 입력값을 확인해주세요.
- IDEMPOTENCY_KEY_REQUIRED → 요청을 다시 시도해주세요.
- IDEMPOTENCY_MISMATCH → 이미 처리 중인 요청입니다. 잠시 후 다시 시도해주세요.
- INVALID_CURSOR → 목록을 새로고침해주세요.
- DESIGN_NOT_FOUND → 디자인을 찾을 수 없습니다.
- DESIGN_OPTION_NOT_FOUND / INVALID_DESIGN_OPTION → 선택한 옵션을 사용할 수 없습니다.
- DESIGNER_NOT_FOUND → 디자이너를 찾을 수 없습니다.
- DESIGNER_NOT_AVAILABLE / NO_AVAILABLE_DESIGNER → 선택한 시간에 가능한 디자이너가 없습니다.
- SLOT_TAKEN → 이미 예약된 시간입니다. 다른 시간을 선택해주세요.
- SLOT_IN_PAST → 지난 시간은 예약할 수 없습니다.
- DUPLICATE_RESERVATION_SAME_DAY → 같은 매장은 하루 한 번만 예약할 수 있습니다.
- RESERVATION_LIMIT_EXCEEDED → 예약 가능 한도를 초과했습니다.
- RESERVATION_NOT_FOUND → 예약을 찾을 수 없습니다.
- INVALID_TRANSITION → 처리할 수 없는 예약 상태입니다.
- CANCEL_REASON_REQUIRED → 취소 사유를 입력해주세요.
- RESERVATION_NOT_COMPLETED → 완료된 예약만 리뷰를 작성할 수 있습니다.
- REVIEW_ALREADY_EXISTS → 이미 리뷰를 작성했습니다.
- REVIEW_EDIT_WINDOW_CLOSED → 리뷰는 작성 후 7일 이내에만 수정할 수 있습니다.
- REVIEW_NOT_FOUND → 리뷰를 찾을 수 없습니다.
- TOO_MANY_REVIEW_IMAGES → 리뷰 이미지는 최대 5장까지 첨부할 수 있습니다.
- SHOP_NOT_FOUND → 매장을 찾을 수 없습니다.
- SNAP_NOT_FOUND → 스네일을 찾을 수 없습니다.
- COMMENT_NOT_FOUND → 댓글을 찾을 수 없습니다.
- COMMENT_DEPTH_EXCEEDED → 답글은 한 단계까지만 작성할 수 있습니다.
- CANNOT_FOLLOW_SELF → 자신은 팔로우할 수 없습니다.
- DUPLICATE_REPORT → 이미 신고한 대상입니다.
- USER_NOT_FOUND → 사용자를 찾을 수 없습니다.
- NICKNAME_TAKEN → 이미 사용 중인 닉네임입니다.
- UPLOAD_TOO_LARGE → 파일 크기는 최대 10MB까지 가능합니다.
- UNSUPPORTED_MEDIA_TYPE → 지원하지 않는 파일 형식입니다.
- NOT_FOUND → 요청한 항목을 찾을 수 없습니다.
- HTTP_ERROR / UNKNOWN_ERROR → 잠시 후 다시 시도해주세요.
- NETWORK_ERROR → 네트워크 연결을 확인해주세요.
(그 외 사장님 전용/업로드/LLM 코드는 일반 폴백으로 충분 — 매핑 강제 아님. 위 목록은 최소 포함.)

## 절대 하지 말 것
- 의존성 추가 / 범위 밖 파일 변경 / git 커밋 / `ApiError` 시그니처 변경.

## node_modules / 타입체크
- 이 worktree엔 `node_modules`가 없을 수 있다. `tsc` 실행이 불가하면 **코드 정확성에 집중하고 그 사실만 보고**하라. 최종 타입검증은 사령관이 메인에서 수행한다.

## 완료 조건
- [ ] `getErrorMessage`가 위 3단계 폴백대로 동작(코드맵→서버메시지→기본).
- [ ] `errors.ts` 재노출로 `import { getErrorMessage } from '../api/errors'` 가능.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
