import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { FilterId, RootStackParamList, SearchFilters } from '../types';
import { chunkIntoPairs } from '../utils/array';
import { FILTER_CHIPS } from '../api/filterChips';
import { useSearch, useSearchShops } from '../hooks/useSearch';
import { useGuardedLikeToggle } from '../hooks/useHome';
import { useRecentSearches } from '../hooks/useRecentSearches';
import FilterChip from '../components/FilterChip';
import FilterModal from '../components/FilterModal';
import DesignCard from '../components/DesignCard';
import ShopSearchCard from '../components/ShopSearchCard';
import { fontFamily } from '../theme/fonts';
import { colors } from '../theme/tokens';

type SearchTab = '디자인' | '샵' | '리뷰';

// 인기 검색어/최근 검색한 샵은 아직 백엔드 엔드포인트가 없어 임시 하드코딩을 유지한다.
const RECENT_SHOPS = ['유후네일 잠실점', '유후네일 홍대점', '유후네일 수락점', '유후네일 노원점'];
const POPULAR_SEARCHES = [
  '블랙 네일', '화이트 네일', '젤 네일', '프렌치 네일', '그라데이션',
  '글리터', '봄 네일', '여름 네일', '빈티지', '심플',
];

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('디자인');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSection, setFilterSection] = useState<string | undefined>();
  const inputRef = useRef<TextInput>(null);

  function chipActive(id: FilterId): boolean {
    switch (id) {
      case 'region': return Boolean(filters.region);
      case 'color': return (filters.colors?.length ?? 0) > 0;
      case 'duration': return filters.durationMax !== undefined;
      case 'price': return filters.priceMin !== undefined || filters.priceMax !== undefined;
      case 'mood': return (filters.moods?.length ?? 0) > 0;
      case 'filter': return Object.keys(filters).some((k) => k !== 'q' && (filters as Record<string, unknown>)[k] !== undefined);
      default: return false;
    }
  }
  const { recent, add, remove, clear } = useRecentSearches();
  const { toggleLike } = useGuardedLikeToggle();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // 키 입력(한글 조합 포함)마다 검색 요청이 터지지 않도록 300ms 디바운스.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = query.length > 0;

  const handleSubmitSearch = (): void => {
    const q = query.trim();
    if (!q) {
      return;
    }

    add(q);
    setQuery(q);
    setDebouncedQuery(q); // 명시적 제출은 디바운스 대기 없이 즉시 검색
  };

  const handleSelectTerm = (term: string): void => {
    const q = term.trim();
    if (!q) {
      return;
    }

    add(q);
    setQuery(q);
    setDebouncedQuery(q); // 항목 탭도 즉시 검색
  };

  const searchFilters: SearchFilters = { ...filters, q: debouncedQuery };

  const {
    data: designResults,
    isLoading: isDesignLoading,
    isError: isDesignError,
    refetch: refetchDesigns,
  } = useSearch(searchFilters);

  const {
    data: shopResults,
    isLoading: isShopLoading,
    isError: isShopError,
    refetch: refetchShops,
  } = useSearchShops(searchFilters);

  const resultDesigns = designResults?.designs ?? [];
  const resultShops = shopResults?.shops ?? [];
  const cardPairs = chunkIntoPairs(resultDesigns);
  const shopPairs = chunkIntoPairs(resultShops);

  const [peakMaxPrice, setPeakMaxPrice] = useState<number | undefined>();
  useEffect(() => {
    if (resultDesigns.length > 0) {
      const cur = Math.max(...resultDesigns.map(d => d.price));
      setPeakMaxPrice(prev => prev === undefined ? cur : Math.max(prev, cur));
    }
  }, [resultDesigns]);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Top Bar */}
      <View style={tw`flex-row items-center h-[54px] mt-[12px] px-[29px] bg-white gap-[12px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <View style={[tw`flex-1 h-[39px] rounded-[8px] flex-row items-center justify-between px-[20px]`, { backgroundColor: 'rgba(125, 105, 93, 0.1)' }]}>
          <TextInput
            ref={inputRef}
            style={tw`flex-1 text-[14px] text-[#7D695D]`}
            placeholder="검색어를 입력하세요"
            placeholderTextColor="#7D695D"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSubmitSearch}
          />
          <Ionicons name="search" size={18} color="#7D695D" />
        </View>
      </View>

      {!isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 최근 검색어 */}
          <View style={tw`px-[22px] pt-[14px] gap-[10px]`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={[tw`text-[14px]`, { color: colors.secondary, fontFamily: fontFamily.semibold }]}>최근 검색어</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={clear} activeOpacity={0.7}>
                  <Text style={[tw`text-[12px]`, { color: colors.secondary50, fontFamily: fontFamily.medium }]}>전체 삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {recent.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row gap-[10px]`}>
                  {recent.map((tag) => (
                    <View
                      key={tag}
                      style={[tw`rounded-[16px] flex-row items-center overflow-hidden`, { borderWidth: 1, borderColor: colors.line }]}
                    >
                      <TouchableOpacity
                        onPress={() => handleSelectTerm(tag)}
                        style={tw`py-[7px] pl-[15px] pr-[6px]`}
                        activeOpacity={0.7}
                      >
                        <Text style={[tw`text-[14px]`, { color: colors.secondary, fontFamily: fontFamily.medium }]}>{tag}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => remove(tag)}
                        style={tw`py-[7px] pl-[4px] pr-[10px]`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={14} color={colors.secondary50} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>최근 검색어가 없어요</Text>
            )}
          </View>

          {/* 최근 검색한 샵 */}
          <View style={tw`px-[22px] pt-[20px] gap-[10px]`}>
            <Text style={[tw`text-[14px]`, { color: colors.secondary, fontFamily: fontFamily.semibold }]}>최근 검색한 샵</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-[10px]`}>
                {RECENT_SHOPS.map((shop) => (
                  <TouchableOpacity
                    key={shop}
                    onPress={() => handleSelectTerm(shop)}
                    style={[tw`rounded-[16px] py-[7px] px-[15px]`, { borderWidth: 1, borderColor: colors.line }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[tw`text-[14px]`, { color: colors.secondary, fontFamily: fontFamily.medium }]}>{shop}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 인기 검색어 */}
          <View style={tw`px-[22px] pt-[20px] pb-[30px] gap-[12px]`}>
            <Text style={[tw`text-[14px]`, { color: colors.secondary, fontFamily: fontFamily.bold }]}>인기 검색어</Text>
            <View style={tw`flex-row`}>
              <View style={tw`flex-1 gap-y-[15px]`}>
                {POPULAR_SEARCHES.slice(0, 5).map((keyword, i) => (
                  <TouchableOpacity
                    key={keyword}
                    onPress={() => handleSelectTerm(keyword)}
                    style={tw`flex-row items-center gap-[17px]`}
                    activeOpacity={0.7}
                  >
                    <Text style={[tw`text-[14px] w-[22px]`, { color: colors.secondary, fontFamily: fontFamily.bold }]}>{i + 1}.</Text>
                    <Text style={[tw`text-[14px] flex-1`, { color: colors.secondary, fontFamily: fontFamily.medium }]}>{keyword}</Text>
                    <Ionicons name="caret-up" size={10} color={colors.secondary50} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={tw`flex-1 gap-y-[15px]`}>
                {POPULAR_SEARCHES.slice(5, 10).map((keyword, i) => (
                  <TouchableOpacity
                    key={keyword}
                    onPress={() => handleSelectTerm(keyword)}
                    style={tw`flex-row items-center gap-[17px]`}
                    activeOpacity={0.7}
                  >
                    <Text style={[tw`text-[14px] w-[22px]`, { color: colors.secondary, fontFamily: fontFamily.bold }]}>{i + 6}.</Text>
                    <Text style={[tw`text-[14px] flex-1`, { color: colors.secondary, fontFamily: fontFamily.medium }]}>{keyword}</Text>
                    <Ionicons name="caret-up" size={10} color={colors.secondary50} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* 검색 탭 — HomeTabSelector와 동일한 스타일 */}
          <View style={tw`flex-row items-start justify-center bg-white py-[8px]`}>
            {(['디자인', '샵', '리뷰'] as SearchTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                  style={[tw`flex-1 items-center`, isActive && { gap: 10 }]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: fontFamily.semibold,
                      color: isActive ? colors.secondary : colors.secondary50,
                    }}
                  >
                    {tab}
                  </Text>
                  {isActive && <View style={{ height: 1, width: '100%', backgroundColor: colors.secondary }} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 필터 칩 — HomeScreen과 동일 */}
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
                    setFilterSection(chip.id === 'filter' ? undefined : chip.id);
                    setShowFilterModal(true);
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* 결과 */}
          {activeTab === '디자인' ? (
            isDesignLoading ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <ActivityIndicator color="#7D695D" />
              </View>
            ) : isDesignError ? (
              <View style={tw`flex-1 items-center justify-center gap-[12px]`}>
                <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>검색 중 문제가 발생했어요.</Text>
                <TouchableOpacity
                  onPress={() => refetchDesigns()}
                  style={[tw`rounded-[16px] py-[7px] px-[20px]`, { borderWidth: 1, borderColor: colors.line }]}
                  activeOpacity={0.7}
                >
                  <Text style={[tw`text-[14px]`, { color: colors.secondary }]}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : resultDesigns.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>검색 결과가 없어요</Text>
              </View>
            ) : (
              <FlatList
                data={cardPairs}
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
          ) : activeTab === '샵' ? (
            isShopLoading ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <ActivityIndicator color="#7D695D" />
              </View>
            ) : isShopError ? (
              <View style={tw`flex-1 items-center justify-center gap-[12px]`}>
                <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>검색 중 문제가 발생했어요.</Text>
                <TouchableOpacity
                  onPress={() => refetchShops()}
                  style={[tw`rounded-[16px] py-[7px] px-[20px]`, { borderWidth: 1, borderColor: colors.line }]}
                  activeOpacity={0.7}
                >
                  <Text style={[tw`text-[14px]`, { color: colors.secondary }]}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : resultShops.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>검색 결과가 없어요</Text>
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
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <Text style={[tw`text-[14px]`, { color: colors.secondary50 }]}>준비 중</Text>
            </View>
          )}
        </>
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
