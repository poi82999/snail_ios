import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockParams: { message?: string } | undefined;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockParams }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import LoginPromptScreen from './LoginPromptScreen';

describe('LoginPromptScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGoBack.mockReset();
    mockParams = undefined;
  });

  it('route로 전달된 커스텀 메시지를 보여준다', async () => {
    mockParams = { message: '로그인하고 예약을 확인해보세요' };
    await render(<LoginPromptScreen />);
    expect(screen.getByText('로그인하고 예약을 확인해보세요')).toBeTruthy();
  });

  it('메시지가 없으면 기본 문구를 보여준다', async () => {
    await render(<LoginPromptScreen />);
    expect(screen.getByText('로그인하고 더 많은 기능을 이용해보세요')).toBeTruthy();
  });

  it('로그인 버튼 → Login 화면으로 이동', async () => {
    await render(<LoginPromptScreen />);
    fireEvent.press(screen.getByText('로그인'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('회원가입 버튼 → Register 화면으로 이동', async () => {
    await render(<LoginPromptScreen />);
    fireEvent.press(screen.getByText('회원가입'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('닫기 버튼 → 뒤로 가기', async () => {
    await render(<LoginPromptScreen />);
    fireEvent.press(screen.getByText('닫기'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
