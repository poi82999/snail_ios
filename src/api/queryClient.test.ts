import { describe, expect, it } from '@jest/globals';
import { shouldRetryQuery } from './queryClient';
import { ApiError } from './errors';

describe('shouldRetryQuery', () => {
  it('4xx 오류는 재시도하지 않는다', () => {
    expect(shouldRetryQuery(0, new ApiError({ code: 'X', message: 'm', status: 404 }))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError({ code: 'X', message: 'm', status: 401 }))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError({ code: 'X', message: 'm', status: 422 }))).toBe(false);
  });

  it('5xx 오류는 최대 2회까지 재시도', () => {
    const e = new ApiError({ code: 'X', message: 'm', status: 500 });
    expect(shouldRetryQuery(0, e)).toBe(true);
    expect(shouldRetryQuery(1, e)).toBe(true);
    expect(shouldRetryQuery(2, e)).toBe(false);
  });

  it('상태코드 없는(네트워크) 오류도 최대 2회까지', () => {
    const e = new ApiError({ code: 'NETWORK_ERROR', message: 'm' });
    expect(shouldRetryQuery(0, e)).toBe(true);
    expect(shouldRetryQuery(2, e)).toBe(false);
  });
});
