import axios from 'axios';

export const API_BASE_URL = 'https://api.snail.com/v1';
export const PUSH_TOKEN_ENDPOINT = `${API_BASE_URL}/users/device-token`;

export async function registerDeviceToken(
  token: string,
  platform: 'ios' | 'android',
  authToken: string,
): Promise<void> {
  await axios.post(
    PUSH_TOKEN_ENDPOINT,
    { token, platform },
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
}
