import { Platform } from 'react-native';

/**
 * API 베이스 URL 환경 분기.
 *
 * - 개발(Expo Go / dev client): 로컬 백엔드(`localhost:8000`)에 붙는다.
 *   단 Android 에뮬레이터는 호스트의 localhost를 `10.0.2.2`로 봐야 하므로 분기한다.
 *   (iOS 시뮬레이터는 호스트 localhost를 그대로 공유)
 * - 프로덕션 빌드(`__DEV__ === false`): 운영 도메인을 쓴다.
 *
 * 실기기에서 로컬 백엔드에 붙어야 하면 `EXPO_PUBLIC_API_BASE_URL`로 오버라이드한다
 * (예: `EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8000/api/v1`).
 */

const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_BASE_URL = `http://${LOCAL_HOST}:8000/api/v1`;
const PROD_BASE_URL = 'https://api.snail.com/v1';

const OVERRIDE_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL: string =
  OVERRIDE_BASE_URL ?? (__DEV__ ? DEV_BASE_URL : PROD_BASE_URL);
