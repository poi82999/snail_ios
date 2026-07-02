import { MutationCache, QueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import type { ApiError } from './errors';
import { promptLoginGate } from '../navigation/navigationRef';

// 4xx(클라이언트 오류)는 재시도해도 결과가 같다 → 즉시 중단(401/403/404 등).
// 5xx·네트워크 등 상태 불명 오류만 제한적으로(최대 2회) 재시도한다.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = (error as ApiError | undefined)?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

// 전역 기본값: 무설정 QueryClient는 모든 쿼리를 3회 재시도하고 staleTime이 0이라
// 화면 포커스/마운트마다 재요청한다. 프로덕션 수준으로 조정한다.
// 어떤 mutation이든 인증 만료/비로그인(UNAUTHORIZED·401)으로 실패하면 전역 로그인
// 유도 화면(LoginPrompt)을 띄운다. 찜/예약/스네일/팔로우의 비로그인 처리를 한 곳에서
// 일관되게 보장한다. (선제 차단은 useRequireAuth, 여기는 빠짐없이 잡는 안전망.)
const mutationCache = new MutationCache({
  onError: (error) => {
    const apiError = error as ApiError | undefined;
    if (apiError?.code === 'UNAUTHORIZED' || apiError?.status === 401) {
      promptLoginGate();
      return;
    }
    // 5xx·네트워크/원인불명만 Sentry로 보고(4xx 비즈니스 오류는 노이즈라 제외).
    // requestId 태그로 백엔드 로그와 상관관계를 잇는다.
    const status = apiError?.status;
    if (status === undefined || status >= 500) {
      Sentry.captureException(error, {
        tags: { api_code: apiError?.code, request_id: apiError?.requestId },
      });
    }
  },
});

export const queryClient = new QueryClient({
  mutationCache,
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
