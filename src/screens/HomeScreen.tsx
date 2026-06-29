import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { useLikeToggle } from '../hooks/useHome';
import { useNotifications } from '../hooks/useNotifications';
import { useInfiniteDesigns } from '../hooks/useInfiniteDesigns';
import { FILTER_CHIPS } from '../api/filterChips';
import { FilterId, HomeTab, RootStackParamList, SearchFilters } from '../types';
import { chunkIntoPairs } from '../utils/array';
import FilterChip from '../components/FilterChip';
import HomeTabSelector from '../components/HomeTabSelector';
import DesignCard from '../components/DesignCard';
import FilterModal from '../components/FilterModal';
import Logo from '../components/Logo';
import { colors } from '../theme/tokens';

function SkeletonCard() {
  return (
    <View style={tw`flex-1`}>
      <View style={tw`w-full h-[246px] bg-[#D9D9D9]`} />
      <View style={tw`mt-[11px] gap-y-[6px]`}>
        <View style={tw`h-[12px] w-[80px] bg-[#D9D9D9] rounded-[4px]`} />
        <View style={tw`h-[18px] w-[100px] bg-[#D9D9D9] rounded-[4px]`} />
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={tw`flex-1 items-center justify-center py-[60px]`}>
      <Ionicons name="search-outline" size={48} color="#D9D9D9" />
      <Text style={tw`mt-[16px] text-[14px] text-[#6F6F6F]`}>디자인이 없어요</Text>
      <Text style={tw`mt-[4px] text-[12px] text-[#D9D9D9]`}>다른 탭을 선택해보세요</Text>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<HomeTab>('추천');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSection, setFilterSection] = useState<string | undefined>();

  const {
    designs,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteDesigns(activeTab, filters);
  const { mutate: toggleLike } = useLikeToggle();
  const { unreadCount } = useNotifications();

  // 필터 적용 후에도 전체 데이터 기준 최대가를 유지 (한번 본 최대값은 줄어들지 않음)
  const [peakMaxPrice, setPeakMaxPrice] = useState<number | undefined>();
  useEffect(() => {
    if (designs.length > 0) {
      const cur = Math.max(...designs.map(d => d.price));
      setPeakMaxPrice(prev => prev === undefined ? cur : Math.max(prev, cur));
    }
  }, [designs]);

  // 칩 활성 표시는 적용된 SearchFilters 값에서 파생한다.
  function chipActive(id: FilterId): boolean {
    switch (id) {
      case 'region':
        return Boolean(filters.region);
      case 'color':
        return (filters.colors?.length ?? 0) > 0;
      case 'duration':
        return filters.durationMax !== undefined;
      case 'price':
        return filters.priceMin !== undefined || filters.priceMax !== undefined;
      case 'filter':
        return Object.values(filters).some((v) =>
          Array.isArray(v) ? v.length > 0 : v !== undefined
        );
      default:
        return false;
    }
  }

  const cardPairs = chunkIntoPairs(designs);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px]`}>
        <Logo />
        <View style={tw`flex-row items-center gap-x-[8px]`}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
            style={tw`relative`}
          >
            <Ionicons name="notifications-outline" size={28} color={colors.secondary} />
            {unreadCount > 0 && (
              <View style={tw`absolute top-0 right-0 w-[8px] h-[8px] rounded-full bg-[#E8604C]`} />
            )}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Search')}
        style={[tw`my-[12px] mx-[16px] h-[39px] rounded-[8px] flex-row items-center justify-between px-[20px]`, { backgroundColor: 'rgba(125, 105, 93, 0.1)' }]}
      >
        <Text style={tw`text-[14px] text-[#7D695D]`}>검색어를 입력하세요</Text>
        <Ionicons name="search" size={24.725} color="#7D695D" />
      </TouchableOpacity>

      {/* Tab Selector */}
      <HomeTabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Filter Chips */}
      <View style={tw`h-[44px] mt-[12px]`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`flex-row gap-x-[8px] px-[16px] pb-[12px]`}
        >
          {FILTER_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              isActive={chipActive(chip.id)}
              onPress={() => {
                if (chip.id === 'filter') {
                  setFilterSection(undefined);
                } else {
                  setFilterSection(chip.id);
                }
                setShowFilterModal(true);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-[16px] pt-[5px] gap-y-[12px] pb-[20px]`}
        >
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={tw`flex-row gap-x-[8px]`}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ))}
        </ScrollView>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-[14px] text-[#6F6F6F] mb-[12px]`}>불러오기에 실패했어요</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.7}
            style={tw`px-[20px] py-[10px] rounded-[8px] bg-[#1A1A1A]`}
          >
            <Text style={tw`text-white text-[14px]`}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : designs.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={cardPairs}
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pt-[5px] pb-[20px]`}
          ItemSeparatorComponent={() => <View style={tw`h-[12px]`} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={tw`py-[20px] items-center`}>
                <ActivityIndicator color="#7D695D" />
              </View>
            ) : null
          }
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
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialSection={filterSection}
        initialFilters={filters}
        maxPrice={peakMaxPrice}
        onApply={(applied) => {
          setFilters(applied);
          setShowFilterModal(false);
        }}
      />
    </SafeAreaView>
  );
}
