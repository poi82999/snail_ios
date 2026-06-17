import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Figma: ButtonAble(solid) / ButtonDisable / ButtionAble2(outline)
  variant?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export default function Button({ label, onPress, disabled = false, variant = 'solid', style }: ButtonProps) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        tw`h-[42px] rounded-[5px] items-center justify-center px-[16px]`,
        isOutline
          ? { borderWidth: 1, borderColor: colors.secondary, backgroundColor: 'transparent' }
          : { backgroundColor: disabled ? colors.primary10 : colors.secondary },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: fontFamily.regular,
          color: isOutline ? colors.secondary : colors.background,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
