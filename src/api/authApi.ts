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
