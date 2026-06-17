import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import type { DisplaySlot } from '../api/bookingApi';

interface ReserveTimeBarProps {
  slots: DisplaySlot[];
  selectedDesignerId: string | null;
  selectedStartAt: string | null;
  onSelectSlot: (slot: DisplaySlot) => void;
}

const BAR_HEIGHT = 58.721;
const SELECTED_COLOR = '#82a269';

function isSlotAvailable(slot: DisplaySlot, designerId: string | null): boolean {
  return designerId ? slot.availableDesignerIds.includes(designerId) : slot.isAvailable;
}

function formatHourLabel(date: Date): string {
  return String(date.getHours());
}

// Figma: ReserveTime(352:4628, variants Time0~Time4). 정적 10~20시/5칸짜리 목업이 아니라
// 실제 슬롯 데이터(시작/끝 시간, 슬롯 개수, 영업시간)를 그대로 반영해 동적으로 그린다.
// 슬롯이 없으면(휴무 등) 아무것도 그릴 기준이 없어 호출 쪽에서 별도 빈 상태를 보여줘야 한다.
export default function ReserveTimeBar({ slots, selectedDesignerId, selectedStartAt, onSelectSlot }: ReserveTimeBarProps) {
  if (slots.length === 0) return null;

  const rangeStart = new Date(slots[0].startAt).getTime();
  const rangeEnd = new Date(slots[slots.length - 1].endAt).getTime();
  const totalMs = rangeEnd - rangeStart;

  const hourMarks: { label: string; leftPct: number }[] = [];
  const firstHour = new Date(slots[0].startAt);
  firstHour.setMinutes(0, 0, 0);
  for (let t = firstHour.getTime(); t <= rangeEnd; t += 60 * 60 * 1000) {
    if (t < rangeStart) continue;
    hourMarks.push({ label: formatHourLabel(new Date(t)), leftPct: ((t - rangeStart) / totalMs) * 100 });
  }

  return (
    <View style={{ gap: 5, width: '100%' }}>
      <View style={{ height: 10, paddingHorizontal: 15 }}>
        {hourMarks.map((mark, i) => (
          <Text
            key={`${mark.label}-${i}`}
            style={{
              position: 'absolute',
              left: `${mark.leftPct}%`,
              fontSize: 8,
              fontFamily: fontFamily.medium,
              color: colors.secondary,
              transform: [{ translateX: -4 }],
            }}
          >
            {mark.label}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', height: BAR_HEIGHT, paddingHorizontal: 20 }}>
        {slots.map((slot) => {
          const available = isSlotAvailable(slot, selectedDesignerId);
          const isSelected = slot.startAt === selectedStartAt;
          const durationMs = new Date(slot.endAt).getTime() - new Date(slot.startAt).getTime();
          const backgroundColor = isSelected ? SELECTED_COLOR : available ? colors.background : colors.secondary;
          const segmentStyle = { flex: durationMs, height: '100%' as const, backgroundColor, borderWidth: 1, borderColor: colors.primary10 };

          if (!available && !isSelected) {
            return <View key={slot.startAt} style={segmentStyle} />;
          }

          return (
            <TouchableOpacity key={slot.startAt} style={segmentStyle} activeOpacity={0.7} onPress={() => onSelectSlot(slot)} />
          );
        })}
      </View>
    </View>
  );
}
