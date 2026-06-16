import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import OptionSelect from './OptionSelect';

const TEXT = '#6F6F6F';

interface RadioOptionProps {
  label: string;
  price: number;
  selected: boolean;
  onPress: () => void;
}

export default function RadioOption({ label, price, selected, onPress }: RadioOptionProps) {
  const priceText = price === 0 ? '+0원' : `+${price.toLocaleString('ko-KR')}원`;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={tw`flex-row items-center px-[20px] py-[12px] gap-[18px]`}
    >
      <View style={tw`w-[57px] items-center justify-center`}>
        <OptionSelect selected={selected} />
      </View>
      <View style={tw`flex-1 flex-row items-center justify-between`}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: TEXT }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: TEXT }}>{priceText}</Text>
      </View>
    </TouchableOpacity>
  );
}
