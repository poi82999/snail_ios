import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { colors, shadows } from '../theme/tokens';

const TEXT = colors.text;

interface BookingBottomBarProps {
  ctaLabel: string;
  canProceed: boolean;
  onPress: () => void;
}

/** 예약 플로우(옵션/날짜/시간) 하단 액션 바. 좌측 하트/공유는 장식, 우측이 진행 CTA. */
export default function BookingBottomBar({ ctaLabel, canProceed, onPress }: BookingBottomBarProps) {
  return (
    <View
      style={[
        tw`flex-row items-center px-[20px] h-[70px] gap-[12px]`,
        { backgroundColor: colors.background, ...shadows.bar },
      ]}
    >
      <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
        <Ionicons name="heart-outline" size={28} color={TEXT} />
        <Text style={{ fontSize: 8, color: TEXT }}>999+</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
        <Ionicons name="share-social-outline" size={28} color={TEXT} />
        <Text style={{ fontSize: 8, color: TEXT }}>999+</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={canProceed ? 0.8 : 1}
        disabled={!canProceed}
        onPress={() => canProceed && onPress()}
        style={[tw`flex-1 h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: canProceed ? colors.secondary : colors.disabled }]}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: canProceed ? colors.background : TEXT }}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
