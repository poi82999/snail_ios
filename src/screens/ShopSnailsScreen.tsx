import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList, Snap } from '../types';
import { useShopSnails } from '../hooks/useSnail';
import { colors } from '../theme/tokens';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';
import EmptyState from '../components/state/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopSnails'>;

function SnapThumb({ snap, onPress }: { snap: Snap; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={tw`flex-1 aspect-square overflow-hidden`}>
      <Image source={{ uri: snap.images[0] }} style={tw`w-full h-full`} resizeMode="cover" />
      {snap.images.length > 1 && (
        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500' }}>1/{snap.images.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// 샵 디자인에 태깅된 스네일 모아보기 — tagged_shop_id로 필터
export default function ShopSnailsScreen({ route, navigation }: Props) {
  const { shopId } = route.params;
  const { snaps, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useShopSnails(shopId);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`h-[54px] justify-center px-[22px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : snaps.length === 0 ? (
        <EmptyState title="아직 등록된 스네일이 없어요" />
      ) : (
        <FlatList
          data={snaps}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={tw`gap-x-[2px]`}
          contentContainerStyle={tw`gap-y-[2px]`}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={tw`py-[20px] items-center`}>
                <ActivityIndicator color={colors.secondary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <SnapThumb snap={item} onPress={() => navigation.navigate('SnapDetail', { snapId: item.id })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
