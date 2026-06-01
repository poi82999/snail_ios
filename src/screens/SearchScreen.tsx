import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { FilterId, Design } from '../types';
import { getMockDesigns, FILTER_CHIPS } from '../api/mockData';
import FilterChip from '../components/FilterChip';
import DesignCard from '../components/DesignCard';

type SearchTab = '디자인' | '샵' | '리뷰';

const RECENT_SEARCHES = ['봄 네일', '여름 네일', '가을 네일', '겨울 네일'];
const RECENT_SHOPS = ['유후네일 잠실점', '유후네일 홍대점', '유후네일 수락점', '유후네일 노원점'];
const POPULAR_SEARCHES = [
  '블랙 네일', '화이트 네일', '젤 네일', '프렌치 네일', '그라데이션',
  '글리터', '봄 네일', '여름 네일', '빈티지', '심플',
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('디자인');
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const isSearching = query.length > 0;
  const allDesigns = getMockDesigns('추천');

  const cardPairs: Array<[Design, Design | undefined]> = [];
  for (let i = 0; i < allDesigns.length; i += 2) {
    cardPairs.push([allDesigns[i], allDesigns[i + 1]]);
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
            <Text style={tw`font-semibold text-[14px] text-[#6F6F6F]`}>최근 검색어</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-[10px]`}>
                {RECENT_SEARCHES.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setQuery(tag)}
                    style={tw`border border-[#D9D9D9] rounded-[16px] py-[7px] px-[15px]`}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`font-medium text-[14px] text-[#6F6F6F]`}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 최근 검색한 샵 */}
          <View style={tw`px-[22px] pt-[20px] gap-[10px]`}>
            <Text style={tw`font-semibold text-[14px] text-[#6F6F6F]`}>최근 검색한 샵</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={tw`flex-row gap-[10px]`}>
                {RECENT_SHOPS.map((shop) => (
                  <TouchableOpacity
                    key={shop}
                    onPress={() => setQuery(shop)}
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
                    onPress={() => setQuery(keyword)}
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
                    onPress={() => setQuery(keyword)}
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

          {/* 결과 */}
          {activeTab === '디자인' ? (
            <FlatList
              data={cardPairs}
              keyExtractor={(_, i) => String(i)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`px-[16px] pb-[20px]`}
              ItemSeparatorComponent={() => <View style={tw`h-[20px]`} />}
              renderItem={({ item: [left, right] }) => (
                <View style={tw`flex-row gap-x-[10px]`}>
                  <DesignCard design={left} />
                  {right ? <DesignCard design={right} /> : <View style={tw`flex-1`} />}
                </View>
              )}
            />
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
