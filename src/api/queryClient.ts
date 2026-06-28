import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from './errors';

// 4xx(클라이언트 오류)는 재시도해도 결과가 같다 → 즉시 중단(401/403/404 등).
// 5xx·네트워크 등 상태 불명 오류만 제한적으로(최대 2회) 재시도한다.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = (error as ApiError | undefined)?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

// 전역 기본값: 무설정 QueryClient는 모든 쿼리를 3회 재시도하고 staleTime이 0이라
// 화면 포커스/마운트마다 재요청한다. 프로덕션 수준으로 조정한다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1분 — 잦은 재요청 방지
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false, // RN에선 의미 없음
    },
    mutations: {
      retry: false, // 멱등키가 있어도 자동 재시도는 위험
    },
  },
});
