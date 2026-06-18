import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { colors, typography, shadows } from '../theme/tokens';
import { useReservations } from '../hooks/useSchedule';
import { Reservation, ReservationStatus } from '../types';

const FUTURE_STATUSES: ReservationStatus[] = ['pending', 'confirmed'];
const PAST_STATUSES: ReservationStatus[] = [
  'completed', 'rejected', 'cancelled_by_user', 'cancelled_by_shop', 'no_show',
];

function formatDateLabel(startAt: string): string {
  const date = new Date(startAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${month}.${day} (${dayName}) / ${ampm} ${String(displayHour).padStart(2, '0')}:${minutes}`;
}

function computeDday(startAt: string): string {
  const start = new Date(startAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

// ─── 방문 예정 카드 ───────────────────────────────────────────────
function FutureCard({ reservation }: { reservation: Reservation }) {
  return (
    <View
      style={[
        tw`rounded-[10px] px-[20px] py-[28px]`,
        { backgroundColor: colors.background, ...shadows.subtle },
      ]}
    >
      {/* 정보 행 */}
      <View style={tw`flex-row items-center gap-x-[20px] mb-[18px]`}>
        <Image
          source={{ uri: reservation.thumbnailUri }}
          style={tw`w-[57px] h-[57px] rounded-[10px]`}
          resizeMode="cover"
        />
        <View style={tw`flex-1 flex-row items-center justify-between`}>
          <View style={tw`gap-y-[5px]`}>
            <Text style={[typography.bodyMd, { color: colors.secondary }]}>
              {reservation.shopName}
            </Text>
            <Text style={[typography.bodySm, { color: colors.secondary }]}>
              {formatDateLabel(reservation.startAt)}
            </Text>
          </View>
          {/* D-Day 뱃지 */}
          <View
            style={[
              tw`rounded-[12px] px-[10px]`,
              { paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgba(187,175,168,0.1)' },
            ]}
          >
            <Text style={[typography.caption, { color: colors.secondary50 }]}>
              {computeDday(reservation.startAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* 예약 내역 버튼 (filled) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[tw`h-[35px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
      >
        <Text style={[typography.caption, { color: colors.background }]}>예약 내역</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── 방문 완료 아이템 ─────────────────────────────────────────────
function PastItem({ reservation }: { reservation: Reservation }) {
  return (
    <View style={tw`gap-y-[15px]`}>
      {/* 정보 행: 텍스트(좌) + 이미지(우) */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`gap-y-[5px]`}>
          <Text style={[typography.bodyMd, { color: colors.secondary }]}>
            {reservation.shopName}
          </Text>
          <Text style={[typography.bodySm, { color: colors.secondary }]}>
            {formatDateLabel(reservation.startAt)}
          </Text>
        </View>
        <Image
          source={{ uri: reservation.thumbnailUri }}
          style={tw`w-[57px] h-[57px] rounded-[10px]`}
          resizeMode="cover"
        />
      </View>

      {/* 버튼 행 (outline × 3) */}
      <View style={tw`flex-row gap-x-[10px]`}>
        {(['다시 예약', '예약 내역', '리뷰 쓰기'] as const).map((label) => (
          <TouchableOpacity
            key={label}
            activeOpacity={0.7}
            style={[
              tw`flex-1 h-[35px] rounded-[5px] items-center justify-center`,
              { borderWidth: 1, borderColor: colors.secondary },
            ]}
          >
            <Text style={[typography.caption, { color: colors.secondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────
function Skeleton() {
  return (
    <View style={tw`gap-y-[21px] px-[20px] py-[20px]`}>
      <View style={tw`gap-y-[12px]`}>
        <View style={tw`h-[26px] w-[72px] bg-[#DDDDDD] rounded-[4px]`} />
        <View style={[tw`rounded-[10px] px-[20px] py-[28px] gap-y-[18px]`, { backgroundColor: colors.background, ...shadows.subtle }]}>
          <View style={tw`flex-row gap-x-[20px]`}>
            <View style={tw`w-[57px] h-[57px] rounded-[10px] bg-[#DDDDDD]`} />
            <View style={tw`flex-1 gap-y-[8px] justify-center`}>
              <View style={tw`h-[16px] w-[80px] bg-[#DDDDDD] rounded-[4px]`} />
              <View style={tw`h-[14px] w-[130px] bg-[#DDDDDD] rounded-[4px]`} />
            </View>
          </View>
          <View style={tw`h-[35px] rounded-[5px] bg-[#DDDDDD]`} />
        </View>
      </View>
      <View style={tw`gap-y-[28px]`}>
        <View style={tw`h-[26px] w-[72px] bg-[#DDDDDD] rounded-[4px]`} />
        {[0, 1].map((i) => (
          <View key={i} style={tw`gap-y-[15px]`}>
            <View style={tw`flex-row justify-between`}>
              <View style={tw`gap-y-[8px]`}>
                <View style={tw`h-[16px] w-[80px] bg-[#DDDDDD] rounded-[4px]`} />
                <View style={tw`h-[14px] w-[130px] bg-[#DDDDDD] rounded-[4px]`} />
              </View>
              <View style={tw`w-[57px] h-[57px] rounded-[10px] bg-[#DDDDDD]`} />
            </View>
            <View style={tw`flex-row gap-x-[10px]`}>
              {[0, 1, 2].map((j) => <View key={j} style={tw`flex-1 h-[35px] rounded-[5px] bg-[#DDDDDD]`} />)}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────────
function EmptyItem({ message }: { message: string }) {
  return (
    <View style={tw`py-[24px] items-center`}>
      <Text style={[typography.bodySm, { color: colors.secondary50 }]}>{message}</Text>
    </View>
  );
}

// ─── 메인 화면 ────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const { data: reservations, isLoading, isError, refetch } = useReservations();

  const futureItems = (reservations ?? []).filter((r) => FUTURE_STATUSES.includes(r.status));
  const pastItems = (reservations ?? []).filter((r) => PAST_STATUSES.includes(r.status));

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={tw`h-[54px] px-[20px] justify-center`}>
        <Text style={[typography.headingLg, { color: colors.secondary }]}>일정</Text>
      </View>

      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[typography.bodySm, { color: colors.text, marginBottom: 12 }]}>
            불러오기에 실패했어요
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.7}
            style={[tw`px-[20px] h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
          >
            <Text style={[typography.bodySm, { color: colors.background }]}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20, gap: 21 }}>
          {/* 방문 예정 섹션 */}
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <Text style={[typography.headingMd, { color: colors.secondary }]}>방문 예정</Text>
            {futureItems.length > 0
              ? futureItems.map((r) => <FutureCard key={r.id} reservation={r} />)
              : <EmptyItem message="예정된 방문이 없어요" />}
          </View>

          {/* 방문 완료 섹션 */}
          <View style={{ paddingHorizontal: 20, gap: 28 }}>
            <Text style={[typography.headingMd, { color: colors.secondary }]}>방문 완료</Text>
            {pastItems.length > 0 ? (
              pastItems.map((r, i) => (
                <React.Fragment key={r.id}>
                  <PastItem reservation={r} />
                  <View style={{ height: 1, backgroundColor: colors.line }} />
                </React.Fragment>
              ))
            ) : (
              <EmptyItem message="방문 완료된 예약이 없어요" />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
