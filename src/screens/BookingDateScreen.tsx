import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useBookingSummary } from '../hooks/useBookingSummary';
import BookingDesignCard from '../components/BookingDesignCard';
import BookingBottomBar from '../components/BookingBottomBar';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDate'>;

const TEXT = '#6F6F6F';
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function BookingDateScreen({ route, navigation }: Props) {
  const { designId, selectedOptionIds } = route.params;
  const { design, totalPrice, totalDuration } = useBookingSummary(designId, selectedOptionIds);

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const totalDays   = new Date(year, month, 0).getDate();
  const startOffset = new Date(year, month - 1, 1).getDay();
  const prevDays    = new Date(year, month - 1, 0).getDate();

  type Cell = { day: number; current: boolean };
  const cells: Cell[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d, current: true });
  const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= rem; d++) cells.push({ day: d, current: false });

  function dateKey(d: number) {
    // 백엔드 availability는 ISO YYYY-MM-DD를 요구하므로 zero-pad한다.
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function isPast(d: number) {
    const cellDate = new Date(year, month - 1, d);
    cellDate.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return cellDate < t;
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const canBook = selectedDate !== null;

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

        {/* 날짜 섹션 */}
        <View style={tw`px-[20px] py-[10px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>날짜</Text>
        </View>

        {/* 캘린더 */}
        <View style={tw`px-[16px] py-[20px] gap-y-[20px]`}>
          {/* 월 네비게이션 */}
          <View style={tw`flex-row items-center justify-center gap-[20px]`}>
            <TouchableOpacity onPress={prevMonth} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={16} color={TEXT} />
            </TouchableOpacity>
            <Text style={{ fontSize: 14, fontWeight: '500', color: TEXT }}>{year}년 {month}월</Text>
            <TouchableOpacity onPress={nextMonth} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={16} color={TEXT} />
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={tw`flex-row`}>
            {WEEK.map(d => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '500', color: TEXT }}>{d}</Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          <View style={tw`flex-row flex-wrap`}>
            {cells.map((cell, i) => {
              const key = dateKey(cell.day);
              const isSelected = cell.current && selectedDate === key;
              const disabled = !cell.current || isPast(cell.day);
              return (
                <TouchableOpacity
                  key={`${i}-${cell.day}-${cell.current}`}
                  onPress={() => !disabled && setSelectedDate(key)}
                  activeOpacity={disabled ? 1 : 0.7}
                  style={[
                    { width: '14.28%', alignItems: 'center', paddingVertical: 12 },
                    isSelected && { backgroundColor: colors.secondary, borderRadius: 22 },
                  ]}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isSelected ? colors.background : disabled ? 'rgba(125,105,93,0.25)' : colors.secondary,
                  }}>
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />
        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <BookingBottomBar
        ctaLabel="다음"
        canProceed={canBook}
        onPress={() => navigation.navigate('BookingTime', {
          designId, selectedOptionIds, selectedDate: selectedDate!,
        })}
      />
    </SafeAreaView>
  );
}
