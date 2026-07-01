import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ShopSearchResult } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface ShopSearchCardProps {
  shop: ShopSearchResult;
  onPress?: () => void;
}

export default function ShopSearchCard({ shop, onPress }: ShopSearchCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={tw`flex-1`}>
      <View style={[tw`w-full overflow-hidden`, { aspectRatio: 1 }]}>
        <Image
          source={shop.thumbnailUri ? { uri: shop.thumbnailUri } : undefined}
          style={tw`w-full h-full`}
          resizeMode="cover"
        />
      </View>
      <View style={tw`mt-[8px] gap-y-[3px]`}>
        <View style={tw`h-[19px] justify-center px-[8px]`}>
          <Text
            style={{ fontSize: 15.446, lineHeight: 16.987, fontFamily: fontFamily.regular, color: colors.primary }}
            numberOfLines={1}
          >
            {shop.name}
          </Text>
        </View>
        <View style={tw`px-[8px]`}>
          <Text style={{ fontSize: 11.033, lineHeight: 16.987, fontFamily: fontFamily.regular, color: colors.primary50 }}>
            {shop.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
