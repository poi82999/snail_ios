import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { HomeTab } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

const TABS: HomeTab[] = ['추천', '랭킹', '이달의 아트'];

interface HomeTabSelectorProps {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

// Figma: Tab_Ver1 (344:833) — active/inactive 둘 다 SemiBold, 색상만 다름. 밑줄은 active에만.
export default function HomeTabSelector({ activeTab, onTabChange }: HomeTabSelectorProps) {
  return (
    <View style={tw`flex-row items-start justify-center bg-white py-[8px]`}>
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
            style={[tw`flex-1 items-center`, isActive && { gap: 10 }]}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontFamily: fontFamily.semibold,
                color: isActive ? colors.secondary : colors.secondary50,
              }}
            >
              {tab}
            </Text>
            {isActive && <View style={{ height: 1, width: '100%', backgroundColor: colors.secondary }} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
