import apiClient from './client';
import { clearTokens, setTokens } from './authToken';
import { toApiError } from './errors';
import type { components, paths } from '../types/api';

type AppleSignInOperation = paths['/api/v1/auth/apple']['post'];
type FetchMeOperation = paths['/api/v1/me']['get'];
type AppleSignInRequest = components['schemas']['AppleSignInRequest'];
type AppleSignInResponse =
  AppleSignInOperation['responses'][200]['content']['application/json'];
export type TokenPair = components['schemas']['TokenPair'];
export type UserMe = FetchMeOperation['responses'][200]['content']['application/json'];

export interface AppleSignInParams {
  idToken: string;
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  nonce?: string | null;
}

function buildAppleSignInRequest(params: AppleSignInParams): AppleSignInRequest {
  const request: AppleSignInRequest = {
    id_token: params.idToken,
    accepted_terms_version: params.acceptedTermsVersion,
    accepted_privacy_version: params.acceptedPrivacyVersion,
  };

  if (params.nonce !== undefined) {
    request.nonce = params.nonce;
  }

  return request;
}

export async function signInWithApple(
  params: AppleSignInParams
): Promise<UserMe> {
  try {
    const response = await apiClient.post<AppleSignInResponse>(
      '/auth/apple',
      buildAppleSignInRequest(params)
    );
    const tokens: TokenPair = response.data.tokens;

    setTokens({
      access: tokens.access_token,
      refresh: tokens.refresh_token,
    });

    return response.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}

type DevLoginOperation = paths['/api/v1/auth/dev-login']['post'];
type DevLoginRequest = components['schemas']['DevLoginRequest'];
type DevLoginResponse =
  DevLoginOperation['responses'][200]['content']['application/json'];

// 개발용 로그인: Apple id_token 없이 토큰 발급(로컬/스테이징 전용).
// FE가 인증 화면을 토큰 없이도 테스트할 수 있게 한다. 응답은 Apple과 동일한 {tokens,user}.
export async function devLogin(nickname?: string | null): Promise<UserMe> {
  try {
    const body: DevLoginRequest = nickname != null ? { nickname } : {};
    const response = await apiClient.post<DevLoginResponse>(
      '/auth/dev-login',
      body
    );
    const tokens: TokenPair = response.data.tokens;

    setTokens({
      access: tokens.access_token,
      refresh: tokens.refresh_token,
    });

    return response.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchMe(): Promise<UserMe> {
  try {
    const response = await apiClient.get<UserMe>('/me');

    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function signOut(): Promise<void> {
  clearTokens();
}

type UserRegisterRequest = components['schemas']['UserRegisterRequest'];
type UserLoginRequest = components['schemas']['UserLoginRequest'];
type AuthResponse = { tokens: TokenPair; user: UserMe };

export interface RegisterParams {
  email: string;
  password: string;
  nickname: string;
  phoneNumber?: string;
}

export async function registerUser(params: RegisterParams): Promise<UserMe> {
  try {
    const body: UserRegisterRequest = {
      email: params.email,
      password: params.password,
      nickname: params.nickname,
      phone_number: params.phoneNumber ?? null,
      accepted_terms_version: '1.0',
      accepted_privacy_version: '1.0',
    };
    const response = await apiClient.post<AuthResponse>('/auth/register', body);
    setTokens({
      access: response.data.tokens.access_token,
      refresh: response.data.tokens.refresh_token,
    });
    return response.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface LoginParams {
  email: string;
  password: string;
}

type UserUpdateRequest = components['schemas']['UserUpdate'];

export interface UpdateMeParams {
  nickname?: string;
  bio?: string | null;
}

export async function updateMe(params: UpdateMeParams): Promise<UserMe> {
  try {
    const body: UserUpdateRequest = {
      nickname: params.nickname ?? null,
      bio: params.bio ?? null,
    };
    const response = await apiClient.patch<UserMe>('/me', body);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function loginUser(params: LoginParams): Promise<UserMe> {
  try {
    const body: UserLoginRequest = {
      email: params.email,
      password: params.password,
    };
    const response = await apiClient.post<AuthResponse>('/auth/login', body);
    setTokens({
      access: response.data.tokens.access_token,
      refresh: response.data.tokens.refresh_token,
    });
    return response.data.user;
  } catch (error) {
    throw toApiError(error);
  }
}
