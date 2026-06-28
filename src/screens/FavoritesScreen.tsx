import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, Design, ShopSearchResult } from '../types';
import { colors, typography } from '../theme/tokens';
import DesignCard from '../components/DesignCard';
import ShopSearchCard from '../components/ShopSearchCard';
import TabSelector from '../components/TabSelector';
import { chunkIntoPairs } from '../utils/array';
import { useLikeToggle } from '../hooks/useHome';

type FavTab = '디자인' | '샵';
const FAV_TABS = ['디자인', '샵'] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

// 백엔드 찜 목록 API 미지원 — 데이터 연결 시 여기만 교체
const MOCK_DESIGNS: Design[] = [];
const MOCK_SHOPS: ShopSearchResult[] = [];

export default function FavoritesScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<FavTab>('디자인');
  const { mutate: toggleLike } = useLikeToggle();

  const designPairs = chunkIntoPairs(MOCK_DESIGNS);
  const shopPairs = chunkIntoPairs(MOCK_SHOPS);

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

      {/* 결과 */}
      {activeTab === '디자인' ? (
        designPairs.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Ionicons name="heart-outline" size={40} color={colors.secondary50} />
            <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 12 }]}>찜한 디자인이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={designPairs}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pt-[5px] pb-[20px]`}
            ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
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
        shopPairs.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Ionicons name="heart-outline" size={40} color={colors.secondary50} />
            <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 12 }]}>찜한 샵이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={shopPairs}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pt-[5px] pb-[20px]`}
            ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
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
