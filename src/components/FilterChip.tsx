import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { chipContainerStyle, chipTextColor } from './chipStyle';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

// Figma 원본 벡터(점 3개짜리 "<" stroke를 -90도 회전한 chevron-down).
// 시각적 바운딩 박스(7.831634 x 4.043264)에 맞춰 viewBox를 잘라내고
// G에서 회전시켜 레이아웃 박스와 실제 보이는 크기가 정확히 일치하도록 처리.
function FilterChevron({ color }: { color: string }) {
  return (
    <Svg width={7.831634} height={4.043264} viewBox="-1.175479 2.601201 7.831634 4.043264" fill="none">
      <G transform="rotate(-90 2.740338 4.622833)">
        <Path d="M4.76197 0.707016L0.718706 4.62284L4.76197 8.53865" stroke={color} strokeLinecap="square" />
      </G>
    </Svg>
  );
}

export default function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`h-[32px] px-[16px] rounded-[16px] border flex-row items-center justify-center gap-[4px]`,
        chipContainerStyle(isActive),
      ]}
    >
      <Text
        style={[
          tw`text-[14px]`,
          { color: chipTextColor(isActive), fontFamily: fontFamily.semibold },
        ]}
      >
        {label}
      </Text>
      {/* Figma: 선택된(TagSel) 상태에서는 chevron이 사라짐 */}
      {!isActive && <FilterChevron color={colors.secondary} />}
    </TouchableOpacity>
  );
}
