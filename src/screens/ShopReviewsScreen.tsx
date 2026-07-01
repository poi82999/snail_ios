import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useShopReviews } from '../hooks/useReviews';
import { colors, typography } from '../theme/tokens';
import ReviewCard from '../components/ReviewCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopReviews'>;

export default function ShopReviewsScreen({ route, navigation }: Props) {
  const { shopId } = route.params;
  const { data: reviews = [], isLoading, isError, refetch } = useShopReviews(shopId);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`mr-[12px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>리뷰</Text>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center gap-y-[12px]`}>
          <Text style={[typography.bodySm, { color: colors.secondary50 }]}>불러오기에 실패했어요</Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7} style={tw`px-[20px] py-[10px]`}>
            <Text style={[typography.bodySm, { color: colors.secondary }]}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[typography.bodySm, { color: colors.secondary50 }]}>아직 리뷰가 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`pt-[8px] pb-[20px]`}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.line }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ReviewCard
              id={item.id}
              username={item.username}
              rating={item.rating}
              date={item.date}
              comment={item.comment}
              shadow={false}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
