import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
}

export default function SearchBar({ value, onChangeText, onSearch }: SearchBarProps) {
  return (
    <View style={tw`mx-[16px] h-[38px] bg-[#D9D9D9] rounded-[8px] flex-row items-center px-[12px]`}>
      <TextInput
        style={tw`flex-1 text-[14px] text-[#1A1A1A]`}
        placeholder="검색어를 입력하세요"
        placeholderTextColor="#6F6F6F"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      <TouchableOpacity onPress={onSearch} activeOpacity={0.7}>
        <Ionicons name="search" size={18} color="#6F6F6F" />
      </TouchableOpacity>
    </View>
  );
}
