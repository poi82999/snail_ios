import * as Sentry from '@sentry/react-native';

import { APP_ENV } from './env';

// DSN은 공개 값(클라이언트 번들에 박히는 게 정상). 단일 프로젝트라 상수로 둔다.
const SENTRY_DSN =
  'https://5f72a3ee53f3459bd1eb94ca6038417b@o4511643413839872.ingest.us.sentry.io/4511643424718848';

// 크래시/에러 리포팅 초기화. 앱 진입 시 1회 호출한다.
// dev 빌드에선 비활성(노이즈/쿼터 절약), staging·production만 전송한다.
export function initSentry(): void {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    enabled: APP_ENV !== 'development',
    // PII 최소화(기본 false지만 명시). 민감 헤더는 beforeSend에서 제거.
    sendDefaultPii: false,
    beforeSend(event) {
      const headers = event.request?.headers;
      if (headers) {
        delete headers.Authorization;
        delete headers.authorization;
      }
      return event;
    },
  });
}

export { Sentry };
