export type HomeTab = '추천' | '랭킹' | '이달의 아트';

export type SnapFeedType = 'latest' | 'ranking' | 'following';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  LoginPrompt: { message?: string } | undefined;
  Main: { screen?: '홈' | '스네일' | '주변' | '일정' | '프로필' } | undefined;
  Search: { initialQuery?: string } | undefined;
  DesignDetail: { designId: string };
  ShopDetail: { shopId: string };
  ShopSnails: { shopId: string };
  SnapDetail: { snapId: string };
  Booking: { designId: string };
  BookingConfirm: {
    designId: string;
    startAt: string; // 슬롯 start_at(ISO 8601, UTC) 그대로
    designerId?: string | null;
    selectedOptionIds: string[];
    userRequest?: string; // BookingScreen에서 입력한 요청사항 (trim 후 비면 undefined)
  };
  ReservationDetail: { reservationId: string };
  ReviewWrite: { reservationId: string };
  Notifications: undefined;
  Inquiry: undefined;
  Coupon: undefined;
  RelatedDesigns: { designId: string };
  ShopReviews: { shopId: string };
  ShopInquiry: { shopId: string };
  Favorites: undefined;
  NotificationSettings: undefined;
  Notice: undefined;
  Terms: undefined;
  ProfileEdit: undefined;
};

export type FilterId = 'filter' | 'region' | 'duration' | 'date' | 'price' | 'color' | 'mood';

export type DesignSort =
  | 'relevance'
  | 'popular'
  | 'latest'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'monthly'
  | 'distance';

export interface SearchFilters {
  q?: string;
  region?: string;
  colors?: string[]; // 한국어 자유 문자열 (예: '핑크') — 값은 useTaxonomy().colors에서
  moods?: string[]; // 예: '러블리' — 값은 useTaxonomy().moods에서
  priceMin?: number;
  priceMax?: number;
  durationMin?: number; // 분
  durationMax?: number; // 분
  sort?: DesignSort;
}

// GET /taxonomy — 필터 값 선택 UI가 쓰는 백엔드 통제어휘 SSOT
export interface Taxonomy {
  colors: string[];
  moods: string[];
  seasons: string[];
  regions: string[];
}

export interface FilterChipItem {
  id: FilterId;
  label: string;
}

export interface Design {
  id: string;
  shopId: string;
  shopName: string;
  location: string;
  price: number;
  likeCount: number;
  imageUri: string;
  isLiked: boolean;
  tab: HomeTab[];
}

export interface ShopSearchResult {
  id: string;
  name: string;
  location: string;
  thumbnailUri: string;
}

export interface SnapAuthor {
  id: string;
  nickname: string;
  profileImageUri: string;
  bio?: string;
}

export interface Snap {
  id: string;
  author: SnapAuthor;
  body: string;
  tags: string[];
  images: string[];
  taggedDesignId?: string | null;
  isReservationVerified: boolean;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
}

export interface SnapComment {
  id: string;
  snapId: string;
  parentId: string | null;
  authorName: string;
  body: string;
  depth: number;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
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
  durationMinutes?: number | null; // 디자이너별 소요시간 (다인샵 대응, 백엔드 미구현 시 null)
}

export interface DesignDetail extends Design {
  duration: number;
  tags: string[];
  designers: Designer[];
  options: DesignOption[];
}

export type ReservationStatus =
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled_by_user'
  | 'cancelled_by_shop'
  | 'completed'
  | 'no_show';

export interface Reservation {
  id: string;
  shopName: string;
  thumbnailUri: string;
  startAt: string; // ISO 8601 UTC
  status: ReservationStatus;
  designId: string;
}

export interface ReservationDetail {
  id: string;
  status: ReservationStatus;
  startAt: string; // ISO 8601 UTC
  endAt: string; // ISO 8601 UTC
  userRequest: string | null;
  rejectedReason: string | null;
  cancelledReason: string | null;
  shopId: string;
  shopName: string;
  shopThumbnailUri: string;
  designId: string;
  designTitle: string;
  designPrice: number;
  designDuration: number; // 분
  designThumbnailUri: string;
  designerName: string | null;
}

export interface Shop {
  id: string;
  name: string;
  thumbnailUri: string;
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  isFavorited: boolean; // 서버 favorited_by_me (스펙 미노출 시 false)
  address: string;
  todayHoursLabel: string; // "11:00 - 21:00" 또는 "휴무"
  phoneNumber: string;
}
