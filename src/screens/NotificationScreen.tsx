import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import GuestEmptyState from '../components/GuestEmptyState';
import type { NotificationPublic } from '../api/notificationApi';
import { navigateToNotificationTarget } from '../navigation/notificationRouting';
import type { RootStackParamList } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

function NotificationItem({
  item,
  onPress,
}: {
  item: NotificationPublic;
  onPress: () => void;
}) {
  const isUnread = !item.read_at;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={tw`flex-row items-start px-[20px] py-[16px] gap-x-[12px] ${isUnread ? 'bg-[#FFF8F6]' : 'bg-white'}`}
    >
      {/* 안읽음 dot */}
      <View style={tw`w-[8px] h-[8px] rounded-full mt-[6px] ${isUnread ? 'bg-[#E8604C]' : 'bg-transparent'}`} />

      <View style={tw`flex-1`}>
        <Text style={tw`text-[14px] font-medium text-[#1A1A1A] leading-[20px]`}>
          {item.title}
        </Text>
        <Text style={tw`mt-[4px] text-[13px] text-[#6F6F6F] leading-[18px]`}>
          {item.body}
        </Text>
        <Text style={tw`mt-[6px] text-[12px] text-[#B0B0B0]`}>
          {relativeTime(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={tw`h-[1px] bg-[#F5F5F5] mx-[20px]`} />;
}

function EmptyState() {
  return (
    <View style={tw`flex-1 items-center justify-center py-[80px]`}>
      <Ionicons name="notifications-outline" size={48} color="#D9D9D9" />
      <Text style={tw`mt-[16px] text-[14px] text-[#6F6F6F]`}>알림이 없어요</Text>
    </View>
  );
}

export default function NotificationScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();

  function handlePress(item: NotificationPublic) {
    if (!item.read_at) {
      markRead(item.id);
    }
    // 푸시 진입과 동일한 단일 라우팅 규약 사용(reservation/design/shop/snap/snail).
    navigateToNotificationTarget(item);
  }

  // 비회원: 헤더만 유지하고 로그인 유도 빈 상태
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
        <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`w-[56px]`}>
            <Ionicons name="chevron-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={[tw`flex-1 text-center text-[16px]`, { fontFamily: fontFamily.semibold, color: colors.secondary }]}>알림</Text>
          <View style={tw`w-[56px]`} />
        </View>
        <GuestEmptyState message="로그인하고 알림을 확인해보세요" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`w-[56px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[tw`flex-1 text-center text-[16px]`, { fontFamily: fontFamily.semibold, color: colors.secondary }]}>알림</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => markAll()} activeOpacity={0.7} style={tw`w-[56px] items-end`}>
            <Text style={[tw`text-[13px]`, { color: colors.secondary }]}>모두 읽음</Text>
          </TouchableOpacity>
        ) : (
          <View style={tw`w-[56px]`} />
        )}
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color="#7D695D" />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-[14px] text-[#6F6F6F] mb-[12px]`}>불러오기에 실패했어요</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.7}
            style={tw`px-[20px] py-[10px] rounded-[8px] bg-[#1A1A1A]`}
          >
            <Text style={tw`text-white text-[14px]`}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={() => handlePress(item)} />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={tw`py-[20px] items-center`}>
                <ActivityIndicator color="#7D695D" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
