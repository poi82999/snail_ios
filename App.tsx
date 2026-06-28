import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
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

// 앱 시작 시 secure-store의 토큰을 메모리로 로드(부트스트랩)한다.
function AppContent() {
  useAuthBootstrap();
  // 로그인 세션이 활성화되면 디바이스 푸시 토큰을 자동 등록한다.
  useRegisterPushToken();
  // 포그라운드 알림 표시 + 수신/탭 리스너 등록.
  useNotificationObserver();

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return null;
  }

  // 루트 프로바이더 순서: 제스처 핸들러(최상위 필수) → SafeArea(insets) → 에러 경계 → 쿼리.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
