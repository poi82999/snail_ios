import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { colors, typography } from '../theme/tokens';
import DesignCard from '../components/DesignCard';
import ShopSearchCard from '../components/ShopSearchCard';
import TabSelector from '../components/TabSelector';
import GuestEmptyState from '../components/GuestEmptyState';
import { chunkIntoPairs } from '../utils/array';
import { useGuardedLikeToggle } from '../hooks/useHome';
import { useAuth } from '../hooks/useAuth';
import { useFavoriteDesigns, useFavoriteShops } from '../hooks/useFavorites';

type FavTab = '디자인' | '샵';
const FAV_TABS = ['디자인', '샵'] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<FavTab>('디자인');
  const { toggleLike } = useGuardedLikeToggle();
  const { isAuthenticated } = useAuth();

  const {
    data: designData,
    isLoading: isDesignLoading,
    fetchNextPage: fetchNextDesigns,
    hasNextPage: hasNextDesigns,
    isFetchingNextPage: isFetchingNextDesigns,
  } = useFavoriteDesigns();

  const {
    data: shopData,
    isLoading: isShopLoading,
    fetchNextPage: fetchNextShops,
    hasNextPage: hasNextShops,
    isFetchingNextPage: isFetchingNextShops,
  } = useFavoriteShops();

  const designs = designData?.pages.flatMap(p => p.designs) ?? [];
  const shops   = shopData?.pages.flatMap(p => p.shops) ?? [];
  const designPairs = chunkIntoPairs(designs);
  const shopPairs   = chunkIntoPairs(shops);

  // 비회원: 헤더만 유지하고 로그인 유도 빈 상태
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
        <View style={{ height: 54, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ width: 32 }}>
            <Ionicons name="chevron-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={[typography.headingMd, { color: colors.secondary, flex: 1, textAlign: 'center' }]}>
            찜 목록
          </Text>
          <View style={{ width: 32 }} />
        </View>
        <GuestEmptyState message="로그인하고 찜한 디자인을 확인해보세요" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={{ height: 54, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ width: 32 }}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary, flex: 1, textAlign: 'center' }]}>
          찜 목록
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 탭 */}
      <TabSelector tabs={FAV_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 디자인 탭 */}
      {activeTab === '디자인' ? (
        isDesignLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color={colors.secondary} />
          </View>
        ) : designPairs.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Ionicons name="heart-outline" size={40} color={colors.secondary50} />
            <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 12 }]}>찜한 디자인이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={designPairs}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pt-[5px] pb-[20px] px-[16px]`}
            ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
            onEndReached={() => { if (hasNextDesigns && !isFetchingNextDesigns) fetchNextDesigns(); }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={isFetchingNextDesigns ? <ActivityIndicator color={colors.secondary} style={tw`py-[12px]`} /> : null}
            renderItem={({ item: [left, right] }) => (
              <View style={tw`flex-row gap-x-[8px]`}>
                <DesignCard
                  design={left}
                  onPress={() => navigation.navigate('DesignDetail', { designId: left.id })}
                  onLike={(id, liked) => toggleLike({ designId: id, isLiked: liked })}
                />
                {right ? (
                  <DesignCard
                    design={right}
                    onPress={() => navigation.navigate('DesignDetail', { designId: right.id })}
                    onLike={(id, liked) => toggleLike({ designId: id, isLiked: liked })}
                  />
                ) : (
                  <View style={tw`flex-1`} />
                )}
              </View>
            )}
          />
        )
      ) : (
        /* 샵 탭 */
        isShopLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color={colors.secondary} />
          </View>
        ) : shopPairs.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Ionicons name="heart-outline" size={40} color={colors.secondary50} />
            <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 12 }]}>찜한 샵이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={shopPairs}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pt-[5px] pb-[20px] px-[16px]`}
            ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
            onEndReached={() => { if (hasNextShops && !isFetchingNextShops) fetchNextShops(); }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={isFetchingNextShops ? <ActivityIndicator color={colors.secondary} style={tw`py-[12px]`} /> : null}
            renderItem={({ item: [left, right] }) => (
              <View style={tw`flex-row gap-x-[8px]`}>
                <ShopSearchCard shop={left} onPress={() => navigation.navigate('ShopDetail', { shopId: left.id })} />
                {right ? (
                  <ShopSearchCard shop={right} onPress={() => navigation.navigate('ShopDetail', { shopId: right.id })} />
                ) : (
                  <View style={tw`flex-1`} />
                )}
              </View>
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}
