import { afterEach, describe, expect, it } from '@jest/globals';
import { BASE_URL_BY_ENV, resolveAppEnv } from './env';

describe('resolveAppEnv', () => {
  const original = process.env.EXPO_PUBLIC_APP_ENV;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_APP_ENV;
    } else {
      process.env.EXPO_PUBLIC_APP_ENV = original;
    }
  });

  it('EXPO_PUBLIC_APP_ENV=staging이면 staging', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'staging';
    expect(resolveAppEnv()).toBe('staging');
  });

  it('EXPO_PUBLIC_APP_ENV=production이면 production', () => {
    process.env.EXPO_PUBLIC_APP_ENV = 'production';
    expect(resolveAppEnv()).toBe('production');
  });

  it('미지정/오타 값은 __DEV__ 폴백 (테스트 환경 = development)', () => {
    delete process.env.EXPO_PUBLIC_APP_ENV;
    expect(resolveAppEnv()).toBe('development');
    process.env.EXPO_PUBLIC_APP_ENV = 'garbage';
    expect(resolveAppEnv()).toBe('development');
  });
});

describe('BASE_URL_BY_ENV', () => {
  it('staging과 production은 서로 다른 URL (staging 누수 방지)', () => {
    expect(BASE_URL_BY_ENV.staging).not.toBe(BASE_URL_BY_ENV.production);
  });

  it('production은 운영 도메인', () => {
    expect(BASE_URL_BY_ENV.production).toBe('https://api.snail.com/v1');
  });
});
