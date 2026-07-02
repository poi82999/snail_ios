import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
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
const SELECTED_COLOR = '#82a269';

function formatHourLabel(date: Date): string {
  return String(date.getHours());
}

interface Cell {
  startMs: number;
  available: boolean;
}

interface ValidStart {
  cellIndex: number; // rangeStart 기준 30분 칸 인덱스
  startAt: string; // 서버 슬롯 start_at 원문 — 예약 생성에 이 값을 그대로 보내야 함
}

// Figma: ReserveTime (352:4628) — 30분 단위 셀 그리드 + 소요시간 길이의 초록 블록.
// 핵심 계약: 서버 availability 슬롯은 "시술시간만큼의 시작 가능 블록"이라 시작 시간을
// 임의 격자(30분)로 합성하면 서버가 거절한다("이미 예약된 시간").
// → 블록은 서버가 준 슬롯 시작 위치들 사이에서만 스냅되고, startAt 원문을 그대로 보고한다.
// 조작: 블록 드래그(바깥 스크롤과 충돌 없음) + 빈 칸 탭(가까운 슬롯으로 점프) + 바깥 스크롤(타임라인 이동).
export default function ReserveTimeBar({ slots, selectedDesignerId, durationMinutes, onChange }: ReserveTimeBarProps) {
  const hasSlots = slots.length > 0;
  const rangeStart = hasSlots ? new Date(slots[0].startAt).getTime() : 0;
  const rangeEnd = hasSlots ? new Date(slots[slots.length - 1].endAt).getTime() : 0;
  const totalCells = Math.max(1, Math.round((rangeEnd - rangeStart) / CELL_MS));
  const durationCells = Math.max(1, Math.round(durationMinutes / 30));
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

  // 선택한 디자이너가 가능한 "실제 시작 위치" 목록 — 블록은 이 위치들로만 스냅된다.
  const validStarts = useMemo<ValidStart[]>(
    () =>
      slots
        .filter((s) => s.availableDesignerIds.includes(selectedDesignerId))
        .map((s) => ({
          cellIndex: Math.round((new Date(s.startAt).getTime() - rangeStart) / CELL_MS),
          startAt: s.startAt,
        })),
    [slots, selectedDesignerId, rangeStart]
  );

  const hourMarks = useMemo(() => {
    const marks: { label: string; left: number }[] = [];
    const firstHour = new Date(rangeStart);
    firstHour.setMinutes(0, 0, 0);
    for (let t = firstHour.getTime(); t <= rangeEnd; t += 60 * 60 * 1000) {
      if (t < rangeStart) continue;
      marks.push({ label: formatHourLabel(new Date(t)), left: ((t - rangeStart) / CELL_MS) * CELL_WIDTH });
    }
    return marks;
  }, [rangeStart, rangeEnd]);

  // 블록 위치는 validStarts 배열의 인덱스로만 관리 — 서버에 없는 시간이 만들어질 수 없다.
  const [posIdx, setPosIdx] = useState(0);
  const dragStartCell = useRef(0);
  // 블록 드래그 중엔 바깥 가로 스크롤을 잠가 제스처 충돌을 막는다.
  const [blockDragging, setBlockDragging] = useState(false);

  // 디자이너 변경 등으로 validStarts가 줄어도 렌더 시점에 범위 안으로 클램프된다.
  const current = validStarts[Math.min(posIdx, validStarts.length - 1)] ?? null;
  const leftIndex = current?.cellIndex ?? 0;
  const coveredStartIdx = leftIndex;
  const coveredEndIdx = Math.min(totalCells, leftIndex + durationCells);
  const left = leftIndex * CELL_WIDTH;

  useEffect(() => {
    // 스냅 구조상 current가 있으면 항상 서버가 인정하는 시작 시간이다. 원문 그대로 보고.
    onChange(current?.startAt ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.startAt]);

  // 원하는 칸 위치에서 가장 가까운 유효 시작 위치로 스냅
  function snapToNearest(rawCellIndex: number): void {
    if (validStarts.length === 0) return;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    validStarts.forEach((v, i) => {
      const dist = Math.abs(v.cellIndex - rawCellIndex);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setPosIdx(best);
  }

  // PanResponder는 최초 1회 생성되므로 최신 값을 ref로 전달한다(렌더 후 useEffect에서 동기화)
  const leftIndexRef = useRef(leftIndex);
  const snapToNearestRef = useRef(snapToNearest);
  useEffect(() => {
    leftIndexRef.current = leftIndex;
    snapToNearestRef.current = snapToNearest;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // 바깥 ScrollView가 제스처를 뺏어가지 못하게 한다
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragStartCell.current = leftIndexRef.current;
        setBlockDragging(true);
      },
      onPanResponderMove: (_e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        snapToNearestRef.current(dragStartCell.current + gesture.dx / CELL_WIDTH);
      },
      onPanResponderRelease: () => setBlockDragging(false),
      onPanResponderTerminate: () => setBlockDragging(false),
    })
  ).current;

  if (!hasSlots) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!blockDragging}
      style={{ width: '100%' }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
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

        {/* 빈 곳 탭 → 그 위치에서 가장 가까운 유효 슬롯으로 블록 이동. 스와이프는 그대로 스크롤. */}
        <Pressable
          onPress={(e) => snapToNearest(e.nativeEvent.locationX / CELL_WIDTH - durationCells / 2)}
          style={{ width: totalWidth, height: BAR_HEIGHT, flexDirection: 'row' }}
        >
          {cells.map((cell, i) => {
            const isCovered = current !== null && i >= coveredStartIdx && i < coveredEndIdx;
            const backgroundColor = isCovered
              ? SELECTED_COLOR
              : cell.available
                ? AVAILABLE_COLOR
                : UNAVAILABLE_COLOR;
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
          {current !== null && (
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
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
