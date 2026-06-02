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
import { FilterId, Design, RootStackParamList } from '../types';
import { FILTER_CHIPS } from '../api/filterChips';
import { useSearch } from '../hooks/useSearch';
import { useLikeToggle } from '../hooks/useHome';
import { useRecentSearches } from '../hooks/useRecentSearches';
import FilterChip from '../components/FilterChip';
import DesignCard from '../components/DesignCard';

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
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([]);
  const inputRef = useRef<TextInput>(null);
  const { recent, add, remove, clear } = useRecentSearches();
  const { mutate: toggleLike } = useLikeToggle();

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

  // 실제 검색: GET /search?scope=designs (q 기준). 필터칩 값 선택 UI는 추후.
  const {
    data: results,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearch({ q: debouncedQuery });

  const resultDesigns = results?.designs ?? [];
  const cardPairs: Array<[Design, Design | undefined]> = [];
  for (let i = 0; i < resultDesigns.length; i += 2) {
    cardPairs.push([resultDesigns[i], resultDesigns[i + 1]]);
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Top Bar */}
      <View style={tw`flex-row items-center h-[54px] mt-[12px] px-[29px] bg-white gap-[12px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
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
        {isSearching && (
          <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
            <Text style={tw`text-[14px] text-[#6F6F6F]`}>취소</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 최근 검색어 */}
          <View style={tw`px-[22px] pt-[14px] gap-[10px]`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`font-semibold text-[14px] text-[#6F6F6F]`}>최근 검색어</Text>
              {recent.length > 0 && (
                <TouchableOpacity onPress={clear} activeOpacity={0.7}>
                  <Text style={tw`font-medium text-[12px] text-[#6F6F6F]`}>전체 삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {recent.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row gap-[10px]`}>
                  {recent.map((tag) => (
                    <View
                      key={tag}
                      style={tw`border border-[#D9D9D9] rounded-[16px] flex-row items-center overflow-hidden`}
                    >
                      <TouchableOpacity
                        onPress={() => handleSelectTerm(tag)}
                        style={tw`py-[7px] pl-[15px] pr-[6px]`}
                        activeOpacity={0.7}
                      >
                        <Text style={tw`font-medium text-[14px] text-[#6F6F6F]`}>{tag}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => remove(tag)}
                        style={tw`py-[7px] pl-[4px] pr-[10px]`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close" size={14} color="#6F6F6F" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={tw`text-[14px] text-[#D9D9D9]`}>최근 검색어가 없어요</Text>
            )}
          </View>

          {/* 최근 검색한 샵 */}
          <View style={tw`px-[22px] pt-[20px] gap-[10px]`}>
            <Text style={tw`font-semibold text-[14px] text-[#6F6F6F]`}>최근 검색한 샵</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-[10px]`}>
                {RECENT_SHOPS.map((shop) => (
                  <TouchableOpacity
                    key={shop}
                    onPress={() => handleSelectTerm(shop)}
                    style={tw`border border-[#D9D9D9] rounded-[16px] py-[7px] px-[15px]`}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`font-medium text-[14px] text-[#6F6F6F]`}>{shop}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 인기 검색어 */}
          <View style={tw`px-[22px] pt-[20px] pb-[30px] gap-[12px]`}>
            <Text style={tw`font-bold text-[14px] text-[#6F6F6F]`}>인기 검색어</Text>
            <View style={tw`flex-row`}>
              <View style={tw`flex-1 gap-y-[15px]`}>
                {POPULAR_SEARCHES.slice(0, 5).map((keyword, i) => (
                  <TouchableOpacity
                    key={keyword}
                    onPress={() => handleSelectTerm(keyword)}
                    style={tw`flex-row items-center gap-[17px]`}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`font-bold text-[14px] text-[#6F6F6F] w-[22px]`}>{i + 1}.</Text>
                    <Text style={tw`font-medium text-[14px] text-[#6F6F6F] flex-1`}>{keyword}</Text>
                    <Ionicons name="caret-up" size={10} color="#6F6F6F" />
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
                    <Text style={tw`font-bold text-[14px] text-[#6F6F6F] w-[22px]`}>{i + 6}.</Text>
                    <Text style={tw`font-medium text-[14px] text-[#6F6F6F] flex-1`}>{keyword}</Text>
                    <Ionicons name="caret-up" size={10} color="#6F6F6F" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* 검색 탭 */}
          <View style={tw`flex-row`}>
            {(['디자인', '샵', '리뷰'] as SearchTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={tw`flex-1 items-center py-[12px]`}
                activeOpacity={0.7}
              >
                <Text
                  style={tw`text-[14px] ${
                    activeTab === tab ? 'font-semibold text-[#1A1A1A]' : 'font-normal text-[#6F6F6F]'
                  }`}
                >
                  {tab}
                </Text>
                {activeTab === tab && (
                  <View style={tw`absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]`} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 필터 칩 */}
          <View style={tw`h-[56px]`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`flex-row gap-x-[10px] px-[16px] py-[12px]`}
          >
            {FILTER_CHIPS.map((chip) => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                isActive={activeFilters.includes(chip.id)}
                onPress={() =>
                  setActiveFilters((prev) =>
                    prev.includes(chip.id)
                      ? prev.filter((f) => f !== chip.id)
                      : [...prev, chip.id]
                  )
                }
              />
            ))}
          </ScrollView>
          </View>

          {/* 결과 */}
          {activeTab === '디자인' ? (
            isSearchLoading ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <ActivityIndicator color="#7D695D" />
              </View>
            ) : isSearchError ? (
              <View style={tw`flex-1 items-center justify-center gap-[12px]`}>
                <Text style={tw`text-[14px] text-[#6F6F6F]`}>검색 중 문제가 발생했어요.</Text>
                <TouchableOpacity
                  onPress={() => refetchSearch()}
                  style={tw`border border-[#D9D9D9] rounded-[16px] py-[7px] px-[20px]`}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-[14px] text-[#6F6F6F]`}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : resultDesigns.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`text-[14px] text-[#D9D9D9]`}>검색 결과가 없어요</Text>
              </View>
            ) : (
              <FlatList
                data={cardPairs}
                keyExtractor={(_, i) => String(i)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`px-[16px] pb-[20px]`}
                ItemSeparatorComponent={() => <View style={tw`h-[20px]`} />}
                renderItem={({ item: [left, right] }) => (
                  <View style={tw`flex-row gap-x-[10px]`}>
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
            <View style={tw`flex-1 items-center justify-center`}>
              <Text style={tw`text-[14px] text-[#D9D9D9]`}>준비 중</Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
