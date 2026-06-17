import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { fontFamily } from '../theme/fonts';
import { chipContainerStyle, chipTextColor } from './chipStyle';

interface TagChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

// Figma: Filter_pop (TagNon/TagSel) — 텍스트만 있는 칩. chevron이 붙는 FilterChip(Filter_home)과는 다른 컴포넌트.
export default function TagChip({ label, isActive, onPress }: TagChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`h-[32px] px-[16px] rounded-[16px] border items-center justify-center`,
        chipContainerStyle(isActive),
      ]}
    >
      <Text style={[tw`text-[14px]`, { color: chipTextColor(isActive), fontFamily: fontFamily.semibold }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
