import { useCallback, useSyncExternalStore } from 'react';

import {
  closeLoginGate,
  getLoginGateState,
  openLoginGate,
  subscribeLoginGate,
} from '../auth/loginGate';
import { useAuth } from './useAuth';

/**
 * 비회원 게이팅용 훅.
 * requireAuth(action?, message?): 로그인 상태면 action을 실행하고 true를,
 * 비로그인이면 전역 로그인 게이트 모달(LoginGateModal)을 열고 false를 반환한다.
 *
 *   const { requireAuth } = useRequireAuth();
 *   const onLike = () => requireAuth(() => toggleLike(...), '로그인하고 찜해보세요');
 *
 * 선제 호출을 생략해도, 서버 401은 queryClient의 MutationCache.onError가
 * 잡아 동일한 모달을 띄운다(전역 안전망).
 *
 * NOTE: message는 현재 전역 게이트가 공용 문구를 쓰므로 표시에 사용하지 않는다
 *       (호출부 시그니처 호환용). 문구별 커스터마이즈는 후속 과제.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();

  const requireAuth = useCallback(
    (action?: () => void, _message?: string): boolean => {
      if (isAuthenticated) {
        action?.();
        return true;
      }
      openLoginGate();
      return false;
    },
    [isAuthenticated]
  );

  return { isAuthenticated, requireAuth };
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
