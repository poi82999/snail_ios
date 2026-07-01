import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from './useAuth';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * 비회원 게이팅용 훅.
 * requireAuth(action, message): 로그인 상태면 action 실행, 아니면 로그인 유도 모달을 띄운다.
 * 반환값 boolean: 인증되어 action을 실행했으면 true, 모달을 띄웠으면 false.
 *
 * 선제 호출을 생략해도, 서버 401은 queryClient의 MutationCache.onError가
 * navigationRef를 통해 동일한 LoginPrompt 화면을 띄운다(전역 안전망).
 */
export function useRequireAuth() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();

  const requireAuth = useCallback(
    (action?: () => void, message?: string): boolean => {
      if (isAuthenticated) {
        action?.();
        return true;
      }
      navigation.navigate('LoginPrompt', message ? { message } : undefined);
      return false;
    },
    [isAuthenticated, navigation]
  );

  return { isAuthenticated, requireAuth };
}
