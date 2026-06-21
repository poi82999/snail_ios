import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface TagProps {
  label: string;
}

// Figma: Tag — 디자인 상세 화면의 읽기 전용 태그. FilterChip/TagChip(필터용 인터랙티브 칩)과는 다른 컴포넌트.
export default function Tag({ label }: TagProps) {
  return (
    <View
      style={[
        tw`rounded-[12px]`,
        { backgroundColor: 'rgba(187,175,168,0.1)', paddingTop: 5.299, paddingBottom: 4.637, paddingHorizontal: 9.936 },
      ]}
    >
      <Text style={{ fontSize: 12, fontFamily: fontFamily.regular, color: colors.secondary50 }}>{label}</Text>
    </View>
  );
}
