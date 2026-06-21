import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useCreateReservation, buildReservationPayload } from '../hooks/useBooking';
import { useBookingSummary } from '../hooks/useBookingSummary';
import { formatSlotLabel } from '../api/bookingApi';
import { getErrorMessage } from '../api/errors';
import { colors, shadows } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

const TEXT = '#6F6F6F';
const BORDER = '#E5E5E5';
const ERROR = '#FF6B6B';
const DISABLED = '#D9D9D9';

function formatDateLabel(startAt: string): string {
  const date = new Date(startAt);

  if (Number.isNaN(date.getTime())) {
    return startAt.slice(0, 10);
  }

  // 시간 라벨과 같은 로컬 기준으로 예약 날짜를 표기한다.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={tw`flex-row items-start justify-between gap-[16px]`}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.secondary50 }}>{label}</Text>
      <Text
        style={{ flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.primary, textAlign: 'right' }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function BookingConfirmScreen({ route, navigation }: Props) {
  const { designId, startAt, designerId, selectedOptionIds } = route.params;
  const { design, selectedOptions, totalPrice, totalDuration } = useBookingSummary(
    designId,
    selectedOptionIds
  );
  const { mutate, status, error, data } = useCreateReservation();
  const [userRequest, setUserRequest] = useState('');
  const [noticeChecked, setNoticeChecked] = useState(false);
  const designerName = designerId
    ? design?.designers.find((designer) => designer.id === designerId)?.name ?? (design ? '자동 배정' : '불러오는 중...')
    : '자동 배정';
  const optionLabel = !design ? '불러오는 중...' : selectedOptions.length > 0
    ? selectedOptions.map((option) => option.name).join(', ')
    : '추가 옵션 없음';
  const priceLabel = design ? `${totalPrice.toLocaleString('ko-KR')}원` : '불러오는 중...';
  const durationLabel = design ? `${totalDuration}분` : '-';

  const isPending = status === 'pending';
  const isError = status === 'error';
  const isSuccess = status === 'success';
  const canSubmit = noticeChecked && !isPending;
  const ctaLabel = isPending ? '예약을 요청하는 중...' : isError ? '다시 시도' : '예약 요청 보내기';

  function submit(): void {
    if (!canSubmit) return;

    const trimmedRequest = userRequest.trim();
    const payload = buildReservationPayload({
      designId,
      startAt,
      designerId,
      selectedOptionIds,
      userRequest: trimmedRequest.length > 0 ? trimmedRequest : undefined,
    });

    mutate(payload);
  }

  if (isSuccess) {
    // 자동수락 샵은 생성 즉시 confirmed로 응답 → "확정", 그 외(pending/payment_pending)는 "승인 대기".
    const isConfirmed = data?.status === 'confirmed';
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 items-center justify-center px-[40px] gap-[16px]`}>
          <View
            style={[
              tw`w-[64px] h-[64px] rounded-full items-center justify-center`,
              { backgroundColor: isConfirmed ? 'rgba(76,175,80,0.12)' : 'rgba(125,105,93,0.1)' },
            ]}
          >
            <Ionicons
              name={isConfirmed ? 'checkmark-circle-outline' : 'time-outline'}
              size={32}
              color={isConfirmed ? '#4CAF50' : colors.secondary}
            />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center', marginTop: 8 }}>
            {isConfirmed ? '예약이 확정되었어요!' : '예약을 요청했어요!'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.secondary50, textAlign: 'center', lineHeight: 22 }}>
            {isConfirmed
              ? '예약이 바로 확정되었어요.\n일정에서 확인할 수 있어요.'
              : '사장님의 수락을 기다리는 중이에요.\n수락되면 알림으로 알려드릴게요.'}
          </Text>
        </View>

        <View style={tw`px-[20px] pb-[32px]`}>
          <TouchableOpacity
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}
            style={[tw`h-[48px] rounded-[8px] items-center justify-center`, { backgroundColor: colors.secondary }]}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.background }}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`h-[54px] justify-center px-[22px]`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={isPending ? 1 : 0.7}
          disabled={isPending}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`pb-[120px]`}
      >
        <View style={tw`px-[20px] pt-[6px] pb-[12px]`}>
          <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.primary }}>예약 내용 확인</Text>
          <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 20, color: colors.secondary50 }}>
            예약 요청 전 선택한 내용을 확인해 주세요.
          </Text>
        </View>

        <View
          style={[
            tw`mx-[10px] p-[20px] rounded-[10px] gap-y-[16px]`,
            { backgroundColor: colors.background, ...shadows.card },
          ]}
        >
          <View style={tw`flex-row items-center gap-[14px]`}>
            {design?.imageUri ? (
              <Image
                source={{ uri: design.imageUri }}
                style={tw`w-[57px] h-[57px] rounded-[10px]`}
                resizeMode="cover"
              />
            ) : (
              <View style={[tw`w-[57px] h-[57px] rounded-[10px] items-center justify-center`, { backgroundColor: '#F2F2F2' }]}>
                <Ionicons name="image-outline" size={22} color={TEXT} />
              </View>
            )}
            <View style={tw`flex-1 gap-y-[4px]`}>
              <Text style={{ fontSize: 18, lineHeight: 26, fontWeight: '600', color: TEXT }}>
                {design?.shopName ?? '디자인 정보를 불러오는 중...'}
              </Text>
              <View style={tw`flex-row items-center justify-between gap-[12px]`}>
                <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.primary }}>
                  {priceLabel}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="alarm-outline" size={18} color={TEXT} />
                  <Text style={{ fontSize: 12, lineHeight: 16, color: TEXT }}>{durationLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: BORDER }} />

          <View style={tw`gap-y-[10px]`}>
            <SummaryRow label="날짜" value={formatDateLabel(startAt)} />
            <SummaryRow label="시간" value={formatSlotLabel(startAt)} />
            <SummaryRow label="디자이너" value={designerName} />
            <SummaryRow label="옵션" value={optionLabel} />
          </View>
        </View>

        <View style={tw`px-[20px] pt-[24px] gap-y-[10px]`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={{ fontSize: 18, lineHeight: 26, fontWeight: '600', color: TEXT }}>요청사항</Text>
            <Text style={{ fontSize: 12, lineHeight: 16, color: colors.secondary50 }}>{userRequest.length}/200</Text>
          </View>
          <TextInput
            value={userRequest}
            onChangeText={setUserRequest}
            multiline
            maxLength={200}
            placeholder="요청사항을 입력해주세요 (선택)"
            placeholderTextColor={colors.secondary50}
            editable={!isPending}
            style={[
              tw`h-[112px] rounded-[8px] border px-[14px] py-[12px]`,
              {
                borderColor: BORDER,
                color: colors.primary,
                fontSize: 14,
                lineHeight: 20,
                textAlignVertical: 'top',
              },
            ]}
          />
        </View>

        <View style={tw`px-[20px] pt-[24px] gap-y-[12px]`}>
          <Text style={{ fontSize: 18, lineHeight: 26, fontWeight: '600', color: TEXT }}>취소/노쇼 안내</Text>
          <Text style={{ fontSize: 14, lineHeight: 22, color: colors.secondary50 }}>
            예약 확정 후 당일 취소 또는 노쇼가 반복되면 예약 이용이 제한될 수 있어요.
          </Text>
          <TouchableOpacity
            onPress={() => setNoticeChecked((checked) => !checked)}
            activeOpacity={isPending ? 1 : 0.7}
            disabled={isPending}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: noticeChecked, disabled: isPending }}
            style={tw`flex-row items-center gap-[10px] py-[4px]`}
          >
            <View
              style={[
                tw`w-[22px] h-[22px] rounded-[4px] border items-center justify-center`,
                {
                  borderColor: noticeChecked ? colors.secondary : BORDER,
                  backgroundColor: noticeChecked ? colors.secondary : colors.background,
                },
              ]}
            >
              {noticeChecked && <Ionicons name="checkmark" size={16} color={colors.background} />}
            </View>
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.primary }}>
              취소/노쇼 안내를 확인했어요.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[
          tw`px-[20px] pt-[12px] pb-[18px] gap-y-[10px]`,
          { backgroundColor: colors.background, ...shadows.bar },
        ]}
      >
        {isError && (
          <View style={tw`flex-row items-start gap-[8px]`}>
            <Ionicons name="alert-circle-outline" size={18} color={ERROR} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: ERROR }}>{getErrorMessage(error)}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={submit}
          activeOpacity={canSubmit ? 0.8 : 1}
          disabled={!canSubmit}
          style={[
            tw`h-[48px] rounded-[8px] flex-row items-center justify-center gap-[8px]`,
            { backgroundColor: canSubmit ? colors.secondary : DISABLED },
          ]}
        >
          {isPending && <ActivityIndicator size="small" color={colors.background} />}
          <Text style={{ fontSize: 15, fontWeight: '600', color: canSubmit ? colors.background : TEXT }}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
