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
import SnailCard from '../components/SnailCard';
import { useSnailFeed, useToggleSnapLike } from '../hooks/useSnail';
import type { RootStackParamList, Snap, SnapFeedType } from '../types';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

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

function EmptyState(): React.ReactElement {
  return (
    <View style={tw`flex-1 items-center justify-center py-[60px]`}>
      <Ionicons name="snow-outline" size={48} color={colors.disabled} />
      <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 16 }]}>
        첫 스네일을 올려보세요
      </Text>
    </View>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <Text style={[typography.bodySm, { color: colors.secondary50, marginBottom: 12 }]}>
        불러오기에 실패했어요
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.7}
        style={[tw`px-[20px] h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
      >
        <Text style={[typography.bodySm, { color: colors.background }]}>다시 시도</Text>
      </TouchableOpacity>
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
      {/* Top Bar */}
      <View style={tw`h-[54px] px-[20px] flex-row items-center justify-between`}>
        <Text style={[typography.headingLg, { color: colors.secondary }]}>SNAIL</Text>
        <View style={tw`flex-row items-center gap-x-[10px]`}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={35} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={35} color={colors.secondary} />
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
        <EmptyState />
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
