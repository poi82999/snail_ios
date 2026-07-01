import type { ApiError } from './errors';

const DEFAULT_ERROR_MESSAGE = '잠시 후 다시 시도해주세요.';

export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  INVALID_TOKEN_TYPE: '다시 로그인해주세요.',
  INVALID_REFRESH_TOKEN: '세션이 만료되었습니다. 다시 로그인해주세요.',
  APPLE_VERIFY_FAILED: 'Apple 로그인에 실패했습니다. 다시 시도해주세요.',
  FORBIDDEN: '권한이 없습니다.',
  USER_DISABLED: '비활성화된 계정입니다.',
  ACCOUNT_LOCKED: '잠시 후 다시 시도해주세요.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  IDEMPOTENCY_KEY_REQUIRED: '요청을 다시 시도해주세요.',
  IDEMPOTENCY_MISMATCH: '이미 처리 중인 요청입니다. 잠시 후 다시 시도해주세요.',
  INVALID_CURSOR: '목록을 새로고침해주세요.',
  DESIGN_NOT_FOUND: '디자인을 찾을 수 없습니다.',
  DESIGN_OPTION_NOT_FOUND: '선택한 옵션을 사용할 수 없습니다.',
  INVALID_DESIGN_OPTION: '선택한 옵션을 사용할 수 없습니다.',
  DESIGNER_NOT_FOUND: '디자이너를 찾을 수 없습니다.',
  DESIGNER_NOT_AVAILABLE: '선택한 시간에 가능한 디자이너가 없습니다.',
  NO_AVAILABLE_DESIGNER: '선택한 시간에 가능한 디자이너가 없습니다.',
  SLOT_TAKEN: '이미 예약된 시간입니다. 다른 시간을 선택해주세요.',
  SLOT_IN_PAST: '지난 시간은 예약할 수 없습니다.',
  DUPLICATE_RESERVATION_SAME_DAY: '같은 매장은 하루 한 번만 예약할 수 있습니다.',
  DAILY_RESERVATION_LIMIT_REACHED: '해당 날짜의 예약 가능 인원이 모두 찼습니다.',
  DAILY_WORK_LIMIT_REACHED: '해당 날짜의 예약 가능 근무시간을 초과했습니다.',
  RESERVATION_NOT_FOUND: '예약을 찾을 수 없습니다.',
  INVALID_TRANSITION: '처리할 수 없는 예약 상태입니다.',
  CANCEL_REASON_REQUIRED: '취소 사유를 입력해주세요.',
  RESERVATION_NOT_COMPLETED: '완료된 예약만 리뷰를 작성할 수 있습니다.',
  REVIEW_ALREADY_EXISTS: '이미 리뷰를 작성했습니다.',
  REVIEW_EDIT_WINDOW_CLOSED: '리뷰는 작성 후 7일 이내에만 수정할 수 있습니다.',
  REVIEW_NOT_FOUND: '리뷰를 찾을 수 없습니다.',
  TOO_MANY_REVIEW_IMAGES: '리뷰 이미지는 최대 5장까지 첨부할 수 있습니다.',
  SHOP_NOT_FOUND: '매장을 찾을 수 없습니다.',
  SNAP_NOT_FOUND: '스네일을 찾을 수 없습니다.',
  COMMENT_NOT_FOUND: '댓글을 찾을 수 없습니다.',
  COMMENT_DEPTH_EXCEEDED: '답글은 한 단계까지만 작성할 수 있습니다.',
  CANNOT_FOLLOW_SELF: '자신은 팔로우할 수 없습니다.',
  DUPLICATE_REPORT: '이미 신고한 대상입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
  EMAIL_TAKEN: '이미 사용 중인 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 일치하지 않아요.',
  INVALID_PASSWORD_POLICY: '비밀번호는 8자 이상, 대문자·소문자·숫자를 모두 포함해야 합니다.',
  UPLOAD_TOO_LARGE: '파일 크기는 최대 10MB까지 가능합니다.',
  UNSUPPORTED_MEDIA_TYPE: '지원하지 않는 파일 형식입니다.',
  NOT_FOUND: '요청한 항목을 찾을 수 없습니다.',
  HTTP_ERROR: '잠시 후 다시 시도해주세요.',
  UNKNOWN_ERROR: '잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

export function getErrorMessage(err: unknown): string {
  if (!isApiError(err)) return DEFAULT_ERROR_MESSAGE;

  const mappedMessage = ERROR_MESSAGES[err.code];
  if (mappedMessage) return mappedMessage;

  const serverMessage = err.message.trim();
  if (serverMessage.length > 0) return serverMessage;

  return DEFAULT_ERROR_MESSAGE;
}
