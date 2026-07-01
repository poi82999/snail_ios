import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { useMutation } from '@tanstack/react-query';
import * as Device from 'expo-device';

import { registerDeviceToken, type DevicePlatform } from '../api/pushTokenApi';
import type { ApiError } from '../api/errors';
import { useAuth } from './useAuth';

async function acquireDevicePushToken(): Promise<{ token: string; platform: DevicePlatform } | null> {
  // Expo Go(SDK 53+)에서는 원격 푸시가 expo-notifications에서 제거되어, 모듈을 import(require)하는 것만으로
  // Android에서 throw한다(내부 DevicePushTokenAutoRegistration.fx 사이드이펙트가 addPushTokenListener 호출).
  // 따라서 Expo Go에서는 아예 로드하지 않고 조용히 건너뛴다(토큰 발급·등록은 개발/프로덕션 빌드에서만 동작).
  if (isRunningInExpoGo()) return null;

  // 실기기에서만 동작 — 시뮬레이터/에뮬레이터는 토큰 발급 불가
  if (!Device.isDevice) return null;

  // 위 가드를 통과한 환경(개발/프로덕션 빌드)에서만 지연 로드한다. 정적 import는 Expo Go 크래시를 유발한다.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- 지연 로드가 목적(정적 import 금지)
  const Notifications = require('expo-notifications') as typeof import('expo-notifications');

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
  if (!granted) return null;

  const { data: token } = await Notifications.getDevicePushTokenAsync();
  const platform: DevicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';

  return { token, platform };
}

// 권한 요청 → 디바이스 토큰 발급 → 백엔드 등록까지를 하나의 mutation으로 처리한다.
// 인증 토큰은 apiClient 인터셉터가 자동 주입하므로 직접 넘기지 않는다.
async function requestAndRegister(): Promise<void> {
  const acquired = await acquireDevicePushToken();
  if (!acquired) return;

  await registerDeviceToken(acquired);
}

/**
 * 로그인 세션이 활성화되면 자동으로 디바이스 푸시 토큰을 등록한다.
 * App 루트 등 한 곳에서 한 번만 호출하면 된다.
 *
 * 사용 예:
 *   useRegisterPushToken();
 */
export function useRegisterPushToken() {
  const { isAuthenticated } = useAuth();
  const mutation = useMutation<void, ApiError, void>({
    mutationFn: requestAndRegister,
  });

  const { mutate } = mutation;
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // 로그아웃되면 다음 로그인 때 다시 등록을 시도하도록 리셋
      attemptedRef.current = false;
      return;
    }

    if (attemptedRef.current) return;
    attemptedRef.current = true;
    mutate();
  }, [isAuthenticated, mutate]);

  return mutation;
}
