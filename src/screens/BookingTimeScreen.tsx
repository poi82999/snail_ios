import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useBookingSummary } from '../hooks/useBookingSummary';
import { useDisplaySlots } from '../hooks/useBooking';
import BookingDesignCard from '../components/BookingDesignCard';
import BookingBottomBar from '../components/BookingBottomBar';
import ReserveTimeBar from '../components/ReserveTimeBar';
import { colors, shadows } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingTime'>;

const TEXT = '#6F6F6F';

export default function BookingTimeScreen({ route, navigation }: Props) {
  const { designId, selectedOptionIds, selectedDate } = route.params;
  const { design, totalPrice, totalDuration } = useBookingSummary(designId, selectedOptionIds);

  const designers = design?.designers ?? [];

  const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(null);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);

  // 디자인+날짜+옵션 기준 그날 전체 슬롯(예약됨/비어있음 모두 포함). 디자이너별 가능 여부는
  // ReserveTimeBar가 슬롯의 availableDesignerIds로 그때그때 판단 — 그래야 선택한 디자이너가
  // 안 되는 시간을 "빈 시간"이 아니라 "예약된 시간"으로 그릴 수 있다.
  const {
    data: slots = [],
    isLoading: slotsLoading,
    isError: slotsError,
  } = useDisplaySlots(designId, selectedDate, selectedOptionIds);

  const selectedSlot = slots.find((s) => s.startAt === selectedStartAt) ?? null;
  const canBook = selectedSlot !== null;

  function selectDesigner(id: string) {
    setSelectedDesignerId((prev) => (prev === id ? null : id));
    setSelectedStartAt(null); // 디자이너 변경 시 시간 선택 초기화
  }

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
        <BookingDesignCard
          imageUri={design?.imageUri}
          shopName={design?.shopName}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
        />

        {/* 디자이너 섹션 (선택) */}
        <View style={tw`px-[20px] pt-[20px] pb-[10px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>디자이너</Text>
        </View>
        {designers.length === 0 ? (
          <View style={tw`px-[20px] pb-[10px]`}>
            <Text style={{ fontSize: 13, color: TEXT }}>지정 가능한 디자이너 정보가 없어요. 시간만 선택해 주세요.</Text>
          </View>
        ) : (
          <View style={tw`px-[10px] gap-y-[12px] pb-[20px]`}>
            {designers.map((d) => {
              const sel = selectedDesignerId === d.id;
              const bio = d.position || d.specialtyTags.join(' · ');
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => selectDesigner(d.id)}
                  activeOpacity={0.8}
                  style={[tw`p-[20px] rounded-[10px] flex-row items-center gap-[18px]`, {
                    ...shadows.card,
                    backgroundColor: colors.background,
                    borderWidth: sel ? 1.5 : 0,
                    borderColor: sel ? colors.secondary : 'transparent',
                  }]}
                >
                  <Image source={{ uri: d.profileImageUri || undefined }} style={{ width: 57, height: 57, borderRadius: 10, backgroundColor: '#EEE' }} resizeMode="cover" />
                  <View style={tw`flex-1 gap-y-[5px]`}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>{d.name}</Text>
                    {bio ? <Text style={{ fontSize: 12, fontWeight: '500', color: TEXT }}>{bio}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />

        {/* 시간 섹션 — 가용 슬롯 칩 */}
        <View style={tw`px-[20px] py-[10px] flex-row items-center justify-between`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>시간</Text>
          <Text style={{ fontSize: 12, color: TEXT }}>{selectedDate}</Text>
        </View>

        <View style={tw`pb-[20px]`}>
          {slotsLoading ? (
            <View style={tw`py-[30px] items-center`}>
              <ActivityIndicator color="#7D695D" />
            </View>
          ) : slotsError ? (
            <View style={tw`py-[30px] items-center`}>
              <Text style={{ fontSize: 13, color: TEXT }}>시간을 불러오지 못했어요.</Text>
            </View>
          ) : slots.length === 0 ? (
            <View style={tw`py-[30px] items-center`}>
              <Text style={{ fontSize: 13, color: TEXT }}>선택한 날짜에 가능한 시간이 없어요.</Text>
            </View>
          ) : (
            <ReserveTimeBar
              slots={slots}
              selectedDesignerId={selectedDesignerId}
              selectedStartAt={selectedStartAt}
              onSelectSlot={(slot) => setSelectedStartAt(slot.startAt)}
            />
          )}
        </View>

        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <BookingBottomBar
        ctaLabel="다음"
        canProceed={canBook}
        onPress={() => navigation.navigate('BookingConfirm', {
          designId,
          startAt: selectedSlot!.startAt,
          designerId: selectedDesignerId,
          selectedOptionIds,
        })}
      />
    </SafeAreaView>
  );
}
