import { describe, expect, it } from '@jest/globals';
import { ApiError, toApiError } from './errors';

// axios.isAxiosError는 `isAxiosError === true`인 객체를 인식한다.
function fakeAxiosError(overrides: Record<string, unknown>): unknown {
  return { isAxiosError: true, message: 'Request failed', ...overrides };
}

describe('ApiError', () => {
  it('Error/ApiError 인스턴스이며 필드를 보존한다', () => {
    const e = new ApiError({ code: 'X', message: 'msg', status: 400, requestId: 'r1' });
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(ApiError);
    expect(e.code).toBe('X');
    expect(e.status).toBe(400);
    expect(e.requestId).toBe('r1');
    expect(e.fieldErrors).toBeNull();
  });
});

describe('toApiError', () => {
  it('이미 ApiError면 동일 인스턴스를 그대로 반환', () => {
    const original = new ApiError({ code: 'X', message: 'm' });
    expect(toApiError(original)).toBe(original);
  });

  it('구조화된 axios 에러 본문(code/message/field_errors/request_id)을 파싱', () => {
    const err = fakeAxiosError({
      response: {
        status: 409,
        data: {
          error: { code: 'SLOT_TAKEN', message: '이미 예약됨', field_errors: { date: '필수' } },
          request_id: 'req-1',
        },
      },
    });
    const result = toApiError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('SLOT_TAKEN');
    expect(result.message).toBe('이미 예약됨');
    expect(result.status).toBe(409);
    expect(result.requestId).toBe('req-1');
    expect(result.fieldErrors).toEqual({ date: '필수' });
  });

  it('구조화 본문이 없는 axios 에러는 상태코드 기반 HTTP_ERROR', () => {
    const err = fakeAxiosError({ response: { status: 500, data: 'oops' }, message: 'boom' });
    const result = toApiError(err);
    expect(result.code).toBe('HTTP_ERROR');
    expect(result.status).toBe(500);
    expect(result.message).toBe('boom');
  });

  it('상태코드 없는 네트워크 에러는 error.code로 폴백', () => {
    const err = fakeAxiosError({ code: 'ERR_NETWORK', message: 'Network Error' });
    const result = toApiError(err);
    expect(result.code).toBe('ERR_NETWORK');
    expect(result.status).toBeUndefined();
    expect(result.message).toBe('Network Error');
  });

  it('일반 Error는 UNKNOWN_ERROR + 원본 메시지', () => {
    const result = toApiError(new Error('boom'));
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('boom');
  });

  it('Error도 axios도 아닌 값은 기본 UNKNOWN_ERROR', () => {
    const result = toApiError('weird');
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('알 수 없는 오류가 발생했습니다.');
  });
});
