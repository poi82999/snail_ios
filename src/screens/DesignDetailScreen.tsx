import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  FlatList, ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, Snap } from '../types';
import { useDesignDetail, useRelatedDesigns } from '../hooks/useDesignDetail';
import { useLikeToggle } from '../hooks/useHome';
import { useDesignReviews } from '../hooks/useReviews';
import { useDesignSnails } from '../hooks/useSnail';
import { colors, typography } from '../theme/tokens';
import Tag from '../components/Tag';
import SegmentedTabs from '../components/SegmentedTabs';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import { chunkIntoPairs } from '../utils/array';
import ReportModal from '../components/ReportModal';

type Props = NativeStackScreenProps<RootStackParamList, 'DesignDetail'>;
type DetailTab = '스네일' | '샵 후기' | '문의하기';

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

function SnailPostThumb({ snap, onPress }: { snap: Snap; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ width: 176, height: 176, overflow: 'hidden' }}>
      <Image source={{ uri: snap.images[0] }} style={tw`w-full h-full`} resizeMode="cover" />
      {snap.images.length > 1 && (
        <View style={{
          position: 'absolute', top: 8, right: 8,
          backgroundColor: 'rgba(0,0,0,0.45)',
          borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
        }}>
          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500' }}>1/{snap.images.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Figma: Design Detail (292:18994 / 554:7205)
export default function DesignDetailScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: design, isLoading, isError, refetch } = useDesignDetail(designId);
  const { data: relatedDesigns = [] } = useRelatedDesigns(designId);
  const { data: reviews = [] } = useDesignReviews(designId);
  const { snaps: snailPosts } = useDesignSnails(designId);
  const { mutate: toggleLike } = useLikeToggle();
  const [activeTab, setActiveTab] = useState<DetailTab>('스네일');
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const snailPostPairs = chunkIntoPairs(snailPosts);

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
        <Text style={[typography.bodySm, { color: colors.secondary50, marginBottom: 12 }]}>
          불러오기에 실패했어요
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={tw`px-[20px] py-[10px] rounded-[8px]`} activeOpacity={0.7}>
          <Text style={[typography.bodySm, { color: colors.secondary }]}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedPrice = design.price.toLocaleString('ko-KR') + '원';

  // 찜 상태: 낙관적 오버라이드가 있으면 우선, 없으면 서버값
  const liked = likedOverride ?? design.isLiked;
  const likeCount = design.likeCount + (liked === design.isLiked ? 0 : liked ? 1 : -1);
  function onHeart() {
    const next = !liked;
    setLikedOverride(next);
    toggleLike({ designId, isLiked: next });
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 상단 바 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22.313, height: 54 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
            <Ionicons name="home-outline" size={35} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={35} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={35} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 스크롤 콘텐츠 */}
      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        {/* 메인 이미지 */}
        <Image
          source={{ uri: design.imageUri }}
          style={{ width: '100%', aspectRatio: 1 }}
          resizeMode="cover"
        />

        {/* 샵 정보 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ShopDetail', { shopId: design.shopId })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[typography.bodyMd, { color: colors.secondary }]}>{design.shopName}</Text>
            <Ionicons name="chevron-forward" size={10} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={[typography.bodyMd, { color: colors.secondary }]}>{design.location}</Text>
        </View>
        <Divider />

        {/* 가격 & 태그 */}
        <View style={{ padding: 20, gap: 15 }}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={[typography.headingLg, { color: colors.secondary }]}>{formattedPrice}</Text>
            <View style={tw`flex-row items-center gap-[4px]`}>
              <Ionicons name="alarm-outline" size={20} color={colors.secondary} />
              <Text style={[typography.caption, { color: colors.secondary }]}>{design.duration}분</Text>
            </View>
          </View>
          {design.tags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-[8px]`}>
                {design.tags.map(tag => (
                  <Tag key={tag} label={tag} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
        <Divider />

        {/* 연관 추천 디자인 — useRelatedDesigns(/designs/{id}/related). 없으면 섹션 숨김 */}
        {relatedDesigns.length > 0 && (
          <View style={{ padding: 20, gap: 12 }}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={[typography.filter, { color: colors.secondary }]}>연관 추천 디자인</Text>
              <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[typography.caption, { color: colors.secondary }]}>전체보기</Text>
                <Ionicons name="chevron-forward" size={10} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={relatedDesigns}
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
                    style={{ width: 125.573, height: 125.573 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* 탭 */}
        <View style={{ gap: 24, paddingBottom: 20 }}>
          <SegmentedTabs
            tabs={['스네일', '샵 후기', '문의하기'] as DetailTab[]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* 탭 콘텐츠 */}
          {activeTab === '스네일' && (
            snailPosts.length > 0 ? (
              <View style={{ paddingHorizontal: 20, gap: 10 }}>
                {snailPostPairs.map(([left, right]) => (
                  <View key={left.id} style={tw`flex-row gap-[10px]`}>
                    <SnailPostThumb snap={left} onPress={() => navigation.navigate('SnapDetail', { snapId: left.id })} />
                    {right ? (
                      <SnailPostThumb snap={right} onPress={() => navigation.navigate('SnapDetail', { snapId: right.id })} />
                    ) : (
                      <View style={{ width: 176, height: 176 }} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={tw`items-center justify-center py-[60px]`}>
                <Text style={[typography.bodySm, { color: colors.secondary50 }]}>태그된 스네일이 없어요</Text>
              </View>
            )
          )}
          {activeTab === '샵 후기' && (
            reviews.length > 0 ? (
              <View style={{ paddingHorizontal: 20, gap: 24 }}>
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    username={review.username}
                    rating={review.rating}
                    date={review.date}
                    comment={review.comment}
                    onReport={() => setReportReviewId(review.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={tw`items-center justify-center py-[60px]`}>
                <Text style={[typography.bodySm, { color: colors.secondary50 }]}>후기가 없어요</Text>
              </View>
            )
          )}
          {activeTab === '문의하기' && (
            <View style={tw`items-center justify-center py-[60px]`}>
              <Text style={[typography.bodySm, { color: colors.secondary50 }]}>준비 중</Text>
            </View>
          )}
        </View>

        <View style={tw`h-[100px]`} />
      </ScrollView>

      {/* 하단 액션 바 */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        height: 85, paddingLeft: 21, paddingRight: 10, paddingTop: 15,
        backgroundColor: colors.background,
        shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 3,
      }}>
        <TouchableOpacity onPress={onHeart} activeOpacity={0.7} style={{ width: 38, alignItems: 'center' }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={35} color={liked ? '#FF6B6B' : colors.secondary} />
          <Text style={[typography.caption, { color: colors.secondary }]}>{likeCount.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share({ message: `${design.shopName} - ${formattedPrice}` })}
          activeOpacity={0.7}
          style={{ width: 38, alignItems: 'center' }}
        >
          <Ionicons name="share-social-outline" size={35} color={colors.secondary} />
        </TouchableOpacity>
        <Button
          label="예약하기"
          onPress={() => navigation.navigate('Booking', { designId })}
          style={{ width: 250 }}
        />
      </View>
      <ReportModal
        visible={reportReviewId !== null}
        onClose={() => setReportReviewId(null)}
        targetType="review"
        targetId={reportReviewId ?? ''}
      />
    </SafeAreaView>
  );
}
