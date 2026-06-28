import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import tw from 'twrnc';

import { colors } from '../../theme/tokens';

// 데이터 패칭 중 표시하는 공통 로딩 상태(중앙 스피너). 화면 전반의 로딩 표현을 통일한다.
export default function LoadingState() {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <ActivityIndicator color={colors.secondary} />
    </View>
  );
}
