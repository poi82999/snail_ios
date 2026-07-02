import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useAuthSession, useUpdateMe } from '../hooks/useAuth';
import { getErrorMessage } from '../api/errorMessages';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEdit'>;

function AvatarPlaceholder({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.disabled,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="person" size={size * 0.5} color={colors.secondary50} />
    </View>
  );
}

export default function ProfileEditScreen({ navigation }: Props) {
  const { data: user } = useAuthSession();
  const { mutate: updateMe, isPending } = useUpdateMe();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  const avatarUri = user?.profile_image_url;
  const showAvatar = !!avatarUri && !avatarError;

  function handleSave() {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    setError('');
    updateMe(
      { nickname: nickname.trim(), bio: bio.trim() || null },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={{ height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`w-[32px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} disabled={isPending}>
          {isPending ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: 14, color: colors.secondary }}>
              저장
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1`}>
        <ScrollView
          contentContainerStyle={tw`px-[24px] pt-[24px] pb-[40px]`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 아바타 */}
          <View style={tw`items-center mb-[32px]`}>
            <View>
              {showAvatar ? (
                <Image
                  source={{ uri: avatarUri! }}
                  style={tw`w-[80px] h-[80px] rounded-full`}
                  resizeMode="cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarPlaceholder size={80} />
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="camera" size={13} color={colors.background} />
              </View>
            </View>
          </View>

          {/* 닉네임 */}
          <View style={tw`mb-[20px]`}>
            <Text style={[typography.bodySm, { color: colors.secondary, marginBottom: 8, fontFamily: fontFamily.semibold }]}>
              닉네임
            </Text>
            <TextInput
              style={[
                tw`h-[48px] px-[16px] rounded-[10px]`,
                {
                  borderWidth: 1,
                  borderColor: colors.line,
                  fontFamily: fontFamily.regular,
                  fontSize: 14,
                  color: colors.primary,
                },
              ]}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력해주세요"
              placeholderTextColor={colors.secondary50}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <Text style={[typography.caption, { color: colors.secondary50, marginTop: 4, textAlign: 'right' }]}>
              {nickname.length}/20
            </Text>
          </View>

          {/* 소개 */}
          <View style={tw`mb-[20px]`}>
            <Text style={[typography.bodySm, { color: colors.secondary, marginBottom: 8, fontFamily: fontFamily.semibold }]}>
              한 줄 소개
            </Text>
            <TextInput
              style={[
                tw`px-[16px] py-[14px] rounded-[10px]`,
                {
                  borderWidth: 1,
                  borderColor: colors.line,
                  fontFamily: fontFamily.regular,
                  fontSize: 14,
                  color: colors.primary,
                  minHeight: 96,
                  textAlignVertical: 'top',
                },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="나를 소개해보세요"
              placeholderTextColor={colors.secondary50}
              multiline
              maxLength={100}
            />
            <Text style={[typography.caption, { color: colors.secondary50, marginTop: 4, textAlign: 'right' }]}>
              {bio.length}/100
            </Text>
          </View>

          {error ? (
            <Text style={[typography.bodySm, { color: colors.danger, textAlign: 'center', marginTop: 8 }]}>
              {error}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
