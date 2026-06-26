import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import ReviewStar from './ReviewStar';
import AvatarPlaceholder from './AvatarPlaceholder';

interface ReviewCardProps {
  id?: string;
  username: string;
  rating: number; // 1~5
  date: string;
  comment: string;
  onReport?: () => void;
}

export default function ReviewCard({ username, rating, date, comment, onReport }: ReviewCardProps) {
  return (
    <View
      style={[
        tw`bg-white rounded-[10px] px-[20px] pt-[20px] pb-[28px] gap-y-[16px] w-full`,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          // Android elevation은 Figma의 옅은 블러와 렌더링 모델이 달라 과해 보임 — 생략
          elevation: 0,
        },
      ]}
    >
      {/* Profile */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-[11.611px]`}>
          <AvatarPlaceholder />
          <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.secondary }}>
            {username}
          </Text>
        </View>
        {onReport && (
          <TouchableOpacity onPress={onReport} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.secondary50} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rate */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-[4px]`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <ReviewStar key={i} filled={i <= rating} />
          ))}
        </View>
        <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>
          {date}
        </Text>
      </View>

      {/* Comment */}
      <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.primary }}>
        {comment}
      </Text>
    </View>
  );
}
