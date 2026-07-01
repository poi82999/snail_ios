import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginPrompt'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_MESSAGE = '로그인하고 더 많은 기능을 이용해보세요';

export default function LoginPromptScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const message = route.params?.message ?? DEFAULT_MESSAGE;

  return (
    <View style={tw`flex-1 justify-end bg-[rgba(0,0,0,0.4)]`}>
      {/* 딤 배경 탭 → 닫기 */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => navigation.goBack()}
        style={tw`absolute inset-0`}
      />

      {/* 바텀 시트 */}
      <View
        style={[
          tw`bg-white rounded-t-[20px] px-[24px] pt-[20px]`,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* 핸들 */}
        <View style={tw`w-[40px] h-[4px] rounded-full bg-[#E5E5E5] self-center mb-[24px]`} />

        <Text style={tw`text-[32px] text-center mb-[8px]`}>🐌</Text>
        <Text style={[typography.headingMd, { color: colors.secondary, textAlign: 'center', marginBottom: 6 }]}>
          로그인이 필요해요
        </Text>
        <Text style={[typography.bodySm, { color: colors.secondary50, textAlign: 'center', marginBottom: 24 }]}>
          {message}
        </Text>

        {/* 로그인 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
          style={[
            tw`h-[52px] rounded-[10px] items-center justify-center mb-[10px]`,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.background }}>
            로그인
          </Text>
        </TouchableOpacity>

        {/* 회원가입 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Register')}
          style={[
            tw`h-[52px] rounded-[10px] items-center justify-center`,
            { borderWidth: 1, borderColor: colors.line },
          ]}
        >
          <Text style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.secondary }}>
            회원가입
          </Text>
        </TouchableOpacity>

        {/* 닫기 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={tw`items-center mt-[12px] py-[4px]`}
        >
          <Text style={{ fontFamily: fontFamily.regular, fontSize: 14, color: colors.secondary50 }}>
            닫기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
