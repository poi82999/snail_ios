import { describe, expect, it } from '@jest/globals';
import { ERROR_MESSAGES, getErrorMessage } from './errorMessages';
import { ApiError } from './errors';

describe('getErrorMessage', () => {
  it('알려진 코드는 매핑된 한국어 메시지를 반환', () => {
    const err = new ApiError({ code: 'SLOT_TAKEN', message: 'whatever the server said' });
    expect(getErrorMessage(err)).toBe(ERROR_MESSAGES.SLOT_TAKEN);
  });

  it('매핑이 없는 코드는 서버 메시지로 폴백', () => {
    const err = new ApiError({ code: 'SOME_UNMAPPED_CODE', message: '서버가 준 메시지' });
    expect(getErrorMessage(err)).toBe('서버가 준 메시지');
  });

  it('매핑도 없고 서버 메시지도 공백이면 기본 메시지', () => {
    const err = new ApiError({ code: 'SOME_UNMAPPED_CODE', message: '   ' });
    expect(getErrorMessage(err)).toBe('잠시 후 다시 시도해주세요.');
  });

  it('ApiError 형태가 아닌 값은 기본 메시지', () => {
    expect(getErrorMessage(null)).toBe('잠시 후 다시 시도해주세요.');
    expect(getErrorMessage('문자열')).toBe('잠시 후 다시 시도해주세요.');
    // 일반 Error는 code 필드가 없어 ApiError로 취급되지 않는다.
    expect(getErrorMessage(new Error('plain'))).toBe('잠시 후 다시 시도해주세요.');
  });
});
