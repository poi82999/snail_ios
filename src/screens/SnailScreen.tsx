import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import SnailCard from '../components/SnailCard';
import { useSnailFeed, useToggleSnapLike, useToggleSnapSave } from '../hooks/useSnail';
import type { RootStackParamList, Snap, SnapFeedType } from '../types';
import { colors, shadows } from '../theme/tokens';

interface FeedTab {
  label: string;
  value: SnapFeedType;
}

const FEED_TABS: FeedTab[] = [
  { label: '스네일', value: 'latest' },
  { label: '랭킹', value: 'ranking' },
  { label: '팔로잉', value: 'following' },
];

function SkeletonSnapCard(): React.ReactElement {
  return (
    <View style={[tw`mx-[16px] rounded-[8px] bg-white overflow-hidden`, shadows.card]}>
      <View style={tw`px-[12px] py-[10px] flex-row items-center`}>
        <View style={tw`w-[34px] h-[34px] rounded-[17px] bg-primary10`} />
        <View style={tw`ml-[8px] gap-y-[6px]`}>
          <View style={tw`w-[82px] h-[12px] rounded-[4px] bg-primary10`} />
          <View style={tw`w-[58px] h-[10px] rounded-[4px] bg-primary10`} />
        </View>
      </View>
      <View style={[tw`w-full bg-primary10`, { aspectRatio: 1 }]} />
      <View style={tw`px-[12px] pt-[10px] pb-[12px] gap-y-[8px]`}>
        <View style={tw`w-full h-[12px] rounded-[4px] bg-primary10`} />
        <View style={tw`w-[70%] h-[12px] rounded-[4px] bg-primary10`} />
        <View style={tw`flex-row gap-x-[8px] pt-[2px]`}>
          <View style={tw`w-[54px] h-[24px] rounded-chip bg-primary10`} />
          <View style={tw`w-[68px] h-[24px] rounded-chip bg-primary10`} />
        </View>
      </View>
    </View>
  );
}

function LoadingState(): React.ReactElement {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={tw`pt-[4px] pb-[20px] gap-y-[14px]`}
    >
      {[0, 1, 2].map((item) => (
        <SkeletonSnapCard key={item} />
      ))}
    </ScrollView>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <View style={tw`flex-1 items-center justify-center py-[60px]`}>
      <Ionicons name="snow-outline" size={48} color={colors.disabled} />
      <Text style={tw`mt-[16px] text-body-sm text-primary50`}>첫 스네일을 올려보세요</Text>
    </View>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <Text style={tw`text-body-sm text-primary50 mb-[12px]`}>불러오기에 실패했어요</Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.7}
        style={tw`px-[20px] py-[10px] rounded-[8px] bg-primary`}
      >
        <Text style={tw`text-body-sm text-white`}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SnailScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [feedType, setFeedType] = useState<SnapFeedType>('latest');

  // feedType은 React Query key에 포함되어 토글 변경 시 해당 피드를 다시 조회한다.
  const {
    snaps,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSnailFeed(feedType);
  const { mutate: toggleLike } = useToggleSnapLike();
  const { mutate: toggleSave } = useToggleSnapSave();

  const handleEndReached = (): void => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderSnap = ({ item }: ListRenderItemInfo<Snap>): React.ReactElement => (
    <SnailCard
      snap={item}
      onPress={() => navigation.navigate('SnapDetail', { snapId: item.id })}
      onLike={() => toggleLike(item.id)}
      onSave={() => toggleSave(item.id)}
    />
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center justify-between px-[16px] py-[12px]`}>
        <Text style={tw`text-heading-lg text-primary`}>스네일</Text>
        <View style={tw`flex-row items-center gap-x-[14px]`}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => undefined}
            disabled
            activeOpacity={0.7}
            style={tw`opacity-50`}
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`px-[16px] pt-[4px] pb-[12px]`}>
        <View style={tw`h-[40px] rounded-chip bg-primary10 p-[4px] flex-row`}>
          {FEED_TABS.map((tab) => {
            const isActive = feedType === tab.value;

            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setFeedType(tab.value)}
                activeOpacity={0.8}
                style={[
                  tw`flex-1 h-[32px] rounded-chip items-center justify-center`,
                  isActive ? tw`bg-white` : null,
                  isActive ? shadows.subtle : null,
                ]}
              >
                <Text style={tw`text-body-sm ${isActive ? 'text-primary' : 'text-primary50'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : snaps.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item.id}
          renderItem={renderSnap}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pt-[4px] pb-[20px]`}
          ItemSeparatorComponent={() => <View style={tw`h-[14px]`} />}
          onEndReachedThreshold={0.5}
          onEndReached={handleEndReached}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={tw`py-[20px] items-center`}>
                <ActivityIndicator color={colors.secondary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
