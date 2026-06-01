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

export interface DesignDetail extends Design {
  duration: number;
  tags: string[];
  snailPosts: SnailPost[];
  relatedDesigns: Design[];
}
