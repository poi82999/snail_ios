import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useDesignDetail } from '../hooks/useDesignDetail';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingTime'>;

const TEXT       = '#6F6F6F';
const SLOT_W     = 36; // px per 30-min slot
const SLOT_H     = 58;

// TODO: API 연결 시 교체 (GET /shops/:id/designers?date=...)
// TODO: 팀원 상의 - 소요 시간 이상의 연속 가능 슬롯이 없는 디자이너 필터링 여부
const MOCK_DESIGNERS = [
  {
    id: 'd1',
    name: '디자이너 1',
    bio: '젤 네일 전문 · 경력 5년',
    imageUri: 'https://picsum.photos/id/64/200/200',
    workStart: 9,
    workEnd: 21,
    // 슬롯 인덱스: (시간 - workStart) * 2 + (0=:00, 1=:30)
    bookedSlots: [0, 1, 10, 11, 14, 15, 16, 22, 23],
  },
  {
    id: 'd2',
    name: '디자이너 2',
    bio: '아트 네일 전문 · 경력 3년',
    imageUri: 'https://picsum.photos/id/65/200/200',
    workStart: 11,
    workEnd: 21,
    bookedSlots: [0, 1, 8, 9, 10, 16, 17, 18, 19],
  },
];

const MOCK_OPTIONS = {
  removal:   [{ id: 'self', price: 5000, duration: 20 }, { id: 'other', price: 10000, duration: 30 }, { id: 'none', price: 0, duration: 0 }],
  extension: [{ id: 'full', price: 15000, duration: 30 }, { id: 'none', price: 0, duration: 0 }],
};

function slotTime(workStart: number, idx: number) {
  const totalMin = workStart * 60 + idx * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60 === 0 ? '00' : '30';
  return `${h}:${m}`;
}

export default function BookingTimeScreen({ route, navigation }: Props) {
  const { designId, removalOptionId, extensionOptionId } = route.params;
  const { data: design } = useDesignDetail(designId);

  const removalOpt   = MOCK_OPTIONS.removal.find(o => o.id === removalOptionId);
  const extensionOpt = MOCK_OPTIONS.extension.find(o => o.id === extensionOptionId);
  const totalPrice    = (design?.price ?? 0) + (removalOpt?.price ?? 0) + (extensionOpt?.price ?? 0);
  const totalDuration = (design?.duration ?? 0) + (removalOpt?.duration ?? 0) + (extensionOpt?.duration ?? 0);
  const slotsNeeded   = Math.ceil(totalDuration / 30);

  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null);
  const [selectedStart,    setSelectedStart]    = useState<number | null>(null);

  const designer = MOCK_DESIGNERS.find(d => d.id === selectedDesigner) ?? null;
  const totalSlots = designer ? (designer.workEnd - designer.workStart) * 2 : 0;

  function isBooked(idx: number) {
    return designer?.bookedSlots.includes(idx) ?? false;
  }

  function isRangeValid(start: number) {
    if (!designer) return false;
    if (start + slotsNeeded > totalSlots) return false;
    for (let i = start; i < start + slotsNeeded; i++) {
      if (isBooked(i)) return false;
    }
    return true;
  }

  function handleSlotPress(idx: number) {
    setSelectedStart(idx);
  }

  const rangeValid   = selectedStart !== null && isRangeValid(selectedStart);
  const timeLabel    = selectedStart !== null && designer
    ? `${slotTime(designer.workStart, selectedStart)} ~ ${slotTime(designer.workStart, selectedStart + slotsNeeded)}`
    : '--:-- ~ --:--';

  const canBook = rangeValid;

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
          <Image source={{ uri: design?.imageUri ?? '' }} style={{ width: 57, height: 57, borderRadius: 10 }} resizeMode="cover" />
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

        {/* 디자이너 섹션 */}
        <View style={tw`px-[20px] pt-[20px] pb-[10px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>디자이너</Text>
        </View>
        <View style={tw`px-[10px] gap-y-[12px] pb-[20px]`}>
          {MOCK_DESIGNERS.map(d => {
            const sel = selectedDesigner === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => { setSelectedDesigner(d.id); setSelectedStart(null); }}
                activeOpacity={0.8}
                style={[tw`p-[20px] rounded-[10px] flex-row items-center gap-[18px]`, {
                  shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.1, shadowRadius: 3.78, elevation: 3,
                  backgroundColor: colors.background,
                  borderWidth: sel ? 1.5 : 0,
                  borderColor: sel ? colors.secondary : 'transparent',
                }]}
              >
                <Image source={{ uri: d.imageUri }} style={{ width: 57, height: 57, borderRadius: 10 }} resizeMode="cover" />
                <View style={tw`gap-y-[5px]`}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>{d.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: TEXT }}>{d.bio}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 시간 바 - 디자이너 선택 후에만 표시 */}
        {designer && (
          <>
            <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />

            <View style={tw`px-[20px] py-[10px] flex-row items-center justify-between`}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>시간</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: selectedStart !== null ? (rangeValid ? '#82A269' : '#FF6B6B') : TEXT }}>
                {timeLabel}
              </Text>
            </View>

            <View style={tw`py-[16px]`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled style={{ paddingHorizontal: 20 }}>
                <View>
                  {/* 시간 레이블 */}
                  <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                    {Array.from({ length: designer.workEnd - designer.workStart + 1 }, (_, i) => designer.workStart + i).map(h => (
                      <View key={h} style={{ width: SLOT_W * 2, alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 8, fontWeight: '500', color: TEXT }}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 슬롯 바 */}
                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: totalSlots }, (_, idx) => {
                      const booked    = isBooked(idx);
                      const inRange   = selectedStart !== null && idx >= selectedStart && idx < selectedStart + slotsNeeded;

                      let bg = '#FFFFFF';
                      if (booked) bg = '#6F6F6F';
                      if (inRange) bg = rangeValid ? '#82A269' : '#FF6B6B';

                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleSlotPress(idx)}
                          activeOpacity={booked ? 1 : 0.7}
                          style={{ width: SLOT_W, height: SLOT_H, backgroundColor: bg, borderWidth: 0.5, borderColor: '#D9D9D9' }}
                        />
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* 범례 */}
            <View style={tw`flex-row gap-[16px] px-[20px] pb-[20px]`}>
              <View style={tw`flex-row items-center gap-[6px]`}>
                <View style={{ width: 12, height: 12, backgroundColor: '#6F6F6F', borderRadius: 2 }} />
                <Text style={{ fontSize: 10, color: TEXT }}>불가</Text>
              </View>
              <View style={tw`flex-row items-center gap-[6px]`}>
                <View style={{ width: 12, height: 12, backgroundColor: '#82A269', borderRadius: 2 }} />
                <Text style={{ fontSize: 10, color: TEXT }}>선택 가능</Text>
              </View>
              <View style={tw`flex-row items-center gap-[6px]`}>
                <View style={{ width: 12, height: 12, backgroundColor: '#FF6B6B', borderRadius: 2 }} />
                <Text style={{ fontSize: 10, color: TEXT }}>선택 불가</Text>
              </View>
            </View>
          </>
        )}

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
          onPress={() => canBook && navigation.navigate('BookingConfirm')}
          style={[tw`flex-1 h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: canBook ? colors.secondary : '#D9D9D9' }]}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: canBook ? colors.background : TEXT }}>예약하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
