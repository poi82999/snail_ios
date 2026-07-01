import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from '../types';

// NavigationContainer 바깥(전역 로그인 안전망, 알림 탭 딥링크 등)에서
// 네비게이션하기 위한 ref. App의 NavigationContainer에 ref로 연결한다.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 비로그인/세션 만료 상태를 React 바깥(axios 인터셉터, MutationCache.onError)에서
// 감지했을 때 로그인 유도 화면을 띄우는 전역 안전망.
// 화면 방식 게이팅(useRequireAuth)과 동일한 LoginPrompt 모달을 연다.
// - 컨테이너가 아직 준비 전이면 무시한다.
// - 이미 LoginPrompt가 떠 있으면 중복 오픈하지 않는다.
export function promptLoginGate(message?: string): void {
  if (!navigationRef.isReady()) return;
  if (navigationRef.getCurrentRoute()?.name === 'LoginPrompt') return;
  navigationRef.navigate('LoginPrompt', message ? { message } : undefined);
}
