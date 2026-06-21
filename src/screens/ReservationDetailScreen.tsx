import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, ReservationStatus } from '../types';
import { useReservationDetail, useCancelReservation } from '../hooks/useSchedule';
import { useShopDetail } from '../hooks/useShop';
import { getErrorMessage } from '../api/errors';
import { colors, typography, shadows } from '../theme/tokens';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationDetail'>;

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: '대기중',
  payment_pending: '결제 대기중',
  confirmed: '확정',
  rejected: '거절됨',
  cancelled_by_user: '취소됨',
  cancelled_by_shop: '취소됨',
  completed: '완료',
  no_show: '노쇼',
};

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={[typography.headingMd, { color: colors.secondary }]}>{children}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`flex-row items-start justify-between gap-[16px]`}>
      <Text style={[typography.bodySm, { color: colors.secondary50 }]}>{label}</Text>
      <Text style={[typography.bodySm, { flex: 1, textAlign: 'right', color: colors.secondary }]}>{value}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${dayNames[d.getDay()]})`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${ampm} ${String(displayHour).padStart(2, '0')}:${minutes}`;
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

// IA_SPEC.md [SCHEDULE-02] 예약 상세
export default function ReservationDetailScreen({ route, navigation }: Props) {
  const { reservationId } = route.params;
  const { data: reservation, isLoading, isError, refetch } = useReservationDetail(reservationId);
  const { data: shop } = useShopDetail(reservation?.shopId ?? '');
  const { mutate: cancel, isPending: isCancelling } = useCancelReservation();

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <ActivityIndicator color={colors.secondary} />
      </SafeAreaView>
    );
  }

  if (isError || !reservation) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <Text style={[typography.bodySm, { color: colors.secondary50, marginBottom: 12 }]}>
          불러오기에 실패했어요
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={tw`px-[20px] py-[10px] rounded-[8px]`} activeOpacity={0.7}>
          <Text style={[typography.bodySm, { color: colors.secondary }]}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const canCancel = reservation.status === 'pending' || reservation.status === 'payment_pending' || reservation.status === 'confirmed';
  const canReview = reservation.status === 'completed';
  const reasonLabel = reservation.status === 'rejected' ? '거절 사유' : '취소 사유';
  const reasonText = reservation.rejectedReason ?? reservation.cancelledReason;

  function onCancelPress() {
    Alert.alert('예약을 취소할까요?', '취소하면 되돌릴 수 없어요.', [
      { text: '아니요', style: 'cancel' },
      {
        text: '예약 취소',
        style: 'destructive',
        onPress: () =>
          cancel(
            { reservationId },
            { onError: (error) => Alert.alert('취소에 실패했어요', getErrorMessage(error)) }
          ),
      },
    ]);
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`h-[54px] justify-center px-[22px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`px-[20px] pb-[120px] gap-y-[24px]`}>
        {/* 상태 배지 + D-Day */}
        <View style={tw`flex-row items-center gap-x-[10px]`}>
          <View style={[tw`rounded-[12px] px-[10px] py-[5px]`, { backgroundColor: 'rgba(125,105,93,0.1)' }]}>
            <Text style={[typography.caption, { color: colors.secondary }]}>{STATUS_LABEL[reservation.status]}</Text>
          </View>
          <Text style={[typography.caption, { color: colors.secondary50 }]}>{computeDday(reservation.startAt)}</Text>
        </View>

        {/* 디자인 정보 */}
        <View style={tw`gap-y-[12px]`}>
          <SectionTitle>디자인 정보</SectionTitle>
          <View style={tw`flex-row items-center gap-x-[14px]`}>
            <Image source={{ uri: reservation.designThumbnailUri }} style={{ width: 57, height: 57, borderRadius: 10, backgroundColor: colors.line }} resizeMode="cover" />
            <View style={tw`flex-1 gap-y-[4px]`}>
              <Text style={[typography.bodyMd, { color: colors.secondary }]}>{reservation.designTitle}</Text>
              <View style={tw`flex-row items-center justify-between`}>
                <Text style={[typography.bodySm, { color: colors.secondary }]}>{reservation.designPrice.toLocaleString('ko-KR')}원</Text>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="alarm-outline" size={16} color={colors.secondary50} />
                  <Text style={[typography.caption, { color: colors.secondary50 }]}>{reservation.designDuration}분</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('DesignDetail', { designId: reservation.designId })}
            activeOpacity={0.7}
            style={tw`flex-row items-center justify-center gap-x-[4px] h-[35px] rounded-[5px]`}
          >
            <Text style={[typography.caption, { color: colors.secondary }]}>디자인 보기</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <Divider />

        {/* 샵 정보 */}
        <View style={tw`gap-y-[12px]`}>
          <SectionTitle>샵 정보</SectionTitle>
          <View style={tw`flex-row items-center gap-x-[14px]`}>
            <Image source={{ uri: shop?.thumbnailUri ?? reservation.shopThumbnailUri }} style={{ width: 57, height: 57, borderRadius: 10, backgroundColor: colors.line }} resizeMode="cover" />
            <View style={tw`flex-1 gap-y-[4px]`}>
              <Text style={[typography.bodyMd, { color: colors.secondary }]}>{reservation.shopName}</Text>
              {shop?.address ? (
                <Text style={[typography.bodySm, { color: colors.secondary50 }]}>{shop.address}</Text>
              ) : null}
            </View>
          </View>
          <View style={tw`flex-row gap-x-[10px]`}>
            <TouchableOpacity
              onPress={() => shop?.address && Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`)}
              activeOpacity={0.7}
              style={[tw`flex-1 h-[35px] rounded-[5px] items-center justify-center`, { borderWidth: 1, borderColor: colors.secondary }]}
            >
              <Text style={[typography.caption, { color: colors.secondary }]}>길찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => shop?.phoneNumber && Linking.openURL(`tel:${shop.phoneNumber}`)}
              activeOpacity={0.7}
              style={[tw`flex-1 h-[35px] rounded-[5px] items-center justify-center`, { borderWidth: 1, borderColor: colors.secondary }]}
            >
              <Text style={[typography.caption, { color: colors.secondary }]}>전화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopDetail', { shopId: reservation.shopId })}
              activeOpacity={0.7}
              style={[tw`flex-1 h-[35px] rounded-[5px] items-center justify-center`, { borderWidth: 1, borderColor: colors.secondary }]}
            >
              <Text style={[typography.caption, { color: colors.secondary }]}>샵 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider />

        {/* 예약 정보 */}
        <View style={tw`gap-y-[12px]`}>
          <SectionTitle>예약 정보</SectionTitle>
          <View style={tw`gap-y-[10px]`}>
            <InfoRow label="날짜" value={formatDate(reservation.startAt)} />
            <InfoRow label="시간" value={formatTime(reservation.startAt)} />
            <InfoRow label="디자이너" value={reservation.designerName ?? '자동 배정'} />
          </View>
        </View>

        {/* 요청사항 */}
        {reservation.userRequest ? (
          <>
            <Divider />
            <View style={tw`gap-y-[12px]`}>
              <SectionTitle>요청사항</SectionTitle>
              <Text style={[typography.bodySm, { color: colors.secondary }]}>{reservation.userRequest}</Text>
            </View>
          </>
        ) : null}

        {/* 거절/취소 사유 */}
        {reasonText ? (
          <>
            <Divider />
            <View style={tw`gap-y-[12px]`}>
              <SectionTitle>{reasonLabel}</SectionTitle>
              <Text style={[typography.bodySm, { color: colors.secondary }]}>{reasonText}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* 하단 CTA — pending/confirmed: 예약 취소, completed: 리뷰 작성하기, 기타: 없음 */}
      {(canCancel || canReview) && (
        <View style={[tw`p-[20px]`, { backgroundColor: colors.background, ...shadows.bar }]}>
          {canCancel ? (
            <Button
              label={isCancelling ? '취소하는 중...' : '예약 취소'}
              disabled={isCancelling}
              onPress={onCancelPress}
              style={tw`w-full`}
            />
          ) : (
            <Button
              label="리뷰 작성하기"
              onPress={() => navigation.navigate('ReviewWrite', { reservationId })}
              style={tw`w-full`}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
