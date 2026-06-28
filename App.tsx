import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { queryClient } from './src/api/queryClient';
import { useAuthBootstrap } from './src/hooks/useAuth';
import { useRegisterPushToken } from './src/hooks/usePushToken';
import { useNotificationObserver } from './src/hooks/useNotificationObserver';
import { fontAssets } from './src/theme/fonts';

// 폰트 로딩 + 토큰 부트스트랩이 끝날 때까지 네이티브 스플래시를 유지한다(비로그인→로그인 깜빡임 방지).
// 웹 등 호출 불가 환경은 무시한다.
SplashScreen.preventAutoHideAsync().catch(() => {});

// 앱 시작 시 secure-store의 토큰을 메모리로 로드(부트스트랩)한다.
function AppContent({ fontsReady }: { fontsReady: boolean }) {
  const { isBootstrapping } = useAuthBootstrap();
  // 로그인 세션이 활성화되면 디바이스 푸시 토큰을 자동 등록한다.
  useRegisterPushToken();
  // 포그라운드 알림 표시 + 수신/탭 리스너 등록.
  useNotificationObserver();

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
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
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
