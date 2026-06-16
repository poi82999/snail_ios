import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { registerDeviceToken } from '../api/pushTokenApi';

/**
 * 로그인 완료 후 authToken을 전달해 호출하세요.
 * authToken이 null이면 아무 작업도 하지 않습니다.
 *
 * 사용 예:
 *   useRegisterPushToken(userAuthToken);
 */
export function useRegisterPushToken(authToken: string | null) {
  useEffect(() => {
    if (!authToken) return;
    void requestAndRegister(authToken);
  }, [authToken]);
}

async function requestAndRegister(authToken: string): Promise<void> {
  // 실기기에서만 동작 — 시뮬레이터/에뮬레이터는 토큰 발급 불가
  if (!Device.isDevice) return;

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;

  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    granted = requested.granted;
  }

  // 사용자가 거부한 경우 조용히 종료 (재요청하지 않음)
  if (!granted) return;

  const { data: token } = await Notifications.getDevicePushTokenAsync();
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  await registerDeviceToken(token, platform, authToken);
}
