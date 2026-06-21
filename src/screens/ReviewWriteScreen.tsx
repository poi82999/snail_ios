import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useReservationDetail } from '../hooks/useSchedule';
import { useCreateReview } from '../hooks/useReviews';
import { getErrorMessage } from '../api/errors';
import { colors, typography, shadows } from '../theme/tokens';
import ReviewStar from '../components/ReviewStar';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewWrite'>;

const MIN_BODY_LENGTH = 10;
const MAX_BODY_LENGTH = 1000;

// IA_SPEC.md [REVIEW-01] 리뷰 작성
// 사진(0~5장)/태그(표준 태그)는 IA_SPEC엔 있지만 백엔드 ReviewCreate 스키마에 필드가 없어서
// (rating, body만 존재) 일단 보류 — 추가하려면 백엔드와 먼저 스키마 확인 필요.
export default function ReviewWriteScreen({ route, navigation }: Props) {
  const { reservationId } = route.params;
  const { data: reservation, isLoading } = useReservationDetail(reservationId);
  const { mutate, isPending, error } = useCreateReview();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');

  const canSubmit = rating > 0 && body.trim().length >= MIN_BODY_LENGTH && !isPending;

  function submit() {
    if (!canSubmit) return;
    mutate(
      { reservationId, rating, body: body.trim() },
      { onSuccess: () => navigation.goBack() }
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`h-[54px] justify-center px-[22px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`px-[20px] pb-[120px] gap-y-[24px]`}
      >
        <Text style={[typography.headingLg, { color: colors.primary }]}>리뷰 작성</Text>

        {/* 예약 정보 요약 */}
        {isLoading ? (
          <ActivityIndicator color={colors.secondary} />
        ) : reservation ? (
          <View style={[tw`flex-row items-center gap-x-[14px] p-[14px] rounded-[10px]`, { backgroundColor: colors.background, ...shadows.subtle }]}>
            <Image
              source={{ uri: reservation.designThumbnailUri }}
              style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.line }}
              resizeMode="cover"
            />
            <View style={tw`gap-y-[4px]`}>
              <Text style={[typography.bodyMd, { color: colors.secondary }]}>{reservation.shopName}</Text>
              <Text style={[typography.caption, { color: colors.secondary50 }]}>{reservation.designTitle}</Text>
            </View>
          </View>
        ) : null}

        {/* 별점 — 샵 별점만, 디자이너 별점 없음 */}
        <View style={tw`gap-y-[10px] items-center`}>
          <Text style={[typography.filter, { color: colors.secondary }]}>샵은 어떠셨나요?</Text>
          <View style={tw`flex-row gap-x-[8px]`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)} activeOpacity={0.7}>
                <ReviewStar filled={value <= rating} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 본문 */}
        <View style={tw`gap-y-[8px]`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={[typography.filter, { color: colors.secondary }]}>후기를 남겨주세요</Text>
            <Text style={[typography.caption, { color: colors.secondary50 }]}>{body.length}/{MAX_BODY_LENGTH}</Text>
          </View>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={MAX_BODY_LENGTH}
            placeholder={`최소 ${MIN_BODY_LENGTH}자 이상 작성해 주세요`}
            placeholderTextColor={colors.secondary50}
            style={[
              tw`h-[160px] rounded-[8px] border px-[14px] py-[12px]`,
              { borderColor: colors.line, color: colors.primary, fontSize: 14, lineHeight: 20, textAlignVertical: 'top' },
            ]}
          />
        </View>

        {error ? (
          <Text style={[typography.bodySm, { color: colors.danger }]}>{getErrorMessage(error)}</Text>
        ) : null}
      </ScrollView>

      <View style={[tw`p-[20px]`, { backgroundColor: colors.background, ...shadows.bar }]}>
        <Button
          label={isPending ? '등록하는 중...' : '등록하기'}
          disabled={!canSubmit}
          onPress={submit}
          style={tw`w-full`}
        />
      </View>
    </SafeAreaView>
  );
}
