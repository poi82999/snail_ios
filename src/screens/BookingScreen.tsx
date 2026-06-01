import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useDesignDetail } from '../hooks/useDesignDetail';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

// TODO: 백엔드 연결 시 API로 교체 (GET /designs/:id/options)
const MOCK_OPTIONS = {
  removal: [
    { id: 'self',  label: '자샵 제거', price: 5000,  duration: 20 },
    { id: 'other', label: '타샵 제거', price: 10000, duration: 30 },
    { id: 'none',  label: '제거 없음', price: 0,     duration: 0  },
  ],
  extension: [
    { id: 'full', label: '전체 연장', price: 15000, duration: 30 },
    { id: 'none', label: '연장 없음', price: 0,     duration: 0  },
  ],
};

const TEXT = '#6F6F6F';

function RadioOption({
  label, price, selected, onPress,
}: { label: string; price: number; selected: boolean; onPress: () => void }) {
  const priceText = price === 0 ? '+0원' : `+${price.toLocaleString('ko-KR')}원`;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={tw`flex-row items-center px-[20px] py-[12px] gap-[18px]`}
    >
      {/* 라디오 버튼 */}
      <View style={[
        tw`w-[57px] items-center justify-center`,
      ]}>
        <View style={[
          { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: selected ? colors.secondary : TEXT, alignItems: 'center', justifyContent: 'center' },
        ]}>
          {selected && (
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary }} />
          )}
        </View>
      </View>
      <View style={tw`flex-1 flex-row items-center justify-between`}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: TEXT }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: TEXT }}>{priceText}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: design } = useDesignDetail(designId);

  const [selectedRemoval,   setSelectedRemoval]   = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);

  const removalOption   = MOCK_OPTIONS.removal.find(o => o.id === selectedRemoval);
  const extensionOption = MOCK_OPTIONS.extension.find(o => o.id === selectedExtension);

  const extraPrice    = (removalOption?.price ?? 0) + (extensionOption?.price ?? 0);
  const extraDuration = (removalOption?.duration ?? 0) + (extensionOption?.duration ?? 0);
  const totalPrice    = (design?.price ?? 0) + extraPrice;
  const totalDuration = (design?.duration ?? 0) + extraDuration;

  const canBook = selectedRemoval !== null && selectedExtension !== null;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 상단 바 */}
      <View style={tw`h-[54px] justify-center px-[22px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 디자인 카드 */}
        <View style={[tw`mx-[10px] p-[20px] rounded-[10px] flex-row items-center gap-[18px]`, { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 3.78, elevation: 3 }]}>
          <Image
            source={{ uri: design?.imageUri ?? '' }}
            style={{ width: 57, height: 57, borderRadius: 10 }}
            resizeMode="cover"
          />
          <View style={tw`flex-1 flex-row items-center justify-between`}>
            <View style={tw`gap-y-[5px]`}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>{design?.shopName ?? '...'}</Text>
              <Text style={{ fontSize: 24, fontWeight: '600', color: TEXT }}>{totalPrice.toLocaleString('ko-KR')}원</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="alarm-outline" size={18} color={TEXT} />
              <Text style={{ fontSize: 12, color: TEXT }}>{totalDuration}분</Text>
            </View>
          </View>
        </View>

        {/* 추가 옵션 타이틀 */}
        <View style={tw`px-[20px] py-[10px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>추가 옵션</Text>
        </View>

        {/* 제거 섹션 */}
        <View style={tw`py-[20px]`}>
          <View style={tw`flex-row items-center justify-between px-[20px] mb-[4px]`}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: TEXT }}>제거</Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="alarm-outline" size={16} color={TEXT} />
              <Text style={{ fontSize: 12, color: TEXT }}>
                {removalOption && removalOption.duration > 0 ? `+${removalOption.duration}분` : '+00분'}
              </Text>
            </View>
          </View>
          {MOCK_OPTIONS.removal.map(opt => (
            <RadioOption
              key={opt.id}
              label={opt.label}
              price={opt.price}
              selected={selectedRemoval === opt.id}
              onPress={() => setSelectedRemoval(opt.id)}
            />
          ))}
        </View>

        {/* 구분선 */}
        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />

        {/* 연장 섹션 */}
        <View style={tw`py-[20px]`}>
          <View style={tw`flex-row items-center justify-between px-[20px] mb-[4px]`}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: TEXT }}>연장</Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="alarm-outline" size={16} color={TEXT} />
              <Text style={{ fontSize: 12, color: TEXT }}>
                {extensionOption && extensionOption.duration > 0 ? `+${extensionOption.duration}분` : '+00분'}
              </Text>
            </View>
          </View>
          {MOCK_OPTIONS.extension.map(opt => (
            <RadioOption
              key={opt.id}
              label={opt.label}
              price={opt.price}
              selected={selectedExtension === opt.id}
              onPress={() => setSelectedExtension(opt.id)}
            />
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />
        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <View style={[tw`flex-row items-center px-[20px] h-[70px] gap-[12px]`, { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 3 }]}>
        <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
          <Ionicons name="heart-outline" size={28} color={TEXT} />
          <Text style={{ fontSize: 8, color: TEXT }}>999+</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
          <Ionicons name="share-social-outline" size={28} color={TEXT} />
          <Text style={{ fontSize: 8, color: TEXT }}>999+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={canBook ? 0.8 : 1}
          onPress={() => canBook && navigation.navigate('BookingDate', {
            designId,
            removalOptionId: selectedRemoval!,
            extensionOptionId: selectedExtension!,
          })}
          style={[tw`flex-1 h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: canBook ? colors.secondary : '#D9D9D9' }]}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: canBook ? colors.background : TEXT }}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
