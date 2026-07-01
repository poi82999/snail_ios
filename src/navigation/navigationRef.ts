import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from '../types';

// NavigationContainer 바깥(전역 로그인 모달, 알림 탭 딥링크 등)에서
// 네비게이션하기 위한 ref. App의 NavigationContainer에 ref로 연결한다.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
