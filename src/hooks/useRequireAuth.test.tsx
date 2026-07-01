import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockUseAuth = jest.fn<() => { isAuthenticated: boolean }>();
jest.mock('./useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { useRequireAuth } from './useRequireAuth';

describe('useRequireAuth', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReset();
  });

  it('로그인 상태면 action을 실행하고 true를 반환하며 이동하지 않는다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    const { result } = await renderHook(() => useRequireAuth());
    const action = jest.fn();

    const ret = result.current.requireAuth(action, '찜하려면 로그인');

    expect(action).toHaveBeenCalledTimes(1);
    expect(ret).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('비로그인이면 LoginPrompt로 이동하고 false를 반환하며 action은 실행하지 않는다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const { result } = await renderHook(() => useRequireAuth());
    const action = jest.fn();

    const ret = result.current.requireAuth(action, '찜하려면 로그인');

    expect(action).not.toHaveBeenCalled();
    expect(ret).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('LoginPrompt', { message: '찜하려면 로그인' });
  });

  it('메시지가 없으면 params 없이(undefined) 이동한다', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const { result } = await renderHook(() => useRequireAuth());

    result.current.requireAuth();

    expect(mockNavigate).toHaveBeenCalledWith('LoginPrompt', undefined);
  });
});
