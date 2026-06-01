export type HomeTab = '추천' | '랭킹' | '이달의 아트';

export type RootStackParamList = {
  Main: undefined;
  Search: { initialQuery?: string } | undefined;
  DesignDetail: { designId: string };
  Booking: { designId: string };
  BookingDate: { designId: string; removalOptionId: string; extensionOptionId: string };
  BookingTime: { designId: string; removalOptionId: string; extensionOptionId: string; selectedDate: string };
  BookingConfirm: undefined;
};

export type FilterId = 'filter' | 'region' | 'duration' | 'date' | 'price' | 'color';

export type DesignSort =
  | 'relevance'
  | 'popular'
  | 'latest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'distance';

export interface SearchFilters {
  q?: string;
  region?: string;
  colors?: string[]; // 한국어 자유 문자열 (예: '핑크')
  moods?: string[]; // 예: '러블리'
  priceMin?: number;
  priceMax?: number;
  durationMax?: number; // 분
  sort?: DesignSort;
}

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

export interface SnailPost {
  id: string;
  imageUri: string;
  totalCount: number; // 해당 스네일 포스트의 총 이미지 수
}

export type DesignOptionKind = 'extend' | 'removal' | 'care';

export interface DesignOption {
  id: string; // UUID — 예약 시 selected_option_ids에 그대로 사용
  kind: DesignOptionKind;
  name: string;
  priceDelta: number;
  durationDelta: number; // 분
}

export interface Designer {
  id: string;
  name: string;
  position: string; // 직책/한줄소개 (없으면 '')
  profileImageUri: string; // 없으면 ''
  specialtyTags: string[];
}

export interface DesignDetail extends Design {
  duration: number;
  tags: string[];
  designers: Designer[];
  options: DesignOption[];
  snailPosts: SnailPost[];
  relatedDesigns: Design[];
}
