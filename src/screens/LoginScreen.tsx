import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useDevLogin } from '../hooks/useAuth';
import { getErrorMessage } from '../api/errors';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: devLogin, isPending, error } = useDevLogin();

  function goToMain() {
    navigation.replace('Main');
  }

  // 운영 Google/Apple OAuth는 provider 자격증명 + 네이티브 모듈 도입 후 연결한다.
  // 그 전까지 로그인 버튼은 백엔드 dev-login으로 실제 토큰을 발급받아 인증을 완성한다
  // (성공 시 세션 캐시가 채워져 isAuthenticated=true → 로그인 게이트 루프가 풀린다).
  function handleLogin() {
    devLogin(undefined, { onSuccess: goToMain });
  }

  return (
    <View style={tw`flex-1 bg-[#1A1208]`}>
      {/* 어두운 브라운 베이스 위 세미 투명 오버레이 */}
      <View style={[tw`absolute top-0 bottom-0 left-0 right-0`, { backgroundColor: 'rgba(125, 105, 93, 0.7)' }]} />

      <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
        {/* 로고 — 화면 세로 중앙 */}
        <View style={tw`flex-1 items-center justify-center`}>
          <Logo color="white" width={139} />
        </View>

        {/* 하단 버튼 영역 */}
        <View style={tw`px-[19px] pb-[46px]`}>
          <Button
            label={isPending ? '로그인 중…' : 'Google 계정으로 로그인'}
            onPress={handleLogin}
            disabled={isPending}
            style={{ backgroundColor: colors.primary }}
          />
          {error && (
            <Text style={tw`mt-[10px] text-center text-[13px] text-[#FFD6CC]`}>
              {getErrorMessage(error)}
            </Text>
          )}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goToMain}
            style={tw`mt-[17px] items-center`}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.primary10 }}>
              비회원으로 계속하기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
