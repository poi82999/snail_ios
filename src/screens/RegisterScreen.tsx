import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useRegister } from '../hooks/useAuth';
import { getErrorMessage } from '../api/errorMessages';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  hint?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={tw`mb-[20px]`}>
      <Text style={[typography.bodySm, { color: colors.secondary, marginBottom: 8 }]}>{label}</Text>
      <View
        style={[
          tw`flex-row items-center h-[48px] px-[16px] rounded-[10px]`,
          { borderWidth: 1, borderColor: error ? colors.danger : colors.line },
        ]}
      >
        <TextInput
          style={[
            tw`flex-1`,
            { fontFamily: fontFamily.regular, fontSize: 14, color: colors.primary },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.secondary50}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          autoCorrect={false}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(p => !p)} activeOpacity={0.7}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.secondary50} />
          </TouchableOpacity>
        )}
      </View>
      {hint && !error && (
        <Text style={[typography.caption, { color: colors.secondary50, marginTop: 4 }]}>{hint}</Text>
      )}
      {error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>{error}</Text>
      )}
    </View>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: register, isPending } = useRegister();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '올바른 이메일 형식이 아닙니다.';
    if (!password) errs.password = '비밀번호를 입력해주세요.';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password))
      errs.password = '8자 이상, 대문자·소문자·숫자를 모두 포함해야 합니다.';
    if (!nickname.trim()) errs.nickname = '닉네임을 입력해주세요.';
    if (!phone.trim()) errs.phone = '전화번호를 입력해주세요.';
    else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, '')))
      errs.phone = '올바른 전화번호 형식이 아닙니다.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setGlobalError('');
    register(
      { email: email.trim(), password, nickname: nickname.trim(), phoneNumber: phone.trim() || undefined },
      {
        onSuccess: () => navigation.replace('Main'),
        onError: (err) => {
          const msg = getErrorMessage(err);
          if (err.code === 'EMAIL_TAKEN') setFieldErrors(p => ({ ...p, email: msg }));
          else if (err.code === 'NICKNAME_TAKEN') setFieldErrors(p => ({ ...p, nickname: msg }));
          else if (err.code === 'INVALID_PASSWORD_POLICY') setFieldErrors(p => ({ ...p, password: msg }));
          else if (err.fieldErrors) {
            // 백엔드 VALIDATION_ERROR의 field_errors를 폼 필드에 매핑 (phone_number→phone)
            const fe = err.fieldErrors;
            setFieldErrors(p => ({
              ...p,
              ...(fe.email && { email: fe.email }),
              ...(fe.password && { password: fe.password }),
              ...(fe.nickname && { nickname: fe.nickname }),
              ...(fe.phone_number && { phone: fe.phone_number }),
            }));
            setGlobalError('입력값을 확인해주세요.');
          } else setGlobalError(msg);
        },
      }
    );
  }

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1`}>
          {/* 헤더 */}
          <View style={tw`h-[54px] px-[20px] flex-row items-center`}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`w-[32px]`}>
              <Ionicons name="chevron-back" size={24} color={colors.background} />
            </TouchableOpacity>
            <Text style={[typography.headingMd, { color: colors.background, marginLeft: 8 }]}>
              회원가입
            </Text>
          </View>

          <ScrollView
            style={tw`flex-1`}
            contentContainerStyle={tw`px-[24px] pb-[40px]`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Field
              label="이메일"
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.email}
            />
            <Field
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              placeholder="영문 대소문자+숫자 8자 이상"
              secureTextEntry
              autoCapitalize="none"
              hint="대문자·소문자·숫자를 모두 포함해야 합니다."
              error={fieldErrors.password}
            />
            <Field
              label="닉네임"
              value={nickname}
              onChangeText={setNickname}
              placeholder="사용할 닉네임"
              autoCapitalize="none"
              error={fieldErrors.nickname}
            />
            <Field
              label="전화번호"
              value={phone}
              onChangeText={setPhone}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
              error={fieldErrors.phone}
            />

            {globalError ? (
              <Text style={[typography.bodySm, { color: colors.danger, marginBottom: 16, textAlign: 'center' }]}>
                {globalError}
              </Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isPending}
              style={[
                tw`h-[52px] rounded-[12px] items-center justify-center mt-[8px]`,
                { backgroundColor: colors.secondary },
              ]}
            >
              {isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: 16, color: colors.background }}>
                  가입하기
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1208' },
  overlay: { backgroundColor: 'rgba(125, 105, 93, 0.7)' },
});
