import { FilterChipItem } from '../types';

// 홈/검색 상단 필터 칩 정의 (UI 진입점). 실제 필터 값은 FilterModal에서 SearchFilters로 구성된다.
export const FILTER_CHIPS: FilterChipItem[] = [
  { id: 'filter', label: '필터' },
  { id: 'region', label: '지역' },
  { id: 'duration', label: '소요시간' },
  { id: 'date', label: '날짜' },
  { id: 'price', label: '가격' },
  { id: 'color', label: '색상' },
  { id: 'mood', label: '분위기' },
];
