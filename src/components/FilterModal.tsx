import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { colors } from '../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.55;
const EXPANDED_HEIGHT  = SCREEN_HEIGHT * 0.92;

// ── 작은 칩 컴포넌트들 ─────────────────────────────

function ModalChip({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[tw`h-[32px] px-[16px] rounded-[16px] border items-center justify-center`,
        { borderColor: isActive ? colors.secondary : 'rgba(125,105,93,0.3)', backgroundColor: isActive ? colors.secondary : colors.background }]}
    >
      <Text style={[tw`text-[14px] font-semibold`, { color: isActive ? colors.background : colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ColorChip({ label, color, isActive, onPress }: { label: string; color: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[tw`h-[32px] px-[16px] rounded-[16px] border flex-row items-center gap-[4px]`,
        { borderColor: isActive ? colors.secondary : 'rgba(125,105,93,0.3)', backgroundColor: isActive ? colors.secondary : colors.background }]}
    >
      <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: color, borderWidth: color === '#FFFFFF' ? 1 : 0, borderColor: '#E5E5E5' }} />
      <Text style={[tw`text-[14px] font-semibold`, { color: isActive ? colors.background : colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 10 }} />;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={[tw`text-[14px] font-semibold`, { color: colors.secondary }]}>{children}</Text>;
}

function ChipRow({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={tw`flex-row flex-wrap gap-[10px]`}>
      {items.map(item => (
        <ModalChip key={item} label={item} isActive={selected.includes(item)} onPress={() => onToggle(item)} />
      ))}
    </View>
  );
}

// ── 가격 범위 슬라이더 ──────────────────────────────

const MAX_PRICE  = 1000000;
const HANDLE_SZ  = 22;
const MIN_GAP    = HANDLE_SZ + 8;

function fmt(price: number) {
  if (price <= 0) return '0원';
  if (price >= MAX_PRICE) return '100만원';
  const man = Math.floor(price / 10000);
  const rest = price % 10000;
  return rest === 0 ? `${man}만원` : `${price.toLocaleString('ko-KR')}원`;
}

function PriceRangeSlider() {
  const trackW   = useRef(0);
  const leftPx   = useRef(new Animated.Value(0)).current;
  const rightPx  = useRef(new Animated.Value(280)).current;
  const lCur     = useRef(0);
  const rCur     = useRef(280);
  const lStart   = useRef(0);
  const rStart   = useRef(280);
  const [minP, setMinP] = useState(0);
  const [maxP, setMaxP] = useState(MAX_PRICE);

  function toPrice(px: number) {
    const span = trackW.current - HANDLE_SZ;
    if (span <= 0) return 0;
    return Math.round((px / span) * MAX_PRICE / 10000) * 10000;
  }

  const leftPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => { lStart.current = lCur.current; },
    onPanResponderMove: (_, { dx }) => {
      const next = Math.max(0, Math.min(rCur.current - MIN_GAP, lStart.current + dx));
      leftPx.setValue(next);
      lCur.current = next;
      setMinP(toPrice(next));
    },
  })).current;

  const rightPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => { rStart.current = rCur.current; },
    onPanResponderMove: (_, { dx }) => {
      const maxPx = trackW.current - HANDLE_SZ;
      const next  = Math.max(lCur.current + MIN_GAP, Math.min(maxPx, rStart.current + dx));
      rightPx.setValue(next);
      rCur.current = next;
      setMaxP(toPrice(next));
    },
  })).current;

  const activeLeft  = Animated.add(leftPx,  HANDLE_SZ / 2);
  const activeWidth = Animated.subtract(rightPx, leftPx);

  return (
    <View>
      {/* 현재 범위 표시 */}
      <View style={{ alignItems: 'flex-end', marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.secondary }}>{fmt(minP)} ~ {fmt(maxP)}</Text>
      </View>

      {/* 슬라이더 트랙 */}
      <View
        style={{ height: HANDLE_SZ, justifyContent: 'center' }}
        onLayout={e => {
          const w = e.nativeEvent.layout.width;
          trackW.current = w;
          const initRight = w - HANDLE_SZ;
          rightPx.setValue(initRight);
          rCur.current   = initRight;
          rStart.current = initRight;
          setMaxP(MAX_PRICE);
        }}
      >
        {/* 배경 바 */}
        <View style={{ position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: colors.primary10, borderRadius: 2 }} />
        {/* 활성 바 */}
        <Animated.View style={{ position: 'absolute', height: 4, backgroundColor: colors.secondary, borderRadius: 2, left: activeLeft, width: activeWidth }} />
        {/* 왼쪽 핸들 */}
        <Animated.View
          {...leftPan.panHandlers}
          style={{ position: 'absolute', width: HANDLE_SZ, height: HANDLE_SZ, borderRadius: HANDLE_SZ / 2, backgroundColor: 'white', borderWidth: 2, borderColor: colors.secondary, left: leftPx }}
        />
        {/* 오른쪽 핸들 */}
        <Animated.View
          {...rightPan.panHandlers}
          style={{ position: 'absolute', width: HANDLE_SZ, height: HANDLE_SZ, borderRadius: HANDLE_SZ / 2, backgroundColor: 'white', borderWidth: 2, borderColor: colors.secondary, left: rightPx }}
        />
      </View>

      {/* 최솟값/최댓값 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontSize: 11, color: colors.secondary50 }}>0원</Text>
        <Text style={{ fontSize: 11, color: colors.secondary50 }}>100만원</Text>
      </View>
    </View>
  );
}

// ── 캘린더 ──────────────────────────────────────────

function CalendarSection() {
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(6);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalDays    = new Date(year, month, 0).getDate();
  const startOffset  = new Date(year, month - 1, 1).getDay();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  // 앞 빈칸을 이전 달 날짜로 채움
  type Cell = { day: number; current: boolean };
  const cells: Cell[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, current: true });
  }
  // 뒤 빈칸 채우기 (7의 배수 맞춤)
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  function key(c: Cell) { return `${c.current ? 'cur' : 'other'}-${c.day}`; }

  function toggle(c: Cell) {
    if (!c.current) return;
    const k = `${year}-${month}-${c.day}`;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function isSelected(c: Cell) {
    return selected.has(`${year}-${month}-${c.day}`);
  }

  function prev() { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }
  function next() { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }

  return (
    <View style={tw`gap-y-[14px]`}>
      <View style={tw`flex-row items-center justify-center gap-[20px]`}>
        <TouchableOpacity onPress={prev} activeOpacity={0.7}><Ionicons name="chevron-back" size={16} color={colors.secondary} /></TouchableOpacity>
        <Text style={[tw`text-[14px] font-semibold`, { color: colors.secondary }]}>{year}년 {month}월</Text>
        <TouchableOpacity onPress={next} activeOpacity={0.7}><Ionicons name="chevron-forward" size={16} color={colors.secondary} /></TouchableOpacity>
      </View>
      <View style={tw`flex-row`}>
        {['일','월','화','수','목','금','토'].map(d => (
          <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 13, color: colors.secondary }}>{d}</Text>
        ))}
      </View>
      <View style={tw`flex-row flex-wrap`}>
        {cells.map((cell, i) => {
          const sel = isSelected(cell);
          return (
            <TouchableOpacity
              key={`${i}-${key(cell)}`}
              onPress={() => toggle(cell)}
              activeOpacity={cell.current ? 0.7 : 1}
              style={[
                { width: '14.28%', alignItems: 'center', paddingVertical: 7 },
                sel ? { backgroundColor: colors.secondary, borderRadius: 20 } : undefined,
              ]}
            >
              <Text style={{
                fontSize: 13,
                color: sel
                  ? colors.background
                  : cell.current
                    ? colors.secondary
                    : 'rgba(125,105,93,0.3)',
              }}>
                {cell.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── 메인 모달 ────────────────────────────────────────

interface Props { visible: boolean; onClose: () => void; initialSection?: string; }

export default function FilterModal({ visible, onClose, initialSection }: Props) {
  const sheetHeight   = useRef(new Animated.Value(0)).current;
  const currentH      = useRef(0);
  const gestureStartH = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionY      = useRef<Record<string, number>>({});

  useEffect(() => {
    if (visible) {
      sheetHeight.setValue(0);
      currentH.current = 0;
      if (initialSection) {
        // 높이 즉시 세팅 후 바로 해당 섹션으로 스크롤
        sheetHeight.setValue(EXPANDED_HEIGHT);
        currentH.current = EXPANDED_HEIGHT;
        requestAnimationFrame(() => {
          const y = sectionY.current[initialSection] ?? 0;
          scrollViewRef.current?.scrollTo({ y, animated: true });
        });
      } else {
        Animated.spring(sheetHeight, { toValue: COLLAPSED_HEIGHT, tension: 50, friction: 12, useNativeDriver: false }).start();
        currentH.current = COLLAPSED_HEIGHT;
      }
    }
  }, [visible, initialSection]);

  function snapToExpanded() {
    Animated.spring(sheetHeight, { toValue: EXPANDED_HEIGHT, tension: 50, friction: 12, useNativeDriver: false }).start();
    currentH.current = EXPANDED_HEIGHT;
  }
  function snapToCollapsed() {
    Animated.spring(sheetHeight, { toValue: COLLAPSED_HEIGHT, tension: 50, friction: 12, useNativeDriver: false }).start();
    currentH.current = COLLAPSED_HEIGHT;
  }
  function dismiss() {
    Animated.timing(sheetHeight, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => onClose());
  }

  // PanResponder는 핸들 영역에만 적용
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      sheetHeight.stopAnimation(v => { currentH.current = v; });
      gestureStartH.current = currentH.current;
    },
    onPanResponderMove: (_, { dy }) => {
      const newH = Math.min(EXPANDED_HEIGHT, Math.max(COLLAPSED_HEIGHT * 0.5, gestureStartH.current - dy));
      sheetHeight.setValue(newH);
      currentH.current = newH;
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      const newH = Math.min(EXPANDED_HEIGHT, Math.max(0, gestureStartH.current - dy));
      if (vy < -0.5 || newH > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2) {
        snapToExpanded();
      } else if (vy > 1.5 || newH < COLLAPSED_HEIGHT * 0.6) {
        dismiss();
      } else {
        snapToCollapsed();
      }
    },
  })).current;

  const [selLoc,   setSelLoc]   = useState<string[]>([]);
  const [selTime,  setSelTime]  = useState<string[]>([]);
  const [selColor, setSelColor] = useState<string[]>([]);
  const [selVibe,  setSelVibe]  = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  }

  const colorItems = [
    { label: '화이트', color: '#FFFFFF' }, { label: '그레이', color: '#9E9E9E' },
    { label: '블랙',   color: '#1A1A1A' }, { label: '핑크',   color: '#F9A8D4' },
    { label: '레드',   color: '#EF4444' }, { label: '베이지', color: '#D4B896' },
    { label: '그린',   color: '#86EFAC' }, { label: '네이비', color: '#1E3A5F' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      {/* 배경 딤 */}
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={dismiss} />

        {/* 시트 */}
        <Animated.View style={{ height: sheetHeight, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
          {/* 드래그 핸들 */}
          <View style={{ height: 22, alignItems: 'center', justifyContent: 'center' }} {...panResponder.panHandlers}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDDDDD' }} />
          </View>

          {/* 상단 바 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 44 }} {...panResponder.panHandlers}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>필터</Text>
            <TouchableOpacity onPress={dismiss} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View
              style={tw`px-[20px] py-[14px] gap-y-[10px]`}
              onLayout={e => { sectionY.current['region'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>지역</SectionTitle>
              <ChipRow items={['전체','강남','건대','명동','성수']}       selected={selLoc}   onToggle={v => toggle(selLoc,   setSelLoc,   v)} />
              <ChipRow items={['신림','압구정','이태원','잠실','홍대']}   selected={selLoc}   onToggle={v => toggle(selLoc,   setSelLoc,   v)} />
            </View>
            <Divider />
            <View
              style={tw`px-[20px] py-[14px] gap-y-[10px]`}
              onLayout={e => { sectionY.current['duration'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>소요시간</SectionTitle>
              <ChipRow items={['전체','1시간 이내','1-2시간','2시간+']} selected={selTime}  onToggle={v => toggle(selTime,  setSelTime,  v)} />
            </View>
            <Divider />
            <View
              style={tw`px-[20px] py-[14px] gap-y-[10px]`}
              onLayout={e => { sectionY.current['date'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>날짜</SectionTitle>
              <CalendarSection />
            </View>
            <Divider />
            <View
              style={tw`px-[20px] py-[14px] gap-y-[10px]`}
              onLayout={e => { sectionY.current['price'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>가격</SectionTitle>
              <PriceRangeSlider />
            </View>
            <Divider />
            <View
              style={tw`px-[20px] py-[14px] gap-y-[10px]`}
              onLayout={e => { sectionY.current['color'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>색상</SectionTitle>
              <View style={tw`flex-row flex-wrap gap-[10px]`}>
                {colorItems.slice(0, 4).map(c => <ColorChip key={c.label} {...c} isActive={selColor.includes(c.label)} onPress={() => toggle(selColor, setSelColor, c.label)} />)}
              </View>
              <View style={tw`flex-row flex-wrap gap-[10px]`}>
                {colorItems.slice(4).map(c => <ColorChip key={c.label} {...c} isActive={selColor.includes(c.label)} onPress={() => toggle(selColor, setSelColor, c.label)} />)}
              </View>
            </View>
            <Divider />
            <View style={tw`px-[20px] py-[14px] gap-y-[10px]`}>
              <SectionTitle>분위기</SectionTitle>
              <ChipRow items={['심플','우아','키치','화려','빈티지']}   selected={selVibe}  onToggle={v => toggle(selVibe,  setSelVibe,  v)} />
              <ChipRow items={['귀여움','봄','여름','가을','겨울']}     selected={selVibe}  onToggle={v => toggle(selVibe,  setSelVibe,  v)} />
            </View>
            <View style={tw`pb-[40px]`} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
