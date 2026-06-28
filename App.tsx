import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthBootstrap } from './src/hooks/useAuth';
import { useRegisterPushToken } from './src/hooks/usePushToken';
import { useNotificationObserver } from './src/hooks/useNotificationObserver';
import { fontAssets } from './src/theme/fonts';

const queryClient = new QueryClient();

// 앱 시작 시 secure-store의 토큰을 메모리로 로드(부트스트랩)한다.
// 스플래시/로딩 UX는 FE가 isBootstrapping으로 처리할 수 있다(여기선 렌더 게이팅 안 함).
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
