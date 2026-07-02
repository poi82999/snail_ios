import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import Logo from '../components/Logo';
import SnailCard from '../components/SnailCard';
import { useSnailFeed, useToggleSnapLike } from '../hooks/useSnail';
import type { RootStackParamList, Snap, SnapFeedType } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import ErrorState from '../components/state/ErrorState';
import EmptyState from '../components/state/EmptyState';

interface FeedTab {
  label: string;
  value: SnapFeedType;
}

const FEED_TABS: FeedTab[] = [
  { label: '실시간', value: 'latest' },
  { label: '랭킹', value: 'ranking' },
  { label: '팔로잉', value: 'following' },
];

function SkeletonSnapCard(): React.ReactElement {
  return (
    <View>
      <View style={tw`flex-row items-center px-[16px] py-[12px] gap-x-[11.611px]`}>
        <View style={[tw`w-[35.348px] h-[35.348px] rounded-[17.674px]`, { backgroundColor: colors.primary10 }]} />
        <View style={[tw`w-[82px] h-[14px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
      </View>
      <View style={[tw`w-full`, { aspectRatio: 1, backgroundColor: colors.primary10 }]} />
      <View style={tw`px-[16px] py-[12px] gap-y-[8px]`}>
        <View style={tw`flex-row gap-x-[16px]`}>
          <View style={[tw`w-[40px] h-[12px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
          <View style={[tw`w-[40px] h-[12px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
          <View style={[tw`w-[40px] h-[12px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
        </View>
        <View style={[tw`w-full h-[14px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
        <View style={[tw`w-[60px] h-[12px] rounded-[4px]`, { backgroundColor: colors.primary10 }]} />
      </View>
    </View>
  );
}

function LoadingState(): React.ReactElement {
  return (
    <View>
      {[0, 1, 2].map((item) => (
        <SkeletonSnapCard key={item} />
      ))}
    </View>
  );
}

// Figma: Snail (418:4000)
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
      onPressTag={(designId) => navigation.navigate('DesignDetail', { designId })}
    />
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Top Bar — 홈/일정/프로필 탭과 동일한 디자인시스템 (Logo + 28px 아이콘, gap 8px) */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px]`}>
        <Logo />
        <View style={tw`flex-row items-center gap-x-[8px]`}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Favorites')} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab */}
      <View style={tw`flex-row items-center justify-center gap-x-[30px] pt-[24px] pb-[10px]`}>
        {FEED_TABS.map((tab) => {
          const isActive = feedType === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setFeedType(tab.value)}
              activeOpacity={0.7}
              style={{ width: 100 }}
            >
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 20,
                  textAlign: 'center',
                  fontFamily: isActive ? fontFamily.semibold : fontFamily.medium,
                  color: isActive ? colors.secondary : colors.secondary50,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : snaps.length === 0 ? (
        <EmptyState icon="snow-outline" title="첫 스네일을 올려보세요" />
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item.id}
          renderItem={renderSnap}
          showsVerticalScrollIndicator={false}
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
