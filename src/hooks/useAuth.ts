import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  devLogin,
  fetchMe,
  signInWithApple,
  signOut,
  registerUser,
  loginUser,
  updateMe,
  type AppleSignInParams,
  type RegisterParams,
  type LoginParams,
  type UpdateMeParams,
  type UserMe,
} from '../api/authApi';
import { getAccessToken, loadPersistedTokens } from '../api/authToken';
import type { ApiError } from '../api/errors';
import { AUTH_SESSION_QUERY_KEY } from '../auth/sessionQueryKey';

let authBootstrapPromise: Promise<boolean> | null = null;

export interface AuthState {
  user: UserMe | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuthSession() {
  return useQuery<UserMe | null, ApiError>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: async () => {
      if (!getAccessToken()) return null;

      return fetchMe();
    },
  });
}

export function useSignInWithApple() {
  const queryClient = useQueryClient();

  return useMutation<UserMe, ApiError, AppleSignInParams>({
    // ['auth', ...] 키는 queryClient 전역 401 안전망(로그인 유도 모달)에서 제외된다.
    mutationKey: ['auth', 'apple'],
    mutationFn: signInWithApple,
    onSuccess: (user: UserMe) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationKey: ['auth', 'signOut'],
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
    },
  });
}

// 개발용 로그인(로컬/스테이징). nickname 선택. Apple과 동일하게 세션 캐시를 채운다.
export function useDevLogin() {
  const queryClient = useQueryClient();

  return useMutation<UserMe, ApiError, string | null | undefined>({
    mutationKey: ['auth', 'devLogin'],
    mutationFn: (nickname) => devLogin(nickname),
    onSuccess: (user: UserMe) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

export function useAuth(): AuthState {
  const session = useAuthSession();
  const user = session.data ?? null;

  return {
    user,
    isAuthenticated: user !== null,
    isLoading: session.isLoading,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<UserMe, ApiError, RegisterParams>({
    mutationKey: ['auth', 'register'],
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation<UserMe, ApiError, UpdateMeParams>({
    mutationFn: updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

export function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation<UserMe, ApiError, LoginParams>({
    mutationKey: ['auth', 'emailLogin'],
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

// DEV 전용 자동 로그인에 쓸 시드 유저(로컬/스테이징 테스트용).
const DEV_AUTO_LOGIN_NICKNAME = 'seed_user_01';

async function bootstrapTokens(): Promise<boolean> {
  const hasToken = await loadPersistedTokens();
  if (hasToken) return true;

  // 운영 빌드(__DEV__ === false)에선 절대 동작하지 않는다.
  // 개발 중 토큰이 없으면 dev-login으로 자동 인증해 찜/예약 등 인증 화면을 바로 테스트한다.
  if (__DEV__) {
    try {
      await devLogin(DEV_AUTO_LOGIN_NICKNAME);
      return true;
    } catch {
      return false; // dev-login 실패해도 비로그인 상태로 진행
    }
  }

  return false;
}

function loadAuthBootstrapOnce(): Promise<boolean> {
  if (!authBootstrapPromise) {
    authBootstrapPromise = bootstrapTokens().catch((error: unknown) => {
      authBootstrapPromise = null;
      throw error;
    });
  }

  return authBootstrapPromise;
}

export function useAuthBootstrap(): { isBootstrapping: boolean } {
  const queryClient = useQueryClient();
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap(): Promise<void> {
      try {
        await loadAuthBootstrapOnce();
      } catch {
        // 저장소 읽기 실패는 비로그인 상태로 진행하고 세션 쿼리만 다시 맞춘다.
      } finally {
        try {
          await queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
        } finally {
          if (isMounted) {
            setIsBootstrapping(false);
          }
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  return { isBootstrapping };
}
