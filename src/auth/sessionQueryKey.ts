// 인증 세션 쿼리 키 — useAuth(세션 조회)와 client(리프레시 실패 시 세션 무효화)가
// 공유한다. client → useAuth 순환 의존을 피하려고 별도 모듈로 분리한다.
export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;
