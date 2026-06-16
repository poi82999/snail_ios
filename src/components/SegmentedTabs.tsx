import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface SegmentedTabsProps<T extends string> {
  tabs: T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

// Figma: Tab_Ver2 (344:804) — 균등 분할 배경 채움형 탭(스네일 상세의 스네일/샵 후기/문의하기 등에서 사용)
export default function SegmentedTabs<T extends string>({ tabs, activeTab, onTabChange }: SegmentedTabsProps<T>) {
  return (
    <View style={tw`flex-row items-center`}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
            style={[
              tw`flex-1 items-center justify-center px-[10px] py-[10px]`,
              { backgroundColor: isActive ? colors.background : 'rgba(221,221,221,0.3)' },
            ]}
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
