export type HomeTab = '추천' | '랭킹' | '이달의 아트';

export type RootStackParamList = {
  Main: undefined;
  Search: { initialQuery?: string } | undefined;
};

export type FilterId = 'filter' | 'region' | 'duration' | 'date' | 'price' | 'color';

export interface FilterChipItem {
  id: FilterId;
  label: string;
}

export interface Design {
  id: string;
  shopName: string;
  location: string;
  price: number;
  likeCount: number;
  imageUri: string;
  isLiked: boolean;
  tab: HomeTab[];
}
