import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import { navigationRef, promptLoginGate } from './navigationRef';

// getCurrentRoute의 반환 타입은 RootStackParamList로 좁혀져 있어, 목 반환값은
// 이 헬퍼로 해당 타입에 맞춰 캐스팅한다(테스트에서 name만 의미가 있다).
type CurrentRoute = ReturnType<typeof navigationRef.getCurrentRoute>;
function routeNamed(name: string): CurrentRoute {
  return { key: `${name}-1`, name } as unknown as CurrentRoute;
}

// promptLoginGate는 React 바깥(axios 인터셉터·MutationCache.onError)에서 401을 잡아
// 로그인 유도 화면을 띄우는 전역 안전망이다. navigationRef의 준비/현재 라우트 상태에
// 따른 분기를 검증한다.
describe('promptLoginGate (401 안전망)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('네비게이션 컨테이너가 준비 전이면 아무것도 하지 않는다', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(false);
    const navigate = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});

    promptLoginGate('세션 만료');

    expect(navigate).not.toHaveBeenCalled();
  });

  it('이미 LoginPrompt가 떠 있으면 중복 오픈하지 않는다', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    jest.spyOn(navigationRef, 'getCurrentRoute').mockReturnValue(routeNamed('LoginPrompt'));
    const navigate = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});

    promptLoginGate();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('준비됐고 다른 화면이면 메시지와 함께 LoginPrompt로 이동한다', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    jest.spyOn(navigationRef, 'getCurrentRoute').mockReturnValue(routeNamed('Main'));
    const navigate = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});

    promptLoginGate('세션이 만료되었어요. 다시 로그인해주세요.');

    expect(navigate).toHaveBeenCalledWith('LoginPrompt', {
      message: '세션이 만료되었어요. 다시 로그인해주세요.',
    });
  });

  it('메시지가 없으면 params 없이(undefined) 이동한다', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    jest.spyOn(navigationRef, 'getCurrentRoute').mockReturnValue(undefined);
    const navigate = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});

    promptLoginGate();

    expect(navigate).toHaveBeenCalledWith('LoginPrompt', undefined);
  });
});
