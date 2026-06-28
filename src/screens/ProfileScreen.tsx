import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import Logo from '../components/Logo';
import Button from '../components/Button';
import type { RootStackParamList } from '../types';

const APP_VERSION = '1.0.0';

const MENU_SECTIONS = [
  {
    key: '쿠폰함',
    icon: 'ticket-outline' as const,
    items: [
      { label: '쿠폰함', screen: 'Coupon' as const },
    ],
  },
  {
    key: '고객 센터',
    icon: 'help-circle-outline' as const,
    items: [
      { label: '1:1 문의', screen: 'Inquiry' as const },
      { label: '공지사항', screen: 'Notice' as const },
      { label: '이용약관', screen: 'Terms' as const },
    ],
  },
  {
    key: '알림 설정',
    icon: 'notifications-outline' as const,
    items: [
      { label: '알림 설정', screen: 'NotificationSettings' as const },
    ],
  },
] as const;

const STATS = [
  { value: '0', label: '게시글' },
  { value: '0', label: '팔로워' },
  { value: '0', label: '팔로잉' },
];


function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginHorizontal: 20 }} />;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const displayName = user?.nickname ?? '사용자';
  const avatarUri = user?.profile_image_url ?? null;
  const [avatarError, setAvatarError] = useState(false);
  const showAvatar = Boolean(avatarUri) && !avatarError;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px]`}>
        <Logo />
        <View style={tw`flex-row items-center gap-x-[8px]`}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')} style={tw`relative`}>
            <Ionicons name="notifications-outline" size={28} color={colors.secondary} />
            {unreadCount > 0 && (
              <View style={tw`absolute top-0 right-0 w-[8px] h-[8px] rounded-full bg-[#E8604C]`} />
            )}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 영역 */}
        <View style={tw`px-[20px] pt-[16px] pb-[24px]`}>
          {/* 아바타 + 닉네임 + 수정버튼 */}
          <View style={tw`flex-row items-center gap-[16px]`}>
            {showAvatar ? (
              <Image source={{ uri: avatarUri! }} style={tw`w-[60px] h-[60px] rounded-full`} resizeMode="cover" onError={() => setAvatarError(true)} />
            ) : (
              <AvatarPlaceholder size={60} />
            )}
            <View style={tw`flex-1 flex-row items-center justify-between`}>
              <Text style={[typography.bodyMd, { color: colors.secondary, fontFamily: fontFamily.semibold }]}>{displayName}</Text>
              <Button
                label="수정"
                variant="outline"
                onPress={() => {}}
                style={{ height: 30, paddingHorizontal: 16, borderRadius: 6 }}
              />
            </View>
          </View>

          {/* 게시글 · 팔로워 · 팔로잉 */}
          <View style={tw`flex-row items-center gap-[20px] mt-[12px]`}>
            {STATS.map(({ value, label }) => (
              <View key={label} style={tw`flex-row items-center gap-[4px]`}>
                <Text style={[typography.bodySm, { color: colors.secondary, fontFamily: fontFamily.semibold }]}>{label}</Text>
                <Text style={[typography.bodySm, { color: colors.secondary }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* 메뉴 섹션 리스트 */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.key}>
            {/* 섹션 헤더 */}
            <View style={tw`flex-row items-center gap-[6px] px-[20px] pt-[20px] pb-[8px]`}>
              <Ionicons name={section.icon} size={16} color={colors.secondary50} />
              <Text style={{ fontSize: 13, fontFamily: fontFamily.semibold, color: colors.secondary50 }}>
                {section.key}
              </Text>
            </View>
            {/* 섹션 아이템 */}
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={() => { if (item.screen) navigation.navigate(item.screen as never); }}
                style={tw`flex-row items-center justify-between px-[20px] h-[48px]`}
              >
                <Text style={[typography.bodySm, { color: colors.secondary }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.secondary50} />
              </TouchableOpacity>
            ))}
            <Divider />
          </View>
        ))}

        {/* 앱 버전 */}
        <View style={tw`flex-row items-center px-[20px] h-[48px]`}>
          <Text style={{ fontSize: 13, fontFamily: fontFamily.semibold, color: colors.secondary50 }}>앱 버전</Text>
          <Text style={{ fontSize: 13, fontFamily: fontFamily.regular, color: colors.secondary50, marginLeft: 12 }}>
            ver {APP_VERSION}
          </Text>
        </View>

        <View style={tw`h-[20px]`} />
      </ScrollView>
    </SafeAreaView>
  );
}
