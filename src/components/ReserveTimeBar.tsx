import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import type { DisplaySlot } from '../api/bookingApi';

interface ReserveTimeBarProps {
  slots: DisplaySlot[];
  selectedDesignerId: string;
  durationMinutes: number;
  onChange: (startAt: string | null) => void;
}

// Figma(352:4628): Select 컨테이너 619px(=659px-좌우 px20) ÷ 20칸(10시간) = 30.95px/칸
const CELL_WIDTH = 30.95;
const CELL_MS = 30 * 60 * 1000;
const BAR_HEIGHT = 58.721;
const AVAILABLE_COLOR = colors.background;
const UNAVAILABLE_COLOR = colors.secondary;
const SELECTED_VALID_COLOR = '#82a269';
const SELECTED_INVALID_COLOR = colors.danger;

function formatHourLabel(date: Date): string {
  return String(date.getHours());
}

interface Cell {
  startMs: number;
  available: boolean;
}

// Figma: ReserveTime (352:4628) — 30분 단위 셀 그리드 + 소요시간 길이의 드래그 가능한 블록.
// 블록이 전부 가능한 셀 위에 있으면 초록(예약 가능), 불가능한 셀에 걸치면 빨강(예약 불가).
export default function ReserveTimeBar({ slots, selectedDesignerId, durationMinutes, onChange }: ReserveTimeBarProps) {
  const hasSlots = slots.length > 0;
  const rangeStart = hasSlots ? new Date(slots[0].startAt).getTime() : 0;
  const rangeEnd = hasSlots ? new Date(slots[slots.length - 1].endAt).getTime() : 0;
  const totalCells = Math.max(1, Math.round((rangeEnd - rangeStart) / CELL_MS));
  const durationCells = durationMinutes / 30;
  const blockWidth = durationCells * CELL_WIDTH;
  const totalWidth = totalCells * CELL_WIDTH;

  const cells = useMemo<Cell[]>(() => {
    const result: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const startMs = rangeStart + i * CELL_MS;
      const slot = slots.find(
        (s) => startMs >= new Date(s.startAt).getTime() && startMs < new Date(s.endAt).getTime()
      );
      result.push({ startMs, available: Boolean(slot && slot.availableDesignerIds.includes(selectedDesignerId)) });
    }
    return result;
    // slots/selectedDesignerId 외 다른 값이 바뀔 때 재계산할 필요 없음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, selectedDesignerId, totalCells]);

  const hourMarks = useMemo(() => {
    const marks: { label: string; left: number }[] = [];
    const firstHour = new Date(rangeStart);
    firstHour.setMinutes(0, 0, 0);
    for (let t = firstHour.getTime(); t <= rangeEnd; t += 60 * 60 * 1000) {
      if (t < rangeStart) continue;
      marks.push({ label: formatHourLabel(new Date(t)), left: ((t - rangeStart) / CELL_MS) * CELL_WIDTH });
    }
    return marks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  // CELL_WIDTH(30.95)는 부동소수점이라 픽셀 단위로 left/CELL_WIDTH를 반복 나누면 경계값이
  // 살짝 밀려서(예: 1.9999998) Math.ceil이 칸을 하나 더 덮는 버그가 생긴다.
  // 그래서 위치를 픽셀이 아니라 정수 "칸 인덱스"로만 들고 다닌다.
  const maxLeftIndex = Math.max(0, totalCells - durationCells);
  const [leftIndex, setLeftIndex] = useState(0);
  const dragStartIndex = useRef(0);

  const coveredStartIdx = Math.max(0, Math.round(leftIndex));
  const coveredEndIdx = Math.min(totalCells, Math.ceil(leftIndex + durationCells));

  function isValidAt(startIdx: number, endIdx: number): boolean {
    for (let i = startIdx; i < endIdx; i++) {
      if (!cells[i]?.available) return false;
    }
    return true;
  }

  const valid = isValidAt(coveredStartIdx, coveredEndIdx);
  const left = leftIndex * CELL_WIDTH;

  useEffect(() => {
    if (valid) {
      onChange(new Date(rangeStart + coveredStartIdx * CELL_MS).toISOString());
    } else {
      onChange(null);
    }
    // coveredStartIdx/valid 변경 시에만 부모에 보고
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coveredStartIdx, valid]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartIndex.current = leftIndex;
      },
      onPanResponderMove: (_e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const rawIndex = dragStartIndex.current + gesture.dx / CELL_WIDTH;
        const snappedIndex = Math.round(rawIndex);
        setLeftIndex(Math.min(maxLeftIndex, Math.max(0, snappedIndex)));
      },
    })
  ).current;

  if (!hasSlots) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }} contentContainerStyle={{ paddingHorizontal: 20 }}>
      <View style={{ gap: 5, width: totalWidth }}>
        <View style={{ height: 10 }}>
          {hourMarks.map((mark, i) => (
            <Text
              key={`${mark.label}-${i}`}
              style={{
                position: 'absolute',
                left: mark.left,
                fontSize: 8,
                fontFamily: fontFamily.medium,
                color: colors.secondary,
              }}
            >
              {mark.label}
            </Text>
          ))}
        </View>

        <View style={{ width: totalWidth, height: BAR_HEIGHT, flexDirection: 'row' }}>
          {cells.map((cell, i) => {
            const isCovered = i >= coveredStartIdx && i < coveredEndIdx;
            const backgroundColor = isCovered
              ? (valid ? SELECTED_VALID_COLOR : SELECTED_INVALID_COLOR)
              : (cell.available ? AVAILABLE_COLOR : UNAVAILABLE_COLOR);
            return (
              <View
                key={cell.startMs}
                style={{
                  width: CELL_WIDTH,
                  height: '100%',
                  backgroundColor,
                  borderWidth: 1,
                  borderColor: colors.primary10,
                }}
              />
            );
          })}

          {/* 드래그 핸들 — 칸 색은 위 그리드가 그리므로 여긴 터치 영역만 투명하게 겹친다 */}
          <View
            {...panResponder.panHandlers}
            style={{
              position: 'absolute',
              top: 0,
              left,
              width: blockWidth,
              height: '100%',
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
