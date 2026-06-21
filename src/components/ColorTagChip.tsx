import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { chipContainerStyle, chipTextColor } from './chipStyle';

interface ColorTagChipProps {
  label: string;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

// Figma: Filter_pop_color (TagNon/TagSel) — 색상 스와치 + 텍스트.
// 스와치 size-[15.44px], 항상 primary10(#DDDDDD) 1px 테두리.
// gap은 상태별로 다름(TagNon: 4px, TagSel: 12px) — Figma 원본 그대로.
export default function ColorTagChip({ label, color, isActive, onPress }: ColorTagChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`h-[32px] px-[16px] rounded-[16px] border flex-row items-center`,
        { gap: isActive ? 12 : 4 },
        chipContainerStyle(isActive),
      ]}
    >
      <View style={{ width: 15.44, height: 15.44, borderRadius: 7.72, backgroundColor: color, borderWidth: 1, borderColor: colors.primary10 }} />
      <Text style={[tw`text-[14px]`, { color: chipTextColor(isActive), fontFamily: fontFamily.semibold }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
