import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, DesignOptionKind } from '../types';
import { useDesignDetail } from '../hooks/useDesignDetail';
import { groupOptionsByKind } from '../api/bookingApi';
import { useDisplaySlots } from '../hooks/useBooking';
import RadioOption from '../components/RadioOption';
import CalendarDayCell from '../components/CalendarDayCell';
import DesignerOption from '../components/DesignerOption';
import ReserveTimeBar from '../components/ReserveTimeBar';
import Button from '../components/Button';
import { getMaxDuration } from '../utils/duration';
import { colors, shadows, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 옵션 kind별 섹션 표시 순서/라벨
const KIND_SECTIONS: { kind: DesignOptionKind; label: string }[] = [
  { kind: 'removal', label: '제거' },
  { kind: 'extend', label: '연장' },
  { kind: 'care', label: '케어' },
];

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

// Figma: Reserve (344:2050) — 옵션 + 날짜 + 디자이너를 한 화면에서 선택
export default function BookingScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: design } = useDesignDetail(designId);

  const grouped = groupOptionsByKind(design?.options ?? []);
  const [selectedOptions, setSelectedOptions] = useState<Record<DesignOptionKind, string | null>>({
    removal: null,
    extend: null,
    care: null,
  });

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(null);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);

  const pickedOptions = (Object.keys(selectedOptions) as DesignOptionKind[])
    .map((k) => grouped[k].find((o) => o.id === selectedOptions[k]))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const extraPrice = pickedOptions.reduce((s, o) => s + o.priceDelta, 0);
  const extraDuration = pickedOptions.reduce((s, o) => s + o.durationDelta, 0);
  const totalPrice = (design?.price ?? 0) + extraPrice;
  const totalDuration = (design ? getMaxDuration(design) : 0) + extraDuration;
  const selectedOptionIds = pickedOptions.map((o) => o.id);

  const visibleSections = KIND_SECTIONS.filter((s) => grouped[s.kind].length > 0);

  function toggleOption(kind: DesignOptionKind, id: string) {
    setSelectedOptions((prev) => ({ ...prev, [kind]: prev[kind] === id ? null : id }));
  }

  const totalDays = new Date(year, month, 0).getDate();
  const startOffset = new Date(year, month - 1, 1).getDay();
  const prevDays = new Date(year, month - 1, 0).getDate();

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
    if (month === 1) { setYear((y) => y - 1); setMonth(12); } else setMonth((m) => m - 1);
    setSelectedDate(null);
    setSelectedDesignerId(null);
    setSelectedStartAt(null);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); } else setMonth((m) => m + 1);
    setSelectedDate(null);
    setSelectedDesignerId(null);
    setSelectedStartAt(null);
  }

  const designers = design?.designers ?? [];

  // 시간은 디자이너를 선택해야 보임(Figma: 352:3532) — 슬롯 자체는 날짜+옵션 기준.
  const {
    data: slots = [],
    isLoading: slotsLoading,
    isError: slotsError,
  } = useDisplaySlots(designId, selectedDate, selectedOptionIds);

  // 그날 가능한 슬롯이 하나도 없는 디자이너는 선택란에 노출하지 않는다.
  const availableDesignerIdSet = new Set(slots.flatMap((s) => s.availableDesignerIds));
  const visibleDesigners = !selectedDate || slotsLoading
    ? designers
    : designers.filter((d) => availableDesignerIdSet.has(d.id));
  const noDesignerAvailable =
    selectedDate !== null && !slotsLoading && !slotsError && designers.length > 0 && visibleDesigners.length === 0;

  function selectDate(key: string) {
    setSelectedDate(key);
    setSelectedDesignerId(null); // 날짜 바뀌면 디자이너/시간 선택 초기화
    setSelectedStartAt(null);
  }

  function selectDesigner(id: string) {
    setSelectedDesignerId((prev) => (prev === id ? null : id));
    setSelectedStartAt(null); // 디자이너 변경 시 시간 선택 초기화
  }

  const canProceed = selectedDate !== null && selectedDesignerId !== null && selectedStartAt !== null;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 상단 고정: 뒤로가기 + 디자인 정보 (Figma "Fixed") */}
      <View style={tw`h-[54px] justify-center pl-[29px] pr-[20px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      <View style={tw`h-[113px] px-[28px] py-[20px]`}>
        <View style={tw`flex-1 flex-row items-center`}>
          <Image
            source={{ uri: design?.imageUri }}
            style={{ width: 57, height: 57, borderRadius: 10, backgroundColor: colors.line }}
            resizeMode="cover"
          />
          <View style={tw`flex-1 flex-row items-center justify-between ml-[22px]`}>
            <View style={tw`gap-y-[5.5px]`}>
              <Text style={[typography.bodySm, { color: colors.secondary }]}>{design?.shopName ?? ''}</Text>
              <Text style={[typography.headingLg, { color: colors.secondary }]}>
                {totalPrice.toLocaleString('ko-KR')}원
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="alarm-outline" size={20} color={colors.secondary50} />
              <Text style={[typography.caption, { color: colors.secondary50 }]}>{totalDuration}분</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`gap-y-[20px] py-[20px]`}>
        {/* 추가 옵션 */}
        <View style={tw`gap-y-[20px]`}>
          <View style={tw`px-[20px]`}>
            <Text style={[typography.headingMd, { color: colors.secondary }]}>추가 옵션</Text>
          </View>
          {visibleSections.map((section) => {
            const opts = grouped[section.kind];
            const sel = opts.find((o) => o.id === selectedOptions[section.kind]);
            return (
              <View key={section.kind} style={tw`px-[28px] py-[8px] gap-y-[20px]`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={[typography.filter, { color: colors.secondary }]}>{section.label}</Text>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="alarm-outline" size={20} color={colors.secondary50} />
                    <Text style={[typography.caption, { color: colors.secondary50 }]}>
                      {sel && sel.durationDelta > 0 ? `+${sel.durationDelta}분` : '+0분'}
                    </Text>
                  </View>
                </View>
                <View style={tw`gap-y-[20px]`}>
                  {opts.map((opt) => (
                    <RadioOption
                      key={opt.id}
                      label={opt.name}
                      price={opt.priceDelta}
                      selected={selectedOptions[section.kind] === opt.id}
                      onPress={() => toggleOption(section.kind, opt.id)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <Divider />

        {/* 날짜 */}
        <View style={tw`gap-y-[20px]`}>
          <View style={tw`px-[20px]`}>
            <Text style={[typography.headingMd, { color: colors.secondary }]}>날짜</Text>
          </View>
          <View style={tw`gap-y-[20px]`}>
            <View style={tw`flex-row items-center justify-center gap-[20px]`}>
              <TouchableOpacity onPress={prevMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={16} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={[typography.filter, { color: colors.secondary }]}>{year}년 {month}월</Text>
              <TouchableOpacity onPress={nextMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <View style={tw`gap-y-[21px]`}>
              <View style={tw`flex-row px-[12px]`}>
                {WEEK.map((d) => (
                  <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 14.608, fontWeight: '500', color: colors.secondary }}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={tw`flex-row flex-wrap px-[12px]`}>
                {cells.map((cell, i) => {
                  const key = dateKey(cell.day);
                  const isSelected = cell.current && selectedDate === key;
                  const disabled = !cell.current || isPast(cell.day);
                  return (
                    <CalendarDayCell
                      key={`${i}-${cell.day}-${cell.current}`}
                      day={cell.day}
                      selected={isSelected}
                      disabled={disabled}
                      onPress={() => selectDate(key)}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <Divider />

        {/* 디자이너 — 선택한 날짜에 가능한 슬롯이 없는 디자이너는 노출하지 않음 */}
        <View style={tw`gap-y-[20px]`}>
          <View style={tw`px-[20px]`}>
            <Text style={[typography.headingMd, { color: colors.secondary }]}>디자이너</Text>
          </View>
          {noDesignerAvailable ? (
            <View style={tw`items-center py-[20px]`}>
              <Text style={[typography.bodySm, { color: colors.secondary50 }]}>예약 가능한 디자이너가 없습니다</Text>
            </View>
          ) : (
            <View style={tw`px-[20px] gap-y-[20px]`}>
              {visibleDesigners.map((d) => (
                <DesignerOption
                  key={d.id}
                  designer={d}
                  selected={selectedDesignerId === d.id}
                  onPress={() => selectDesigner(d.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* 시간 — 디자이너를 선택해야 표시됨 */}
        {selectedDesignerId && (
          <>
            <Divider />
            <View style={tw`gap-y-[20px]`}>
              <View style={tw`px-[20px]`}>
                <Text style={[typography.headingMd, { color: colors.secondary }]}>시간</Text>
              </View>
              {slotsLoading ? (
                <View style={tw`py-[30px] items-center`}>
                  <ActivityIndicator color={colors.secondary} />
                </View>
              ) : slotsError ? (
                <View style={tw`py-[30px] items-center`}>
                  <Text style={[typography.bodySm, { color: colors.secondary50 }]}>시간을 불러오지 못했어요.</Text>
                </View>
              ) : slots.length === 0 ? (
                <View style={tw`py-[30px] items-center`}>
                  <Text style={[typography.bodySm, { color: colors.secondary50 }]}>선택한 날짜에 가능한 시간이 없어요.</Text>
                </View>
              ) : (
                <ReserveTimeBar
                  slots={slots}
                  selectedDesignerId={selectedDesignerId}
                  durationMinutes={totalDuration}
                  onChange={setSelectedStartAt}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={[tw`p-[20px]`, { backgroundColor: colors.background, ...shadows.bar }]}>
        <Button
          label="예약하기"
          disabled={!canProceed}
          style={tw`w-full`}
          onPress={() => navigation.navigate('BookingConfirm', {
            designId,
            startAt: selectedStartAt!,
            designerId: selectedDesignerId,
            selectedOptionIds,
          })}
        />
      </View>
    </SafeAreaView>
  );
}
