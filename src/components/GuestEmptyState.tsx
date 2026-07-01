import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface GuestEmptyStateProps {
  /** 안내 문구 (예: "로그인하고 예약을 확인해보세요") */
  message: string;
}

/**
 * 비회원이 인증 필요한 화면(일정·알림·찜목록·쿠폰 등)에 진입했을 때 보여주는 빈 상태.
 * 로그인 버튼은 기존 로그인 화면으로 이동한다.
 */
export default function GuestEmptyState({ message }: GuestEmptyStateProps) {
  const navigation = useNavigation<Nav>();

  return (
    <View style={tw`flex-1 items-center justify-center px-[40px]`}>
      <Text style={tw`text-[40px] mb-[16px]`}>🐌</Text>
      <Text
        style={[
          typography.bodyMd,
          { color: colors.secondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
        ]}
      >
        {message}
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Login')}
        style={[
          tw`h-[48px] px-[40px] rounded-[10px] items-center justify-center`,
          { backgroundColor: colors.secondary },
        ]}
      >
        <Text style={{ fontFamily: fontFamily.semibold, fontSize: 15, color: colors.background }}>
          로그인
        </Text>
      </TouchableOpacity>
    </View>
  );
}
