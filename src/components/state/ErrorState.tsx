import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

import { colors, typography } from '../../theme/tokens';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

// 데이터 패칭 실패 시 표시하는 공통 에러 상태 + "다시 시도" 버튼.
// 화면마다 제각각이던 재시도 버튼 스타일을 secondary 채움형 하나로 통일한다(IA_SPEC).
export default function ErrorState({ message = '불러오기에 실패했어요', onRetry }: ErrorStateProps) {
  return (
    <View style={tw`flex-1 items-center justify-center px-[40px]`}>
      <Text
        style={[
          typography.bodySm,
          { color: colors.secondary50, marginBottom: 16, textAlign: 'center' },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.7}
          style={[
            tw`px-[24px] h-[40px] rounded-[8px] items-center justify-center`,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text style={[typography.bodySm, { color: colors.background }]}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
