import apiClient from './client';
import { toApiError } from './errors';

const DEVICE_TOKEN_ENDPOINT = '/me/device-tokens';

export type DevicePlatform = 'ios' | 'android';

export interface DeviceTokenPayload {
  token: string;
  platform: DevicePlatform;
}

// 인증 헤더/베이스 URL/토큰 갱신은 apiClient 인터셉터가 처리한다(authToken 직접 전달 X).
export async function registerDeviceToken(payload: DeviceTokenPayload): Promise<void> {
  try {
    await apiClient.post(DEVICE_TOKEN_ENDPOINT, payload);
  } catch (error) {
    throw toApiError(error);
  }
}
