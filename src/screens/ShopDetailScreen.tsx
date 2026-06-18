import React from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useShopDesigns, useShopDetail } from '../hooks/useShop';
import { useLikeToggle } from '../hooks/useHome';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import DesignCard from '../components/DesignCard';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import { chunkIntoPairs } from '../utils/array';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopDetail'>;

// Figma: Shop Detail (418:3621)
export default function ShopDetailScreen({ route, navigation }: Props) {
  const { shopId } = route.params;
  const { data: shop, isLoading, isError, refetch } = useShopDetail(shopId);
  const { data: designs = [], isLoading: isDesignsLoading } = useShopDesigns(shopId);
  const { mutate: toggleLike } = useLikeToggle();
  const designPairs = chunkIntoPairs(designs);

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <ActivityIndicator color={colors.secondary} />
      </SafeAreaView>
    );
  }

  if (isError || !shop) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <Text style={[typography.bodySm, { color: colors.secondary50, marginBottom: 12 }]}>
          불러오기에 실패했어요
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.7}
          style={[tw`px-[20px] h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
        >
          <Text style={[typography.bodySm, { color: colors.background }]}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Top Bar */}
      <View style={{ height: 54, paddingLeft: 22.313, paddingRight: 36, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text
          style={[typography.headingMd, { color: colors.secondary, flex: 1, textAlign: 'center' }]}
          numberOfLines={1}
        >
          {shop.name}
        </Text>
      </View>

      <FlatList
        data={designPairs}
        keyExtractor={(_, index) => String(index)}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
        ListHeaderComponent={
          <View>
            {/* 대표 이미지 */}
            <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#f6f7f8' }}>
              {shop.thumbnailUri ? (
                <Image source={{ uri: shop.thumbnailUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : null}
            </View>

            <View style={{ paddingVertical: 20, gap: 20 }}>
              {/* 샵 기본 정보 */}
              <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  {shop.thumbnailUri ? (
                    <Image source={{ uri: shop.thumbnailUri }} style={{ width: 51, height: 51, borderRadius: 25.5 }} resizeMode="cover" />
                  ) : (
                    <AvatarPlaceholder />
                  )}
                  <View style={{ gap: 5 }}>
                    <Text style={[typography.headingMd, { color: colors.secondary }]}>{shop.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="star" size={16} color={colors.secondary} />
                        <Text style={[typography.bodySm, { color: colors.secondary }]}>{shop.rating.toFixed(1)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[typography.bodySm, { color: colors.secondary }]}>리뷰 {shop.reviewCount}개</Text>
                        <Ionicons name="chevron-forward" size={10} color={colors.secondary} />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: 32 }}>
                  <Ionicons name="heart-outline" size={35} color={colors.secondary} />
                  <Text style={{ fontSize: 8, fontFamily: fontFamily.medium, color: colors.secondary, marginTop: 3 }}>
                    {shop.favoriteCount}
                  </Text>
                </View>
              </View>

              {/* 위치/영업시간/전화 */}
              <View style={{ paddingHorizontal: 20, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location-outline" size={24} color={colors.secondary} />
                  <Text style={[typography.bodySm, { color: colors.secondary }]}>{shop.address}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="time-outline" size={24} color={colors.secondary} />
                  <Text style={[typography.bodySm, { color: colors.secondary }]}>{shop.todayHoursLabel}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${shop.phoneNumber}`)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Ionicons name="call-outline" size={24} color={colors.secondary} />
                  <Text style={[typography.bodySm, { color: colors.secondary }]}>{shop.phoneNumber}</Text>
                </TouchableOpacity>
              </View>

              {/* 문의하기 */}
              <View style={{ paddingHorizontal: 20 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ height: 35, borderRadius: 5, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={[typography.caption, { color: colors.background }]}>문의하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          isDesignsLoading ? (
            <View style={tw`py-[20px] items-center`}>
              <ActivityIndicator color={colors.secondary} />
            </View>
          ) : null
        }
        renderItem={({ item: [left, right] }) => (
          <View style={tw`flex-row gap-x-[8px] px-[0px]`}>
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
    </SafeAreaView>
  );
}
