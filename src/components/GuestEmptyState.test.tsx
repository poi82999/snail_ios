import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import GuestEmptyState from './GuestEmptyState';

describe('GuestEmptyState', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('전달된 안내 메시지를 렌더한다', async () => {
    await render(<GuestEmptyState message="로그인하고 예약을 확인해보세요" />);
    expect(screen.getByText('로그인하고 예약을 확인해보세요')).toBeTruthy();
  });

  it('로그인 버튼을 누르면 Login 화면으로 이동한다', async () => {
    await render(<GuestEmptyState message="로그인이 필요해요" />);
    fireEvent.press(screen.getByText('로그인'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
