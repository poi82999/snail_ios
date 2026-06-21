import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { Design } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface DesignCardProps {
  design: Design;
  onPress?: () => void;
  onLike?: (id: string, isLiked: boolean) => void;
}

// Figma: Item (242:15324)
export default function DesignCard({ design, onPress, onLike }: DesignCardProps) {
  const formattedPrice = design.price.toLocaleString('ko-KR') + '원';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={tw`flex-1`}>
      <View style={[tw`w-full overflow-hidden`, { aspectRatio: 1 }]}>
        <Image
          source={{ uri: design.imageUri }}
          style={tw`w-full h-full`}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => onLike?.(design.id, !design.isLiked)}
          activeOpacity={0.7}
          style={tw`absolute bottom-[8px] right-[8px]`}
        >
          <Ionicons
            name={design.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={design.isLiked ? '#FF6B6B' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
      <View style={tw`mt-[8px] gap-y-[3px]`}>
        <View style={tw`h-[19px] justify-center px-[8px]`}>
          <Text
            style={{ fontSize: 15.446, lineHeight: 16.987, fontFamily: fontFamily.regular, color: colors.primary }}
            numberOfLines={1}
          >
            {design.shopName}
          </Text>
        </View>
        <View style={tw`flex-row justify-between px-[8px]`}>
          <Text style={{ fontSize: 11.033, lineHeight: 16.987, fontFamily: fontFamily.regular, color: colors.primary50 }}>
            {design.location}
          </Text>
          <Text style={{ fontSize: 11.033, lineHeight: 16.987, fontFamily: fontFamily.regular, color: colors.primary50 }}>
            {formattedPrice}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
