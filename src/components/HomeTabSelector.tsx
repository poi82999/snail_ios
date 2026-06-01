import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { HomeTab } from '../types';

const TABS: HomeTab[] = ['추천', '랭킹', '이달의 아트'];

interface HomeTabSelectorProps {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

export default function HomeTabSelector({ activeTab, onTabChange }: HomeTabSelectorProps) {
  return (
    <View style={tw`flex-row`}>
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
            style={tw`flex-1 items-center py-[12px]`}
          >
            <Text
              style={tw`text-[14px] ${
                isActive ? 'font-semibold text-[#1A1A1A]' : 'font-normal text-[#6F6F6F]'
              }`}
            >
              {tab}
            </Text>
            {isActive && (
              <View style={tw`absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]`} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
