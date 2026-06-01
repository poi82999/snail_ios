import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchMe,
  signInWithApple,
  signOut,
  type AppleSignInParams,
  type UserMe,
} from '../api/authApi';
import { getAccessToken, loadPersistedTokens } from '../api/authToken';
import type { ApiError } from '../api/errors';

const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;

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
    mutationFn: signInWithApple,
    onSuccess: (user: UserMe) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
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

function loadAuthBootstrapOnce(): Promise<boolean> {
  if (!authBootstrapPromise) {
    authBootstrapPromise = loadPersistedTokens().catch((error: unknown) => {
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
