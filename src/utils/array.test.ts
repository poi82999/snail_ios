import { describe, expect, it } from '@jest/globals';
import { chunkIntoPairs } from './array';

describe('chunkIntoPairs', () => {
  it('빈 배열은 빈 결과', () => {
    expect(chunkIntoPairs([])).toEqual([]);
  });

  it('짝수 길이는 완전한 쌍들로 묶는다', () => {
    expect(chunkIntoPairs([1, 2, 3, 4])).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('홀수 길이는 마지막 쌍의 두 번째가 undefined', () => {
    expect(chunkIntoPairs([1, 2, 3])).toEqual([
      [1, 2],
      [3, undefined],
    ]);
  });

  it('단일 요소', () => {
    expect(chunkIntoPairs(['a'])).toEqual([['a', undefined]]);
  });
});
