# 스네일 디자인 시스템
> 피그마 홈화면(Home Ver.1) 기반으로 추출한 토큰입니다.
> Claude Code는 이 파일의 수치를 반드시 그대로 사용하고, 임의로 바꾸지 마세요.

---

## Colors

| 이름 | 값 | 용도 |
|---|---|---|
| background | #FFFFFF | 전체 배경 |
| surface | #D9D9D9 | 검색바 배경, 태그 외곽선 |
| text-primary | #1A1A1A | 메인 텍스트 (가격 등) |
| text-secondary | #6F6F6F | 보조 텍스트 (네일샵 이름, 탭 라벨) |
| icon | #6F6F6F | 아이콘 색상 |
| tabbar-bg | #FFFFFF | 탭바 배경 |

---

## Typography

| 이름 | 폰트 | 굵기 | 크기 | 용도 |
|---|---|---|---|---|
| price | Inter | SemiBold | 18px | 가격 (00,000원) |
| shop-name | Inter | SemiBold | 12px | 네일샵 이름 |
| tab-label | Inter | Medium | 8px | 탭바 라벨 |

NativeWind:
- 가격: `font-semibold text-[18px] text-[#1A1A1A]`
- 샵이름: `font-semibold text-[12px] text-[#6F6F6F]`
- 탭라벨: `font-medium text-[8px] text-[#6F6F6F]`

---

## Spacing

| 이름 | 값 | 용도 |
|---|---|---|
| card-gap | 10px | 카드 사이 가로 간격 |
| card-row-gap | 20px | 카드 행 간격 |
| tag-gap | 10px | 태그 칩 사이 간격 |
| text-gap | 3px | 샵이름-가격 사이 간격 |
| tabbar-item-gap | 40px | 탭바 아이템 간격 |
| tabbar-px | 34px | 탭바 좌우 패딩 |
| tabbar-pt | 10px | 탭바 상단 패딩 |
| tabbar-pb | 16px | 탭바 하단 패딩 |

---

## Border Radius

| 컴포넌트 | 값 | NativeWind |
|---|---|---|
| 태그 칩 | 16px | `rounded-[16px]` |
| 검색바 | 확인 필요 | - |
| 디자인 카드 이미지 | 0px | - |

---

## Sizing

| 컴포넌트 | 너비 | 높이 |
|---|---|---|
| 검색바 | 382px | 38px |
| 태그 칩 | 72px (허그) | 32px |
| 디자인 카드 이미지 | 186px | 246px |
| 탭바 전체 | full | 85px |
| 탭바 아이콘 | 35px | 35px |

---

## 컴포넌트 NativeWind 가이드

### 태그 칩
```jsx
<View className="h-[32px] px-[8px] py-[15px] rounded-[16px] border border-[#D9D9D9] flex-row items-center justify-center">
  <Text className="text-[#6F6F6F]">봄 네일</Text>
</View>
```

### 검색바
```jsx
<View className="w-full h-[38px] bg-[#D9D9D9] flex-row items-center px-[12px]">
  <TextInput placeholder="검색" />
</View>
```

### 디자인 카드
```jsx
<View className="flex-1">
  <Image className="w-full h-[246px]" />
  <View className="mt-[11px] gap-[3px]">
    <Text className="font-semibold text-[12px] text-[#6F6F6F]">네일샵</Text>
    <Text className="font-semibold text-[18px] text-[#1A1A1A]">00,000원</Text>
  </View>
</View>
```

### 카드 그리드
```jsx
<View className="flex-row flex-wrap gap-[10px]">
  // 2열, 행간격 20px
</View>
```

### 탭바
```jsx
<View className="w-full h-[85px] bg-white flex-row items-center justify-between px-[34px] pt-[10px] pb-[16px]">
  // 아이콘 5개, gap-[40px]
</View>
```
