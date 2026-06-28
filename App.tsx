import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import type { RootStackParamList } from './src/types';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { navigateToNotificationTarget } from './src/navigation/notificationRouting';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import LoginGateModal from './src/components/LoginGateModal';
import { queryClient } from './src/api/queryClient';
import { useAuthBootstrap } from './src/hooks/useAuth';
import { useRegisterPushToken } from './src/hooks/usePushToken';
import { useNotificationObserver } from './src/hooks/useNotificationObserver';
import { fontAssets } from './src/theme/fonts';
import { initSentry, Sentry } from './src/config/sentry';

// 크래시/에러 리포팅 초기화(앱 진입 시 1회). dev 빌드에선 비활성.
initSentry();

// 폰트 로딩 + 토큰 부트스트랩이 끝날 때까지 네이티브 스플래시를 유지한다(비로그인→로그인 깜빡임 방지).
// 웹 등 호출 불가 환경은 무시한다.
SplashScreen.preventAutoHideAsync().catch(() => {});

// 딥링크/알림 탭으로 진입할 수 있는 화면 매핑(스킴 snail:// + 콜드스타트 URL).
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['snail://'],
  config: {
    screens: {
      ReservationDetail: 'reservation/:reservationId',
      DesignDetail: 'design/:designId',
      ShopDetail: 'shop/:shopId',
      SnapDetail: 'snap/:snapId',
      Notifications: 'notifications',
    },
  },
};

// 앱 시작 시 secure-store의 토큰을 메모리로 로드(부트스트랩)한다.
function AppContent({ fontsReady }: { fontsReady: boolean }) {
  const { isBootstrapping } = useAuthBootstrap();
  // 로그인 세션이 활성화되면 디바이스 푸시 토큰을 자동 등록한다.
  useRegisterPushToken();
  // 포그라운드 알림 표시 + 수신/탭 리스너 등록. 탭 시 알림 data로 해당 화면으로 이동.
  useNotificationObserver({
    onRespond: (response) => {
      navigateToNotificationTarget(response.notification.request.content.data);
    },
  });

  // 폰트와 부트스트랩이 모두 끝나야 첫 화면을 그린다.
  const appReady = fontsReady && !isBootstrapping;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    // 스플래시가 떠 있는 동안 빈 화면을 반환(폴백 폰트 깜빡임/비로그인 플래시 방지).
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <StatusBar style="dark" />
      <RootNavigator />
      {/* 비로그인 시 게이트된 액션에서 뜨는 전역 로그인 유도 모달 */}
      <LoginGateModal />
    </NavigationContainer>
  );
}

function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  // 폰트 로드 실패 시에도 스플래시 무한 대기(영구 빈 화면)를 막기 위해 진행한다.
  const fontsReady = fontsLoaded || fontError != null;

  // 루트 프로바이더 순서: 제스처 핸들러(최상위 필수) → SafeArea(insets) → 에러 경계 → 쿼리.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppContent fontsReady={fontsReady} />
          </QueryClientProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// 네이티브 크래시 + 터치/내비게이션 브레드크럼 수집을 위해 루트를 Sentry로 감싼다.
export default Sentry.wrap(App);
