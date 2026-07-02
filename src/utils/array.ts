/** 배열을 [a, b] 쌍 단위로 묶는다. 2열 그리드 렌더에 사용. 홀수 끝은 [last, undefined]. */
export function chunkIntoPairs<T>(items: T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1]]);
  }
  return pairs;
}
