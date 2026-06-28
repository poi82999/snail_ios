import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useTaxonomy } from '../hooks/useTaxonomy';
import type { SearchFilters } from '../types';
import TagChip from './TagChip';
import ColorTagChip from './ColorTagChip';
import CalendarDayCell from './CalendarDayCell';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.55;
const EXPANDED_HEIGHT  = SCREEN_HEIGHT * 0.92;
const TOP_BAR_HEIGHT   = 54;

// 색상 이름 → 스와치 hex (taxonomy는 이름만 주므로 표시용 매핑, 미정의는 회색 폴백)
const COLOR_HEX: Record<string, string> = {
  화이트: '#FFFFFF', 그레이: '#9E9E9E', 블랙: '#1A1A1A', 핑크: '#F9A8D4',
  레드: '#EF4444', 베이지: '#D4B896', 그린: '#86EFAC', 네이비: '#1E3A5F',
  블루: '#60A5FA', 퍼플: '#C4B5FD', 옐로우: '#FDE68A', 오렌지: '#FDBA74',
  브라운: '#A57C5B', 골드: '#D4AF37', 실버: '#C0C0C0',
};

// 소요시간 칩 → durationMin/Max(분) 매핑
const DURATION_OPTS: { label: string; min?: number; max?: number }[] = [
  { label: '전체' },
  { label: '1시간 이내', max: 60 },
  { label: '1-2시간', min: 60, max: 120 },
  { label: '2시간+', min: 120 },
];

// ── 작은 조각들 ─────────────────────────────
// 칩(TagChip/ColorTagChip)은 src/components/로 이미 분리됨 (Figma: Filter_pop / Filter_pop_color)

function CloseIcon() {
  return (
    <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
      <Path d="M10 10L25 25M25 10L10 25" stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// Figma: Fillter(344:1091)의 섹션 구분선. 시트 폭 402 기준 양쪽 10px 인셋(382/402).
function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginHorizontal: 10 }} />;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semibold, color: colors.secondary }}>
      {children}
    </Text>
  );
}

// Figma: 칩 한 줄 안에서는 gap 12, 줄과 줄 사이는 gap 10 (지역/소요시간/분위기 공통)
function ChipRow({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 12 }}>
      {items.map(item => (
        <TagChip key={item} label={item} isActive={selected.includes(item)} onPress={() => onToggle(item)} />
      ))}
    </View>
  );
}

// ── 가격 범위 슬라이더 (Figma: PriceFilter 270:18608) ──────────────────────────────

const MAX_PRICE   = 1000000;
const TRACK_HEIGHT = 10;
const HANDLE_W     = 30.124;
const HANDLE_H     = 18;
const MIN_GAP      = HANDLE_W + 8;

function fmt(price: number) {
  if (price <= 0) return '0원';
  if (price >= MAX_PRICE) return '100만원';
  const man = Math.floor(price / 10000);
  const rest = price % 10000;
  return rest === 0 ? `${man}만원` : `${price.toLocaleString('ko-KR')}원`;
}

function formatInput(text: string): string {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('ko-KR');
}

function fmtNum(price: number): string {
  if (price <= 0) return '0';
  if (price >= MAX_PRICE) return '100만';
  const man = Math.floor(price / 10000);
  const rest = price % 10000;
  return rest === 0 ? `${man}만` : price.toLocaleString('ko-KR');
}

function PriceRangeSlider({ onChange, maxPrice = MAX_PRICE }: { onChange?: (min: number, max: number) => void; maxPrice?: number }) {
  const trackW   = useRef(0);
  const leftPx   = useRef(new Animated.Value(0)).current;
  const rightPx  = useRef(new Animated.Value(280)).current;
  const lCur     = useRef(0);
  const rCur     = useRef(280);
  const lStart   = useRef(0);
  const rStart   = useRef(280);
  const [minP, setMinP] = useState(0);
  const [maxP, setMaxP] = useState(maxPrice);
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');

  function toPrice(px: number) {
    const span = trackW.current - HANDLE_W;
    if (span <= 0) return 0;
    return Math.round((px / span) * maxPrice / 10000) * 10000;
  }

  function toPixel(price: number) {
    const span = trackW.current - HANDLE_W;
    if (span <= 0) return 0;
    return Math.round((price / maxPrice) * span);
  }

  const leftPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => { lStart.current = lCur.current; },
    onPanResponderMove: (_, { dx }) => {
      const next = Math.max(0, Math.min(rCur.current - MIN_GAP, lStart.current + dx));
      leftPx.setValue(next);
      lCur.current = next;
      const p = toPrice(next);
      setMinP(p);
      setInputMin(p > 0 ? p.toLocaleString('ko-KR') : '');
      onChange?.(p, toPrice(rCur.current));
    },
  })).current;

  const rightPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => { rStart.current = rCur.current; },
    onPanResponderMove: (_, { dx }) => {
      const maxPx = trackW.current - HANDLE_W;
      const next  = Math.max(lCur.current + MIN_GAP, Math.min(maxPx, rStart.current + dx));
      rightPx.setValue(next);
      rCur.current = next;
      const p = toPrice(next);
      setMaxP(p);
      setInputMax(p < maxPrice ? p.toLocaleString('ko-KR') : '');
      onChange?.(toPrice(lCur.current), p);
    },
  })).current;

  function applyInputMin(text: string) {
    const raw = Number(text.replace(/,/g, '').replace(/[^0-9]/g, ''));
    if (isNaN(raw)) return;
    const clamped = Math.max(0, Math.min(toPrice(rCur.current) - 10000, raw));
    const px = toPixel(clamped);
    leftPx.setValue(px);
    lCur.current = px;
    setMinP(clamped);
    onChange?.(clamped, toPrice(rCur.current));
  }

  function applyInputMax(text: string) {
    const raw = Number(text.replace(/,/g, '').replace(/[^0-9]/g, ''));
    if (isNaN(raw)) return;
    const clamped = Math.min(maxPrice, Math.max(toPrice(lCur.current) + 10000, raw));
    const px = toPixel(clamped);
    rightPx.setValue(px);
    rCur.current = px;
    setMaxP(clamped);
    onChange?.(toPrice(lCur.current), clamped);
  }

  const activeLeft  = Animated.add(leftPx,  HANDLE_W / 2);
  const activeWidth = Animated.subtract(rightPx, leftPx);

  const inputBoxStyle = {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  };

  const inputTextStyle = {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: colors.secondary,
    textAlign: 'right' as const,
    padding: 0,
    includeFontPadding: false,
  };

  return (
    <View style={{ gap: 12 }}>
      {/* 직접 입력란 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={inputBoxStyle}>
          <TextInput
            style={inputTextStyle}
            value={inputMin}
            onChangeText={(t) => setInputMin(formatInput(t))}
            onBlur={() => applyInputMin(inputMin)}
            onSubmitEditing={() => applyInputMin(inputMin)}
            placeholder="0"
            placeholderTextColor={colors.secondary50}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary, marginLeft: 6 }}>원</Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.secondary50, fontFamily: fontFamily.regular }}>~</Text>
        <View style={inputBoxStyle}>
          <TextInput
            style={inputTextStyle}
            value={inputMax}
            onChangeText={(t) => setInputMax(formatInput(t))}
            onBlur={() => applyInputMax(inputMax)}
            onSubmitEditing={() => applyInputMax(inputMax)}
            placeholder={fmtNum(maxPrice)}
            placeholderTextColor={colors.secondary50}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary, marginLeft: 6 }}>원</Text>
        </View>
      </View>

      {/* 슬라이더 */}
      <View
        style={{ height: HANDLE_H, justifyContent: 'center' }}
        onLayout={e => {
          const w = e.nativeEvent.layout.width;
          trackW.current = w;
          const initRight = w - HANDLE_W;
          rightPx.setValue(initRight);
          rCur.current   = initRight;
          rStart.current = initRight;
          setMaxP(maxPrice);
        }}
      >
        <View style={{ position: 'absolute', top: (HANDLE_H - TRACK_HEIGHT) / 2, left: 0, right: 0, height: TRACK_HEIGHT, backgroundColor: colors.primary10, borderRadius: 6 }} />
        <Animated.View style={{ position: 'absolute', top: (HANDLE_H - TRACK_HEIGHT) / 2, height: TRACK_HEIGHT, backgroundColor: colors.secondary, borderRadius: 6, left: activeLeft, width: activeWidth }} />
        <Animated.View
          {...leftPan.panHandlers}
          style={{
            position: 'absolute', width: HANDLE_W, height: HANDLE_H, borderRadius: 9,
            backgroundColor: colors.background, left: leftPx,
            shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 2,
          }}
        />
        <Animated.View
          {...rightPan.panHandlers}
          style={{
            position: 'absolute', width: HANDLE_W, height: HANDLE_H, borderRadius: 9,
            backgroundColor: colors.background, left: rightPx,
            shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 2,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: minP === 0 ? colors.secondary50 : colors.secondary }}>{fmtNum(minP)}</Text>
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>원</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: maxP >= maxPrice ? colors.secondary50 : colors.secondary }}>{fmtNum(maxP)}</Text>
          <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>원</Text>
        </View>
      </View>
    </View>
  );
}

// ── 캘린더 (표시용 — 백엔드 검색 파라미터엔 날짜가 없어 쿼리에 반영하지 않음) ──
// Figma: Date(251:17363) > MonthFilter(554:5581). 요일/날짜 그리드는 CalendarDayCell 재사용.

function CalendarSection() {
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(6);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalDays    = new Date(year, month, 0).getDate();
  const startOffset  = new Date(year, month - 1, 1).getDay();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  type Cell = { day: number; current: boolean };
  const cells: Cell[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d, current: true });
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

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
  // 다른 달 미리보기 셀(c.current === false)은 화면에 보이는 month/year로 key를 만들면
  // 실제 달이 다른데 day 숫자만 같은 셀이 같은 key로 잘못 매칭된다(예: 6월 그리드 끝의
  // "7월 2일" 미리보기가 "6월 2일" 선택에 같이 켜짐) — 항상 선택 불가/비활성으로 둔다.
  function isSelected(c: Cell) { return c.current && selected.has(`${year}-${month}-${c.day}`); }
  function prev() { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }
  function next() { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }

  return (
    <View style={{ gap: 20, width: '100%' }}>
      <View style={tw`flex-row items-center justify-center gap-[20px]`}>
        <TouchableOpacity onPress={prev} activeOpacity={0.7}><Ionicons name="chevron-back" size={16} color={colors.secondary} /></TouchableOpacity>
        <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semibold, color: colors.secondary }}>{year}년 {month}월</Text>
        <TouchableOpacity onPress={next} activeOpacity={0.7}><Ionicons name="chevron-forward" size={16} color={colors.secondary} /></TouchableOpacity>
      </View>

      <View style={{ gap: 21, alignItems: 'center', width: '100%' }}>
        {/* Figma는 이 요일 라벨에 Inter Medium을 쓰는데, 디자인 시스템이 Pretendard 단일 폰트라
            폰트는 Pretendard-Medium으로, 크기(14.608)만 그대로 가져온다. */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 35, width: '100%' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <Text key={d} style={{ width: 38.616, textAlign: 'center', fontSize: 14.608, fontFamily: fontFamily.medium, color: colors.secondary }}>{d}</Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 }}>
          {cells.map((cell, i) => (
            <CalendarDayCell
              key={`${i}-${key(cell)}`}
              day={cell.day}
              selected={isSelected(cell)}
              disabled={!cell.current}
              onPress={() => toggle(cell)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── 메인 모달 ────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  initialSection?: string;
  initialFilters?: SearchFilters;
  onApply?: (filters: SearchFilters) => void;
  maxPrice?: number;
}

export default function FilterModal({ visible, onClose, initialSection, initialFilters, onApply, maxPrice = MAX_PRICE }: Props) {
  const sheetHeight   = useRef(new Animated.Value(0)).current;
  const currentH      = useRef(0);
  const gestureStartH = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionY      = useRef<Record<string, number>>({});

  const { data: taxonomy } = useTaxonomy();
  const regionItems = taxonomy?.regions ?? [];
  const colorItems = taxonomy?.colors ?? [];
  const moodItems = [...(taxonomy?.moods ?? []), ...(taxonomy?.seasons ?? [])];

  // 적용 대상 필터 상태(단일 region, 다중 colors/moods, 소요시간 라벨, 가격)
  const [selRegion, setSelRegion]   = useState<string | null>(null);
  const [selColor,  setSelColor]    = useState<string[]>([]);
  const [selMood,   setSelMood]     = useState<string[]>([]);
  const [durLabel,  setDurLabel]    = useState<string | null>(null);
  const priceRef = useRef<{ min: number; max: number }>({ min: 0, max: maxPrice });

  // 열릴 때 외부 filters로 초기화
  useEffect(() => {
    if (!visible) return;
    setSelRegion(initialFilters?.region ?? null);
    setSelColor(initialFilters?.colors ?? []);
    setSelMood(initialFilters?.moods ?? []);
    priceRef.current = {
      min: initialFilters?.priceMin ?? 0,
      max: initialFilters?.priceMax ?? maxPrice,
    };
    const matched = DURATION_OPTS.find(
      (o) => o.min === initialFilters?.durationMin && o.max === initialFilters?.durationMax
    );
    setDurLabel(matched ? matched.label : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) {
      sheetHeight.setValue(0);
      currentH.current = 0;
      if (initialSection) {
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

  function buildFilters(): SearchFilters {
    const dur = DURATION_OPTS.find((o) => o.label === durLabel);
    const { min, max } = priceRef.current;
    return {
      region: selRegion ?? undefined,
      colors: selColor.length ? selColor : undefined,
      moods: selMood.length ? selMood : undefined,
      durationMin: dur?.min,
      durationMax: dur?.max,
      priceMin: min > 0 ? min : undefined,
      priceMax: max < maxPrice ? max : undefined,
    };
  }

  function applyAndClose() {
    onApply?.(buildFilters());
  }

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

  function toggleMulti(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  }
  function toggleRegion(val: string) {
    setSelRegion(prev => (prev === val ? null : val));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={dismiss} />

        {/* Figma: Fillter(344:1091) */}
        <Animated.View
          style={{
            height: sheetHeight,
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 7.559,
            elevation: 6,
          }}
        >
          {/* Top Bar(251:17323) — 헤더 전체가 드래그 핸들 역할도 겸한다 (Figma엔 별도 드래그 인디케이터 없음) */}
          <View
            {...panResponder.panHandlers}
            style={[
              tw`flex-row items-center justify-between px-[20px]`,
              { height: TOP_BAR_HEIGHT, backgroundColor: colors.background },
              // shadows.bar(탭바와 공유하는 토큰)는 그대로 두고, 헤더만 더 미세하게 낮춰서 적용
              { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.04, shadowRadius: 1.5, elevation: 1 },
            ]}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semibold, color: colors.primary }}>필터</Text>
            <TouchableOpacity onPress={dismiss} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['region'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>지역</SectionTitle>
              {regionItems.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.secondary50 }}>불러오는 중...</Text>
              ) : (
                <ChipRow items={regionItems} selected={selRegion ? [selRegion] : []} onToggle={toggleRegion} />
              )}
            </View>
            <Divider />
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['duration'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>소요시간</SectionTitle>
              <ChipRow
                items={DURATION_OPTS.map((o) => o.label)}
                selected={durLabel ? [durLabel] : []}
                onToggle={(v) => setDurLabel(prev => (prev === v ? null : v))}
              />
            </View>
            <Divider />
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['date'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>날짜</SectionTitle>
              <CalendarSection />
            </View>
            <Divider />
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['price'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>가격</SectionTitle>
              <PriceRangeSlider onChange={(min, max) => { priceRef.current = { min, max }; }} maxPrice={maxPrice} />
            </View>
            <Divider />
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['color'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>색상</SectionTitle>
              {colorItems.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.secondary50 }}>불러오는 중...</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 10 }}>
                  {colorItems.map(name => (
                    <ColorTagChip
                      key={name}
                      label={name}
                      color={COLOR_HEX[name] ?? '#D9D9D9'}
                      isActive={selColor.includes(name)}
                      onPress={() => toggleMulti(selColor, setSelColor, name)}
                    />
                  ))}
                </View>
              )}
            </View>
            <Divider />
            <View
              style={{ padding: 20, gap: 10 }}
              onLayout={e => { sectionY.current['mood'] = e.nativeEvent.layout.y; }}
            >
              <SectionTitle>분위기</SectionTitle>
              {moodItems.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.secondary50 }}>불러오는 중...</Text>
              ) : (
                <ChipRow items={moodItems} selected={selMood} onToggle={(v) => toggleMulti(selMood, setSelMood, v)} />
              )}
            </View>
            <View style={tw`pb-[20px]`} />
          </ScrollView>

          {/* 적용 바 — Figma 프레임에는 없는 영역(스크롤 콘텐츠 바깥). "초기화"는 Figma에 없어서 제거. */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
            <TouchableOpacity
              onPress={applyAndClose}
              activeOpacity={0.85}
              style={{ height: 48, borderRadius: 8, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontFamily: fontFamily.bold, color: colors.background }}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
