import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import OptionSelect from './OptionSelect';
import { colors, typography } from '../theme/tokens';

interface RadioOptionProps {
  label: string;
  price: number;
  selected: boolean;
  onPress: () => void;
}

// Figma: Option 1/2/3 (344:2465 등) — Check(25px) + 32px gap + Text(라벨/가격)
export default function RadioOption({ label, price, selected, onPress }: RadioOptionProps) {
  const priceText = price === 0 ? '+0원' : `+${price.toLocaleString('ko-KR')}원`;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={tw`flex-row items-center gap-[32px]`}
    >
      <View style={tw`w-[25px] h-[25px] items-center justify-center`}>
        <OptionSelect selected={selected} />
      </View>
      <View style={tw`flex-1 flex-row items-center justify-between`}>
        <Text style={[typography.bodySm, { color: colors.secondary }]}>{label}</Text>
        <Text style={[typography.bodyMd, { color: colors.secondary }]}>{priceText}</Text>
      </View>
    </TouchableOpacity>
  );
}
