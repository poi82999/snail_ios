import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useEmailLogin, useDevLogin } from '../hooks/useAuth';
import { getErrorMessage } from '../api/errorMessages';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: emailLogin, isPending: isEmailPending } = useEmailLogin();
  const { mutate: devLogin, isPending: isDevPending } = useDevLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  function goToMain() {
    navigation.replace('Main');
  }

  function handleEmailLogin() {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    emailLogin(
      { email: email.trim(), password },
      {
        onSuccess: goToMain,
        onError: (err) => {
          if (err.status === 401 || err.code === 'INVALID_CREDENTIALS') {
            setError('이메일 또는 비밀번호가 일치하지 않아요.');
          } else {
            setError(getErrorMessage(err));
          }
        },
      }
    );
  }

  // 운영 Google/Apple OAuth는 provider 자격증명 + 네이티브 모듈 도입 후 연결한다.
  // 그 전까지는 백엔드 dev-login으로 실제 토큰을 발급받아 인증을 완성한다.
  function handleGoogleLogin() {
    setError('');
    devLogin(undefined, {
      onSuccess: goToMain,
      onError: (err) => setError(getErrorMessage(err)),
    });
  }

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1`}>
          {/* 로고 */}
          <View style={tw`flex-1 items-center justify-center`}>
            <Logo color="white" width={139} />
          </View>

          {/* 입력 + 버튼 */}
          <View style={tw`px-[24px] pb-[40px] gap-y-[12px]`}>
            {/* 이메일 */}
            <View
              style={[
                tw`flex-row items-center h-[48px] px-[16px] rounded-[10px]`,
                { backgroundColor: 'rgba(255,255,255,0.12)' },
              ]}
            >
              <TextInput
                style={[tw`flex-1`, { fontFamily: fontFamily.regular, fontSize: 14, color: colors.background }]}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 비밀번호 */}
            <View
              style={[
                tw`flex-row items-center h-[48px] px-[16px] rounded-[10px]`,
                { backgroundColor: 'rgba(255,255,255,0.12)' },
              ]}
            >
              <TextInput
                style={[tw`flex-1`, { fontFamily: fontFamily.regular, fontSize: 14, color: colors.background }]}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPw(p => !p)} activeOpacity={0.7}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={[typography.caption, { color: '#FF9999', textAlign: 'center' }]}>{error}</Text>
            ) : null}

            {/* 이메일 로그인 버튼 */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleEmailLogin}
              disabled={isEmailPending}
              style={[
                tw`h-[52px] rounded-[10px] items-center justify-center mt-[4px]`,
                { backgroundColor: colors.secondary },
              ]}
            >
              {isEmailPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.background }}>
                  로그인
                </Text>
              )}
            </TouchableOpacity>

            {/* Google 로그인 (임시: 백엔드 dev-login) */}
            <Button
              label={isDevPending ? '로그인 중…' : 'Google 계정으로 로그인'}
              onPress={handleGoogleLogin}
              disabled={isDevPending}
              style={{ backgroundColor: colors.primary }}
            />

            {/* 회원가입 링크 */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
              style={tw`items-center mt-[4px]`}
            >
              <Text style={{ fontSize: 14, fontFamily: fontFamily.regular, color: 'rgba(255,255,255,0.6)' }}>
                아직 계정이 없으신가요?{'  '}
                <Text style={{ color: colors.background, fontFamily: fontFamily.semibold }}>회원가입</Text>
              </Text>
            </TouchableOpacity>

            {/* 비회원 */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={goToMain}
              style={tw`items-center mt-[4px]`}
            >
              <Text style={{ fontSize: 14, fontFamily: fontFamily.regular, color: 'rgba(255,255,255,0.4)' }}>
                비회원으로 계속하기
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1208' },
  overlay: { backgroundColor: 'rgba(125, 105, 93, 0.7)' },
});
