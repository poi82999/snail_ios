import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { useAuth } from '../hooks/useAuth';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import type { RootStackParamList } from '../types';

const MOCK_POSTS = Array.from({ length: 9 });

const STATS = [
  { value: '0', label: '게시물' },
  { value: '0', label: '팔로워' },
  { value: '0', label: '팔로잉' },
];

const ACTIONS = [
  { icon: 'ticket-outline' as const, label: '쿠폰함', screen: null },
  { icon: 'chatbox-outline' as const, label: '문의하기', screen: 'Inquiry' as const },
  { icon: 'heart-outline' as const, label: '좋아요', screen: null },
  { icon: 'notifications-outline' as const, label: '알림', screen: 'Notifications' as const },
];

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginHorizontal: 20 }} />;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const displayName = user?.nickname ?? '사용자';
  const displayBio = user?.bio ?? '안녕하세요 자기소개입니다';
  const avatarUri = user?.profile_image_url ?? null;
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = Boolean(avatarUri) && !avatarError;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 54,
      }}>
        <Text style={[typography.filter, { color: colors.secondary }]}>프로필</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={26} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 영역 */}
        <View style={tw`px-[20px] pt-[16px] pb-[24px] gap-y-[20px]`}>
          {/* 아바타 + 통계 */}
          <View style={tw`flex-row items-center gap-[32px]`}>
            {showAvatar ? (
              <Image source={{ uri: avatarUri! }} style={tw`w-[72px] h-[72px] rounded-full`} resizeMode="cover" onError={() => setAvatarError(true)} />
            ) : (
              <AvatarPlaceholder size={72} />
            )}
            <View style={tw`flex-1 flex-row justify-around`}>
              {STATS.map(({ value, label }) => (
                <View key={label} style={tw`items-center gap-y-[6px]`}>
                  <Text style={[typography.headingMd, { color: colors.secondary }]}>{value}</Text>
                  <Text style={[typography.caption, { color: colors.secondary50 }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 이름 + 소개 */}
          <View style={tw`gap-y-[6px]`}>
            <Text style={[typography.bodyMd, { color: colors.secondary }]}>{displayName}</Text>
            <Text style={[typography.bodySm, { color: colors.secondary50 }]}>{displayBio}</Text>
          </View>

          {/* 수정 / 공유 버튼 */}
          <View style={tw`flex-row gap-[12px]`}>
            {['프로필 수정', '프로필 공유'].map((label) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                style={[tw`flex-1 h-[36px] rounded-[8px] items-center justify-center`, { backgroundColor: colors.disabled }]}
              >
                <Text style={[typography.caption, { color: colors.secondary, fontFamily: fontFamily.semibold }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider />

        {/* 바로가기 카드 */}
        <View style={tw`mx-[20px] my-[16px]`}>
          <View style={[
            tw`bg-white rounded-[12px] flex-row items-center justify-evenly py-[16px]`,
            { borderWidth: 1, borderColor: colors.line },
          ]}>
            {ACTIONS.map(({ icon, label, screen }) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                style={tw`items-center gap-y-[6px] w-[56px]`}
                onPress={() => { if (screen) navigation.navigate(screen as never); }}
              >
                <View style={[tw`w-[44px] h-[44px] rounded-full items-center justify-center`, { backgroundColor: '#F7F5F3' }]}>
                  <Ionicons name={icon} size={22} color={colors.secondary} />
                </View>
                <Text style={[typography.caption, { color: colors.secondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider />

        {/* 게시물 그리드 */}
        <View style={tw`flex-row flex-wrap mt-[4px]`}>
          {MOCK_POSTS.map((_, i) => (
            <View
              key={i}
              style={{ width: '33.33%', aspectRatio: 1, backgroundColor: colors.disabled, borderWidth: 1, borderColor: colors.background }}
            />
          ))}
        </View>

        <View style={tw`h-[20px]`} />
      </ScrollView>
    </SafeAreaView>
  );
}
