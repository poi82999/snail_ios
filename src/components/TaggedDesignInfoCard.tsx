import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontFamily } from '../theme/fonts';

interface TaggedDesignInfoCardProps {
  thumbnailUri: string;
  shopName: string;
  price: number;
  onPress: () => void;
}

function ChevronIcon() {
  return (
    <Svg width={8.948} height={17.332} viewBox="0 0 8.948 17.332" fill="none">
      <Path
        d="M1 1L7.948 8.666L1 16.332"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Figma: PostInfo > Info (572:5953) — 스네일 피드에서 태그 아이콘을 탭했을 때 뜨는
// 태그된 디자인의 썸네일/샵명/가격 오버레이. 위치는 SnailCard의 PostImage 안에서 부모가 absolute로 배치.
export default function TaggedDesignInfoCard({
  thumbnailUri,
  shopName,
  price,
  onPress,
}: TaggedDesignInfoCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 10,
        paddingRight: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(64,64,64,0.2)',
      }}
    >
      <View
        style={{
          width: 59,
          height: 59,
          borderRadius: 10,
          backgroundColor: '#f6f7f8',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 7.559,
          elevation: 3,
        }}
      >
        <Image source={{ uri: thumbnailUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: 'white' }}>
            {shopName}
          </Text>
          <Text style={{ fontSize: 20, lineHeight: 28, fontFamily: fontFamily.bold, color: 'white' }}>
            {price.toLocaleString('ko-KR')}원
          </Text>
        </View>
        <ChevronIcon />
      </View>
    </TouchableOpacity>
  );
}
