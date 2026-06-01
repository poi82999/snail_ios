import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

interface Props {
  name: string;
}

export default function PlaceholderScreen({ name }: Props) {
  return (
    <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`}>
      <Text style={tw`text-[18px] text-[#6F6F6F]`}>{name}</Text>
      <Text style={tw`text-[12px] text-[#D9D9D9] mt-[8px]`}>준비 중</Text>
    </SafeAreaView>
  );
}
