import { afterEach, describe, expect, it } from '@jest/globals';
import {
  closeLoginGate,
  getLoginGateState,
  openLoginGate,
  subscribeLoginGate,
} from './loginGate';

describe('loginGate 스토어', () => {
  afterEach(() => closeLoginGate());

  it('open 시 상태가 true가 되고 구독자에게 통지하며, 중복 open은 무시한다', () => {
    let notified = 0;
    const unsubscribe = subscribeLoginGate(() => {
      notified += 1;
    });

    expect(getLoginGateState()).toBe(false);

    openLoginGate();
    expect(getLoginGateState()).toBe(true);
    expect(notified).toBe(1);

    openLoginGate(); // 이미 열린 상태 → 통지 안 함
    expect(notified).toBe(1);

    closeLoginGate();
    expect(getLoginGateState()).toBe(false);
    expect(notified).toBe(2);

    unsubscribe();
  });

  it('구독 해제 후에는 통지받지 않는다', () => {
    let notified = 0;
    const unsubscribe = subscribeLoginGate(() => {
      notified += 1;
    });
    unsubscribe();

    openLoginGate();
    expect(notified).toBe(0);
  });
});
