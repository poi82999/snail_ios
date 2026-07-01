import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import * as Sentry from '@sentry/react-native';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';

// 렌더 트리에서 throw된 에러를 잡아 화이트스크린 대신 폴백 UI를 보여준다(IA_SPEC 에러 규칙).
// CLAUDE.md의 "클래스 컴포넌트 금지"를 지키기 위해 react-error-boundary(함수형 API)를 쓴다.
function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <SafeAreaView style={tw`flex-1 bg-white items-center justify-center px-[32px]`}>
      <Text
        style={[
          typography.headingMd,
          { color: colors.secondary, marginBottom: 8, textAlign: 'center' },
        ]}
      >
        문제가 발생했어요
      </Text>
      <Text
        style={[
          typography.bodySm,
          { color: colors.secondary50, marginBottom: 20, textAlign: 'center' },
        ]}
      >
        잠시 후 다시 시도해주세요.
      </Text>
      <TouchableOpacity
        onPress={resetErrorBoundary}
        style={[tw`px-[24px] py-[12px] rounded-[8px]`, { backgroundColor: colors.secondary }]}
        activeOpacity={0.8}
      >
        <Text style={[typography.bodySm, { color: colors.background }]}>다시 시도</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function handleError(error: unknown, info: React.ErrorInfo): void {
  // 렌더 트리에서 throw된 에러를 Sentry로 보고(컴포넌트 스택 포함).
  Sentry.captureException(error, {
    contexts: { react: { componentStack: info.componentStack ?? undefined } },
  });
}

export default function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
