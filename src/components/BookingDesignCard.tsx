import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { colors, shadows } from '../theme/tokens';

const TEXT = colors.text;

interface BookingDesignCardProps {
  imageUri?: string;
  shopName?: string;
  totalPrice: number;
  totalDuration: number;
}

/** 예약 플로우(옵션/날짜/시간) 상단 디자인 요약 카드. */
export default function BookingDesignCard({
  imageUri,
  shopName,
  totalPrice,
  totalDuration,
}: BookingDesignCardProps) {
  return (
    <View
      style={[
        tw`mx-[10px] p-[20px] rounded-[10px] flex-row items-center gap-[18px]`,
        shadows.card,
      ]}
    >
      <Image source={{ uri: imageUri ?? '' }} style={{ width: 57, height: 57, borderRadius: 10 }} resizeMode="cover" />
      <View style={tw`flex-1 flex-row items-center justify-between`}>
        <View style={tw`gap-y-[5px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>{shopName ?? '...'}</Text>
          <Text style={{ fontSize: 24, fontWeight: '600', color: TEXT }}>{totalPrice.toLocaleString('ko-KR')}원</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="alarm-outline" size={18} color={TEXT} />
          <Text style={{ fontSize: 12, color: TEXT }}>{totalDuration}분</Text>
        </View>
      </View>
    </View>
  );
}
