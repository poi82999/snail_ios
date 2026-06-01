import { Design, FilterChipItem, HomeTab } from '../types';

export const FILTER_CHIPS: FilterChipItem[] = [
  { id: 'filter', label: '필터' },
  { id: 'region', label: '지역' },
  { id: 'duration', label: '소요시간' },
  { id: 'date', label: '날짜' },
  { id: 'price', label: '가격' },
  { id: 'color', label: '색상' },
];

const ALL_DESIGNS: Design[] = [
  {
    id: '1',
    shopName: '온네일',
    location: '강남',
    price: 55000,
    likeCount: 342,
    imageUri: 'https://picsum.photos/id/10/400/520',
    isLiked: false,
    tab: ['추천', '랭킹'],
  },
  {
    id: '2',
    shopName: '뷰티네일',
    location: '홍대',
    price: 48000,
    likeCount: 218,
    imageUri: 'https://picsum.photos/id/20/400/520',
    isLiked: true,
    tab: ['추천', '이달의 아트'],
  },
  {
    id: '3',
    shopName: '핑크네일',
    location: '신촌',
    price: 62000,
    likeCount: 512,
    imageUri: 'https://picsum.photos/id/30/400/520',
    isLiked: false,
    tab: ['랭킹'],
  },
  {
    id: '4',
    shopName: '글로시네일',
    location: '이태원',
    price: 45000,
    likeCount: 189,
    imageUri: 'https://picsum.photos/id/40/400/520',
    isLiked: false,
    tab: ['추천', '랭킹', '이달의 아트'],
  },
  {
    id: '5',
    shopName: '러블리네일',
    location: '건대',
    price: 58000,
    likeCount: 431,
    imageUri: 'https://picsum.photos/id/50/400/520',
    isLiked: true,
    tab: ['이달의 아트'],
  },
  {
    id: '6',
    shopName: '네일아트',
    location: '합정',
    price: 52000,
    likeCount: 267,
    imageUri: 'https://picsum.photos/id/60/400/520',
    isLiked: false,
    tab: ['추천'],
  },
  {
    id: '7',
    shopName: '젤리네일',
    location: '신사',
    price: 72000,
    likeCount: 689,
    imageUri: 'https://picsum.photos/id/70/400/520',
    isLiked: false,
    tab: ['랭킹', '이달의 아트'],
  },
  {
    id: '8',
    shopName: '스타네일',
    location: '압구정',
    price: 68000,
    likeCount: 543,
    imageUri: 'https://picsum.photos/id/80/400/520',
    isLiked: true,
    tab: ['추천', '랭킹'],
  },
];

export function getMockDesigns(tab: HomeTab): Design[] {
  return ALL_DESIGNS.filter((d) => d.tab.includes(tab));
}
