import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, Design } from '../types';
import { useDesignDetail } from '../hooks/useDesignDetail';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'DesignDetail'>;
type DetailTab = '스네일' | '샵 후기' | '문의하기';

export default function DesignDetailScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: design, isLoading, isError, refetch } = useDesignDetail(designId);
  const [activeTab, setActiveTab] = useState<DetailTab>('스네일');
  const [isLiked, setIsLiked] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <ActivityIndicator color={colors.secondary} />
      </SafeAreaView>
    );
  }

  if (isError || !design) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <Text style={{ color: colors.secondary50, fontSize: 14 }}>불러오기에 실패했어요</Text>
        <TouchableOpacity onPress={() => refetch()} style={tw`mt-[12px] px-[20px] py-[10px] rounded-[8px]`} activeOpacity={0.7}>
          <Text style={{ color: colors.secondary, fontSize: 14 }}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedPrice = design.price.toLocaleString('ko-KR') + '원';

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 상단 바 */}
      <View style={tw`flex-row items-center justify-between px-[22px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={tw`flex-row items-center gap-[10px]`}>
          <TouchableOpacity onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
            <Ionicons name="home-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 스크롤 콘텐츠 */}
      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        {/* 메인 이미지 */}
        <Image
          source={{ uri: design.imageUri }}
          style={{ width: '100%', aspectRatio: 402 / 532 }}
          resizeMode="cover"
        />

        {/* 샵 정보 */}
        <View style={[tw`flex-row items-center justify-between px-[20px] py-[15px]`, { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 }]}>
          <TouchableOpacity style={tw`flex-row items-center gap-[8px]`} activeOpacity={0.7}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.secondary }}>{design.shopName}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.secondary }}>{design.location}</Text>
        </View>

        {/* 가격 & 태그 */}
        <View style={tw`px-[20px] py-[15px] gap-y-[15px]`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.secondary }}>{formattedPrice}</Text>
            <View style={tw`flex-row items-center gap-[4px]`}>
              <Ionicons name="alarm-outline" size={18} color={colors.secondary} />
              <Text style={{ fontSize: 12, color: colors.secondary }}>{design.duration}분</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-[7px]`}>
              {design.tags.map(tag => (
                <View key={tag} style={[tw`px-[10px] rounded-[12px]`, { paddingVertical: 5, backgroundColor: colors.secondary50 }]}>
                  <Text style={{ fontSize: 12, color: colors.background }}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 연관 추천 디자인 */}
        <View style={[tw`px-[20px] py-[15px] gap-y-[12px]`, { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 }]}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.secondary }}>연관 추천 디자인</Text>
            <TouchableOpacity style={tw`flex-row items-center gap-[4px]`} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, color: colors.secondary }}>전체보기</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.secondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={design.relatedDesigns}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`w-[10px]`} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.replace('DesignDetail', { designId: item.id })}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={{ width: 131, height: 164, borderRadius: 4 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 탭 */}
        <View style={tw`flex-row`}>
          {(['스네일', '샵 후기', '문의하기'] as DetailTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              style={[
                tw`flex-1 items-center py-[10px]`,
                { backgroundColor: activeTab === tab ? colors.background : 'rgba(221,221,221,0.3)' },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: activeTab === tab ? colors.secondary : colors.secondary50 }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        {activeTab === '스네일' && (
          <View style={tw`px-[20px] py-[16px]`}>
            <View style={tw`flex-row flex-wrap gap-[10px]`}>
              {(design.snailPosts ?? []).map((post) => (
                <TouchableOpacity
                  key={post.id}
                  activeOpacity={0.85}
                  style={{ width: '47.5%', aspectRatio: 176 / 221, borderRadius: 4, overflow: 'hidden' }}
                >
                  <Image
                    source={{ uri: post.imageUri }}
                    style={tw`w-full h-full`}
                    resizeMode="cover"
                  />
                  {post.totalCount > 1 && (
                    <View style={{
                      position: 'absolute', top: 8, right: 8,
                      backgroundColor: 'rgba(0,0,0,0.45)',
                      borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
                    }}>
                      <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500' }}>
                        1/{post.totalCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {activeTab === '샵 후기' && (
          <View style={tw`items-center justify-center py-[60px]`}>
            <Text style={{ fontSize: 14, color: colors.secondary50 }}>후기가 없어요</Text>
          </View>
        )}
        {activeTab === '문의하기' && (
          <View style={tw`items-center justify-center py-[60px]`}>
            <Text style={{ fontSize: 14, color: colors.secondary50 }}>준비 중</Text>
          </View>
        )}

        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <View style={[tw`flex-row items-center px-[20px] h-[70px] gap-[12px]`, { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 3 }]}>
        <TouchableOpacity
          onPress={() => setIsLiked(v => !v)}
          activeOpacity={0.7}
          style={tw`items-center gap-y-[2px]`}
        >
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={28} color={isLiked ? '#FF6B6B' : colors.secondary} />
          <Text style={{ fontSize: 8, color: colors.secondary }}>{(design.likeCount + (isLiked ? 1 : 0)).toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
          <Ionicons name="share-social-outline" size={28} color={colors.secondary} />
          <Text style={{ fontSize: 8, color: colors.secondary }}>999+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Booking', { designId })}
          style={[tw`flex-1 h-[42px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.background }}>예약하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
