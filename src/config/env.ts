import { Platform } from 'react-native';

/**
 * API 베이스 URL 환경 분기 (development / staging / production 3단계).
 *
 * 우선순위:
 *  1) EXPO_PUBLIC_API_BASE_URL — 명시적 오버라이드(실기기에서 로컬/임의 백엔드 지정)
 *  2) EXPO_PUBLIC_APP_ENV(development|staging|production) — EAS 빌드 프로파일이 주입
 *  3) __DEV__ 폴백 — env 미지정 시 개발 빌드는 development, 릴리스 빌드는 production
 *
 * staging 빌드가 운영 URL로 새지 않도록 EAS preview 프로파일에서 APP_ENV=staging을 주입한다.
 * 개발(Expo Go/dev client): Android 에뮬레이터는 호스트 localhost를 10.0.2.2로 봐야 한다.
 */

const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_BASE_URL = `http://${LOCAL_HOST}:8000/api/v1`;
const STAGING_BASE_URL = 'https://staging-api.snail.com/v1';
const PROD_BASE_URL = 'https://api.snail.com/v1';

export type AppEnv = 'development' | 'staging' | 'production';

export const BASE_URL_BY_ENV: Record<AppEnv, string> = {
  development: DEV_BASE_URL,
  staging: STAGING_BASE_URL,
  production: PROD_BASE_URL,
};

export function resolveAppEnv(): AppEnv {
  const raw = process.env.EXPO_PUBLIC_APP_ENV;
  if (raw === 'development' || raw === 'staging' || raw === 'production') {
    return raw;
  }
  // env 미지정/오타 시: 개발 빌드는 development, 릴리스 빌드는 production으로 폴백.
  return __DEV__ ? 'development' : 'production';
}

export const APP_ENV: AppEnv = resolveAppEnv();

const OVERRIDE_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL: string = OVERRIDE_BASE_URL ?? BASE_URL_BY_ENV[APP_ENV];
