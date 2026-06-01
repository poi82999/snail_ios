import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useCreateReservation, buildReservationPayload } from '../hooks/useBooking';
import { getErrorMessage } from '../api/errors';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen({ route, navigation }: Props) {
  const { designId, startAt, designerId, selectedOptionIds } = route.params;
  const { mutate, status, error, reset } = useCreateReservation();
  const firedRef = useRef(false);

  function submit() {
    const payload = buildReservationPayload({
      designId,
      startAt,
      designerId,
      selectedOptionIds,
    });
    mutate(payload);
  }

  // 화면 진입 시 1회 예약 생성 호출
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPending = status === 'pending';
  const isError = status === 'error';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
        {isPending && (
          <>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={{ fontSize: 16, color: colors.secondary50, marginTop: 8 }}>예약을 요청하는 중...</Text>
          </>
        )}

        {!isPending && !isError && (
          <>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(125,105,93,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={32} color={colors.secondary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center', marginTop: 8 }}>
              예약을 요청했어요!
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary50, textAlign: 'center', lineHeight: 22 }}>
              사장님의 수락을 기다리는 중이에요.{'\n'}수락되면 알림으로 알려드릴게요.
            </Text>
          </>
        )}

        {isError && (
          <>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,107,107,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="alert-circle-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center', marginTop: 8 }}>
              예약에 실패했어요
            </Text>
            <Text style={{ fontSize: 14, color: colors.secondary50, textAlign: 'center', lineHeight: 22 }}>
              {getErrorMessage(error)}
            </Text>
          </>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 32, gap: 10 }}>
        {isError ? (
          <>
            <TouchableOpacity
              onPress={() => { reset(); firedRef.current = true; submit(); }}
              activeOpacity={0.8}
              style={{ height: 48, borderRadius: 8, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.background }}>다시 시도</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.popToTop()}
              activeOpacity={0.8}
              style={{ height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.secondary }}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}
            disabled={isPending}
            style={{ height: 48, borderRadius: 8, backgroundColor: isPending ? '#D9D9D9' : colors.secondary, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.background }}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
