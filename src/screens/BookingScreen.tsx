import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, DesignOptionKind } from '../types';
import { useDesignDetail } from '../hooks/useDesignDetail';
import { groupOptionsByKind } from '../api/bookingApi';
import BookingDesignCard from '../components/BookingDesignCard';
import BookingBottomBar from '../components/BookingBottomBar';
import RadioOption from '../components/RadioOption';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const TEXT = '#6F6F6F';

// 옵션 kind별 섹션 표시 순서/라벨
const KIND_SECTIONS: { kind: DesignOptionKind; label: string }[] = [
  { kind: 'removal', label: '제거' },
  { kind: 'extend', label: '연장' },
  { kind: 'care', label: '케어' },
];

export default function BookingScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: design } = useDesignDetail(designId);

  // 실제 옵션을 kind별로 그룹핑 (제거/연장/케어). 옵션 선택은 선택 사항.
  const grouped = groupOptionsByKind(design?.options ?? []);
  const [selected, setSelected] = useState<Record<DesignOptionKind, string | null>>({
    removal: null,
    extend: null,
    care: null,
  });

  const selectedOptions = (Object.keys(selected) as DesignOptionKind[])
    .map((k) => grouped[k].find((o) => o.id === selected[k]))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const extraPrice = selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
  const extraDuration = selectedOptions.reduce((s, o) => s + o.durationDelta, 0);
  const totalPrice = (design?.price ?? 0) + extraPrice;
  const totalDuration = (design?.duration ?? 0) + extraDuration;
  const selectedOptionIds = selectedOptions.map((o) => o.id);

  const visibleSections = KIND_SECTIONS.filter((s) => grouped[s.kind].length > 0);

  function toggle(kind: DesignOptionKind, id: string) {
    setSelected((prev) => ({ ...prev, [kind]: prev[kind] === id ? null : id }));
  }

  // 옵션은 선택 사항이라 항상 다음 단계로 진행 가능
  const canBook = true;

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

        {/* 추가 옵션 타이틀 */}
        <View style={tw`px-[20px] py-[10px]`}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: TEXT }}>추가 옵션</Text>
        </View>

        {/* 옵션 섹션 (kind별 동적 렌더, 선택 사항) */}
        {visibleSections.length === 0 ? (
          <View style={tw`px-[20px] py-[20px]`}>
            <Text style={{ fontSize: 14, color: TEXT }}>선택 가능한 추가 옵션이 없어요.</Text>
          </View>
        ) : (
          visibleSections.map((section, idx) => {
            const opts = grouped[section.kind];
            const sel = opts.find((o) => o.id === selected[section.kind]);
            return (
              <React.Fragment key={section.kind}>
                {idx > 0 && (
                  <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />
                )}
                <View style={tw`py-[20px]`}>
                  <View style={tw`flex-row items-center justify-between px-[20px] mb-[4px]`}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: TEXT }}>{section.label}</Text>
                    <View style={tw`flex-row items-center`}>
                      <Ionicons name="alarm-outline" size={16} color={TEXT} />
                      <Text style={{ fontSize: 12, color: TEXT }}>
                        {sel && sel.durationDelta > 0 ? `+${sel.durationDelta}분` : '+00분'}
                      </Text>
                    </View>
                  </View>
                  {opts.map((opt) => (
                    <RadioOption
                      key={opt.id}
                      label={opt.name}
                      price={opt.priceDelta}
                      selected={selected[section.kind] === opt.id}
                      onPress={() => toggle(section.kind, opt.id)}
                    />
                  ))}
                </View>
              </React.Fragment>
            );
          })
        )}

        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 20 }} />
        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <BookingBottomBar
        ctaLabel="다음"
        canProceed={canBook}
        onPress={() => navigation.navigate('BookingDate', { designId, selectedOptionIds })}
      />
    </SafeAreaView>
  );
}
