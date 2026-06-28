import { useCallback, useSyncExternalStore } from 'react';

import {
  closeLoginGate,
  getLoginGateState,
  openLoginGate,
  subscribeLoginGate,
} from '../auth/loginGate';
import { useAuth } from './useAuth';

/**
 * 게이트된 액션(찜/예약/스네일/팔로우) 직전에 호출한다.
 * 비로그인이면 로그인 모달을 열고 false를 반환하므로 호출부는 동작을 중단한다.
 *
 *   const requireAuth = useRequireAuth();
 *   const onLike = () => {
 *     if (!requireAuth()) return;
 *     toggleLike(...);
 *   };
 *
 * 선제 호출을 생략해도, 서버 401은 queryClient의 MutationCache.onError가
 * 잡아 동일한 모달을 띄운다(전역 안전망).
 */
export function useRequireAuth(): () => boolean {
  const { isAuthenticated } = useAuth();

  return useCallback(() => {
    if (isAuthenticated) return true;
    openLoginGate();
    return false;
  }, [isAuthenticated]);
}

/** 로그인 게이트 모달의 표시 상태를 구독한다(LoginGateModal 전용). */
export function useLoginGate(): { visible: boolean; close: () => void } {
  const visible = useSyncExternalStore(
    subscribeLoginGate,
    getLoginGateState,
    getLoginGateState
  );

  return { visible, close: closeLoginGate };
}
