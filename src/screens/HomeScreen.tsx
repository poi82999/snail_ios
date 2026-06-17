import React, { useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { useDesigns, useLikeToggle } from '../hooks/useHome';
import { FILTER_CHIPS } from '../api/mockData';
import { Design, FilterId, HomeTab, RootStackParamList } from '../types';
import FilterChip from '../components/FilterChip';
import HomeTabSelector from '../components/HomeTabSelector';
import DesignCard from '../components/DesignCard';
import FilterModal from '../components/FilterModal';
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
  const [activeFilters, setActiveFilters] = useState<FilterId[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterSection, setFilterSection] = useState<string | undefined>();

  const { data: designs, isLoading, isError, refetch } = useDesigns(activeTab, activeFilters);
  const { mutate: toggleLike } = useLikeToggle();

  function handleFilterToggle(id: FilterId) {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  const cardPairs: Array<[Design, Design | undefined]> = [];
  if (designs) {
    for (let i = 0; i < designs.length; i += 2) {
      cardPairs.push([designs[i], designs[i + 1]]);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-[16px] py-[12px]`}>
        <View style={tw`w-[80px] h-[28px] bg-[#1A1A1A] rounded-[4px]`} />
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="heart" size={35} color={colors.secondary} />
        </TouchableOpacity>
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
          contentContainerStyle={tw`px-[16px] gap-y-[20px] pb-[20px]`}
        >
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={tw`flex-row gap-x-[10px]`}>
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
      ) : !designs || designs.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={cardPairs}
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-[20px]`}
          ItemSeparatorComponent={() => <View style={tw`h-[8px]`} />}
          renderItem={({ item: [left, right] }) => (
            <View style={tw`flex-row gap-x-[8px]`}>
              <DesignCard
                design={left}
                onLike={(id, liked) => toggleLike({ designId: id, isLiked: liked })}
              />
              {right ? (
                <DesignCard
                  design={right}
                  onLike={(id, liked) => toggleLike({ designId: id, isLiked: liked })}
                />
              ) : (
                <View style={tw`flex-1`} />
              )}
            </View>
          )}
        />
      )}
      <FilterModal visible={showFilterModal} onClose={() => setShowFilterModal(false)} initialSection={filterSection} />
    </SafeAreaView>
  );
}
