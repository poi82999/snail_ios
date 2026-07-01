import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loadPersistedTokens,
  setTokens,
} from './authToken';

jest.mock('expo-secure-store');

const mockGet = jest.mocked(SecureStore.getItemAsync);
const mockSet = jest.mocked(SecureStore.setItemAsync);
const mockDelete = jest.mocked(SecureStore.deleteItemAsync);

// 비동기 쓰기 큐(microtask 체인)를 비운다.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  jest.resetAllMocks();
  mockSet.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
  mockGet.mockResolvedValue(null);
  // 모듈 레벨 상태를 매 테스트 초기화
  clearTokens();
  await flush();
});

describe('setTokens / clearTokens', () => {
  it('setTokens는 메모리에 즉시 반영하고 SecureStore에 기록한다', async () => {
    setTokens({ access: 'a1', refresh: 'r1' });
    expect(getAccessToken()).toBe('a1');
    expect(getRefreshToken()).toBe('r1');
    await flush();
    expect(mockSet).toHaveBeenCalledWith('snail.access', 'a1');
    expect(mockSet).toHaveBeenCalledWith('snail.refresh', 'r1');
  });

  it('clearTokens는 메모리를 null로 만들고 SecureStore에서 삭제한다', async () => {
    setTokens({ access: 'a1', refresh: 'r1' });
    await flush();
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    await flush();
    expect(mockDelete).toHaveBeenCalledWith('snail.access');
    expect(mockDelete).toHaveBeenCalledWith('snail.refresh');
  });
});

describe('loadPersistedTokens', () => {
  it('저장된 토큰이 있으면 로드하고 true', async () => {
    mockGet.mockResolvedValueOnce('stored-a').mockResolvedValueOnce('stored-r');
    const ok = await loadPersistedTokens();
    expect(ok).toBe(true);
    expect(getAccessToken()).toBe('stored-a');
    expect(getRefreshToken()).toBe('stored-r');
  });

  it('한쪽이라도 없으면 false + 메모리 null', async () => {
    mockGet.mockResolvedValueOnce('stored-a').mockResolvedValueOnce(null);
    const ok = await loadPersistedTokens();
    expect(ok).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it('읽기 실패 시 false + 메모리 null', async () => {
    mockGet.mockRejectedValue(new Error('store fail'));
    const ok = await loadPersistedTokens();
    expect(ok).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it('읽는 도중 setTokens가 끼어들면 stale 값으로 덮지 않고 최신 메모리 상태를 반환한다 (version 가드)', async () => {
    let resolveAccess!: (v: string | null) => void;
    mockGet
      .mockReturnValueOnce(
        new Promise<string | null>((resolve) => {
          resolveAccess = resolve;
        }),
      )
      .mockResolvedValueOnce('stale-r');

    const loadPromise = loadPersistedTokens();
    // load가 secureStoreWrite await를 지나 getItemAsync 호출(loadVersion 캡처) 후 멈추도록
    await flush();
    // 읽기 진행 중 새 토큰 주입 → tokenMutationVersion 증가
    setTokens({ access: 'fresh-a', refresh: 'fresh-r' });
    resolveAccess('stale-a');

    const ok = await loadPromise;
    expect(ok).toBe(true);
    // stale 디스크 값으로 메모리를 덮어쓰지 않는다
    expect(getAccessToken()).toBe('fresh-a');
    expect(getRefreshToken()).toBe('fresh-r');
  });
});
