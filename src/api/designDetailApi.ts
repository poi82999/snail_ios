import { DesignDetail, SnailPost } from '../types';

// TODO: API 연결 시 아래 함수를 교체하세요
// import axios from 'axios';
// const BASE_URL = 'https://api.snail.com/v1';
// export async function fetchDesignDetail(id: string): Promise<DesignDetail> {
//   const { data } = await axios.get(`${BASE_URL}/designs/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return data;
// }

const MOCK_DETAILS: Record<string, DesignDetail> = {
  '1': {
    id: '1', shopName: '온네일', location: '강남', price: 55000,
    likeCount: 342, isLiked: false, tab: ['추천', '랭킹'],
    imageUri: 'https://picsum.photos/id/10/400/520',
    duration: 60,
    tags: ['봄 네일', '여름 네일', '심플', '화이트'],
    snailPosts: [
      { id: 's1', imageUri: 'https://picsum.photos/id/11/400/440', totalCount: 5 },
      { id: 's2', imageUri: 'https://picsum.photos/id/12/400/440', totalCount: 2 },
      { id: 's3', imageUri: 'https://picsum.photos/id/13/400/440', totalCount: 8 },
      { id: 's4', imageUri: 'https://picsum.photos/id/14/400/440', totalCount: 3 },
      { id: 's5', imageUri: 'https://picsum.photos/id/15/400/440', totalCount: 6 },
      { id: 's6', imageUri: 'https://picsum.photos/id/16/400/440', totalCount: 1 },
    ],
    relatedDesigns: [
      { id: '2', shopName: '뷰티네일', location: '홍대', price: 48000, likeCount: 218, isLiked: true, imageUri: 'https://picsum.photos/id/20/400/520', tab: ['추천'] },
      { id: '3', shopName: '핑크네일', location: '신촌', price: 62000, likeCount: 512, isLiked: false, imageUri: 'https://picsum.photos/id/30/400/520', tab: ['랭킹'] },
      { id: '4', shopName: '글로시네일', location: '이태원', price: 45000, likeCount: 189, isLiked: false, imageUri: 'https://picsum.photos/id/40/400/520', tab: ['추천'] },
    ],
  },
  '2': {
    id: '2', shopName: '뷰티네일', location: '홍대', price: 48000,
    likeCount: 218, isLiked: true, tab: ['추천', '이달의 아트'],
    imageUri: 'https://picsum.photos/id/20/400/520',
    duration: 90,
    tags: ['가을 네일', '겨울 네일', '우아', '베이지'],
    snailPosts: [
      { id: 's1', imageUri: 'https://picsum.photos/id/21/400/440', totalCount: 3 },
      { id: 's2', imageUri: 'https://picsum.photos/id/22/400/440', totalCount: 7 },
      { id: 's3', imageUri: 'https://picsum.photos/id/23/400/440', totalCount: 4 },
      { id: 's4', imageUri: 'https://picsum.photos/id/24/400/440', totalCount: 2 },
    ],
    relatedDesigns: [
      { id: '1', shopName: '온네일', location: '강남', price: 55000, likeCount: 342, isLiked: false, imageUri: 'https://picsum.photos/id/10/400/520', tab: ['추천'] },
      { id: '5', shopName: '러블리네일', location: '건대', price: 58000, likeCount: 431, isLiked: true, imageUri: 'https://picsum.photos/id/50/400/520', tab: ['이달의 아트'] },
      { id: '6', shopName: '네일아트', location: '합정', price: 52000, likeCount: 267, isLiked: false, imageUri: 'https://picsum.photos/id/60/400/520', tab: ['추천'] },
    ],
  },
};

// id에 해당하는 상세 없으면 기본값 반환
function getMockDetail(id: string): DesignDetail {
  if (MOCK_DETAILS[id]) return MOCK_DETAILS[id];
  return {
    ...MOCK_DETAILS['1'],
    id,
  };
}

export async function fetchDesignDetail(id: string): Promise<DesignDetail> {
  await new Promise(r => setTimeout(r, 300));
  return getMockDetail(id);
}
