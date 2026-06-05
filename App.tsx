import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthBootstrap } from './src/hooks/useAuth';

const queryClient = new QueryClient();

// 앱 시작 시 secure-store의 토큰을 메모리로 로드(부트스트랩)한다.
// 스플래시/로딩 UX는 FE가 isBootstrapping으로 처리할 수 있다(여기선 렌더 게이팅 안 함).
function AppContent() {
  useAuthBootstrap();

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
