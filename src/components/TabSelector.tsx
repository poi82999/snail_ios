import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface TabSelectorProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export default function TabSelector<T extends string>({ tabs, activeTab, onTabChange }: TabSelectorProps<T>) {
  return (
    <View style={tw`flex-row items-start justify-center bg-white py-[8px]`}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
            style={[tw`flex-1 items-center`, isActive && { gap: 10 }]}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semibold, color: isActive ? colors.secondary : colors.secondary50 }}>
              {tab}
            </Text>
            {isActive && <View style={{ height: 1, width: '100%', backgroundColor: colors.secondary }} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
