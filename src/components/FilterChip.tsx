import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { colors } from '../theme/tokens';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`h-[32px] px-[16px] rounded-[16px] border flex-row items-center justify-center gap-[4px]`,
        {
          borderColor: isActive ? colors.secondary : 'rgba(125, 105, 93, 0.3)',
          backgroundColor: isActive ? colors.secondary : colors.background,
        },
      ]}
    >
      <Text
        style={[
          tw`text-[14px] font-semibold`,
          { color: isActive ? colors.background : colors.secondary },
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={10}
        color={isActive ? colors.background : colors.secondary}
      />
    </TouchableOpacity>
  );
}
