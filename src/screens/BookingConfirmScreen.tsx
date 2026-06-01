import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(125,105,93,0.1)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="time-outline" size={32} color={colors.secondary} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary, textAlign: 'center', marginTop: 8 }}>
          예약을 요청했어요!
        </Text>
        <Text style={{ fontSize: 14, color: colors.secondary50, textAlign: 'center', lineHeight: 22 }}>
          사장님의 수락을 기다리는 중이에요.{'\n'}수락되면 알림으로 알려드릴게요.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <TouchableOpacity
          onPress={() => navigation.popToTop()}
          activeOpacity={0.8}
          style={{ height: 48, borderRadius: 8, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.background }}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
