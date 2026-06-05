import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from '../config/env';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './authToken';
import { ApiError, toApiError } from './errors';

// 베이스 URL은 src/config/env.ts에서 플랫폼/환경별로 결정한다(재노출만).
export { API_BASE_URL };

const IDEMPOTENCY_HEADER = 'Idempotency-Key';
const REFRESH_ENDPOINT = '/auth/refresh';
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface BackendTokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  access_expires_at?: string;
  refresh_expires_at?: string;
}

interface WrappedTokenPairResponse {
  tokens: BackendTokenPair;
}

type RefreshTokenResponse = BackendTokenPair | WrappedTokenPairResponse;

let refreshPromise: Promise<BackendTokenPair> | null = null;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

function createUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

function isMutationRequest(config: InternalAxiosRequestConfig): boolean {
  const method = config.method?.toUpperCase();

  return method ? MUTATION_METHODS.has(method) : false;
}

function addAuthorizationHeader(config: InternalAxiosRequestConfig): void {
  const accessToken = getAccessToken();

  if (!accessToken) return;

  config.headers.set('Authorization', `Bearer ${accessToken}`);
}

function addIdempotencyHeader(config: InternalAxiosRequestConfig): void {
  if (!isMutationRequest(config) || config.headers.has(IDEMPOTENCY_HEADER)) return;

  config.headers.set(IDEMPOTENCY_HEADER, createUuidV4());
}

function unwrapTokenPair(response: RefreshTokenResponse): BackendTokenPair {
  return 'tokens' in response ? response.tokens : response;
}

async function requestTokenRefresh(refreshToken: string): Promise<BackendTokenPair> {
  try {
    const response: AxiosResponse<RefreshTokenResponse> =
      await refreshClient.post<RefreshTokenResponse>(
        REFRESH_ENDPOINT,
        { refresh_token: refreshToken },
        { headers: { [IDEMPOTENCY_HEADER]: createUuidV4() } }
      );

    return unwrapTokenPair(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

function refreshTokensSingleFlight(): Promise<BackendTokenPair> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(
      new ApiError({
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
        status: 401,
      })
    );
  }

  if (!refreshPromise) {
    // 동시에 여러 401이 와도 refresh는 한 번만 보내고 같은 결과를 공유한다.
    refreshPromise = requestTokenRefresh(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function isRefreshRequest(config: InternalAxiosRequestConfig): boolean {
  return Boolean(config.url?.includes(REFRESH_ENDPOINT));
}

function shouldAttemptRefresh(
  error: ApiError,
  config?: RetryableRequestConfig
): config is RetryableRequestConfig {
  if (!config) return false;

  return error.status === 401 && !config._retry && !isRefreshRequest(config);
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  addAuthorizationHeader(config);
  addIdempotencyHeader(config);

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const apiError = toApiError(error);
    const originalRequest = axios.isAxiosError(error)
      ? (error.config as RetryableRequestConfig | undefined)
      : undefined;

    if (!shouldAttemptRefresh(apiError, originalRequest)) {
      return Promise.reject(apiError);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshTokensSingleFlight();

      setTokens({
        access: tokens.access_token,
        refresh: tokens.refresh_token,
      });
      originalRequest.headers.set('Authorization', `Bearer ${tokens.access_token}`);

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(toApiError(refreshError));
    }
  }
);

export default apiClient;
