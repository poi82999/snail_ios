import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { InternalAxiosRequestConfig } from 'axios';

// 인증 토큰 소스를 모킹해 인터셉터 동작만 격리 검증한다.
jest.mock('./authToken');

import apiClient from './client';
import { getAccessToken } from './authToken';

const mockedGetAccess = jest.mocked(getAccessToken);

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// 네트워크 대신 config를 캡처해 돌려주는 어댑터.
const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => ({
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAccess.mockReturnValue(null);
  apiClient.defaults.adapter = adapter as never;
});

function lastConfig(): InternalAxiosRequestConfig {
  return adapter.mock.calls.at(-1)![0];
}

describe('apiClient 요청 인터셉터', () => {
  it('액세스 토큰이 있으면 Authorization 헤더를 주입한다', async () => {
    mockedGetAccess.mockReturnValue('tok-123');
    await apiClient.get('/designs');
    expect(lastConfig().headers.get('Authorization')).toBe('Bearer tok-123');
  });

  it('토큰이 없으면 Authorization을 주입하지 않는다', async () => {
    mockedGetAccess.mockReturnValue(null);
    await apiClient.get('/designs');
    expect(lastConfig().headers.get('Authorization')).toBeFalsy();
  });

  it('POST 같은 뮤테이션에는 Idempotency-Key(UUID v4)를 자동 부여한다', async () => {
    await apiClient.post('/reservations', { foo: 1 });
    expect(String(lastConfig().headers.get('Idempotency-Key'))).toMatch(UUID_V4);
  });

  it('GET에는 Idempotency-Key를 부여하지 않는다', async () => {
    await apiClient.get('/designs');
    expect(lastConfig().headers.get('Idempotency-Key')).toBeFalsy();
  });

  it('이미 Idempotency-Key가 지정돼 있으면 덮어쓰지 않는다', async () => {
    await apiClient.post('/x', {}, { headers: { 'Idempotency-Key': 'preset-key' } });
    expect(lastConfig().headers.get('Idempotency-Key')).toBe('preset-key');
  });
});
