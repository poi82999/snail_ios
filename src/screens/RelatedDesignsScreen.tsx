import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useRelatedDesigns } from '../hooks/useDesignDetail';
import { useLikeToggle } from '../hooks/useHome';
import { colors, typography } from '../theme/tokens';
import DesignCard from '../components/DesignCard';
import { chunkIntoPairs } from '../utils/array';

type Props = NativeStackScreenProps<RootStackParamList, 'RelatedDesigns'>;

export default function RelatedDesignsScreen({ route, navigation }: Props) {
  const { designId } = route.params;
  const { data: designs = [], isLoading, isError, refetch } = useRelatedDesigns(designId);
  const { mutate: toggleLike } = useLikeToggle();
  const pairs = chunkIntoPairs(designs);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`mr-[12px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>연관 추천 디자인</Text>
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
      ) : designs.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={[typography.bodySm, { color: colors.secondary50 }]}>연관 디자인이 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={tw`pt-[5px] pb-[20px]`}
          ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
          showsVerticalScrollIndicator={false}
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

      )}
    </SafeAreaView>
  );
}
