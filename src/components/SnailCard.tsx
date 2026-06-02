import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import type { Snap } from '../types';
import { colors, shadows } from '../theme/tokens';

interface SnailCardProps {
  snap: Snap;
  onPress: () => void;
  onLike: () => void;
  onSave: () => void;
}

function formatCount(count: number): string {
  return count.toLocaleString('ko-KR');
}

export default function SnailCard({
  snap,
  onPress,
  onLike,
  onSave,
}: SnailCardProps): React.ReactElement {
  const primaryImageUri = snap.images[0];
  const profileInitial = snap.author.nickname.trim().slice(0, 1) || '?';

  const handleLikePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onLike();
  };

  const handleSavePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onSave();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[tw`mx-[16px] rounded-[8px] bg-white overflow-hidden`, shadows.card]}
    >
      <View style={tw`px-[12px] py-[10px] flex-row items-center`}>
        {snap.author.profileImageUri ? (
          <Image
            source={{ uri: snap.author.profileImageUri }}
            style={tw`w-[34px] h-[34px] rounded-[17px] bg-primary10`}
            resizeMode="cover"
          />
        ) : (
          <View style={tw`w-[34px] h-[34px] rounded-[17px] bg-primary10 items-center justify-center`}>
            <Text style={tw`text-caption text-primary50`}>{profileInitial}</Text>
          </View>
        )}

        <View style={tw`ml-[8px] flex-row items-center flex-1`}>
          <Text
            style={[tw`text-body-sm text-primary`, { fontWeight: '600', flexShrink: 1 }]}
            numberOfLines={1}
          >
            {snap.author.nickname}
          </Text>
          {snap.isReservationVerified ? (
            <View style={tw`ml-[8px] h-[24px] rounded-chip px-[8px] flex-row items-center bg-primary10`}>
              <Ionicons name="checkmark-circle" size={13} color={colors.secondary} />
              <Text style={tw`ml-[3px] text-caption text-secondary`}>예약 인증</Text>
            </View>
          ) : null}
        </View>
      </View>

      {primaryImageUri ? (
        <Image
          source={{ uri: primaryImageUri }}
          style={[tw`w-full bg-primary10`, { aspectRatio: 1 }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[tw`w-full bg-primary10 items-center justify-center`, { aspectRatio: 1 }]}>
          <Ionicons name="image-outline" size={36} color={colors.primary50} />
        </View>
      )}

      <View style={tw`px-[12px] pt-[10px]`}>
        <Text style={tw`text-body-sm text-primary`} numberOfLines={2}>
          {snap.body}
        </Text>
      </View>

      {snap.tags.length > 0 ? (
        <View style={tw`px-[12px] pt-[8px] flex-row flex-wrap gap-[6px]`}>
          {snap.tags.map((tag) => (
            <View
              key={tag}
              style={[
                tw`h-[28px] rounded-chip px-[10px] items-center justify-center border`,
                { borderColor: colors.disabled },
              ]}
            >
              <Text style={tw`text-caption text-primary50`}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={tw`px-[12px] pt-[12px] pb-[12px] flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-x-[14px]`}>
          <TouchableOpacity
            onPress={handleLikePress}
            activeOpacity={0.7}
            style={tw`flex-row items-center`}
          >
            <Ionicons
              name={snap.likedByMe ? 'heart' : 'heart-outline'}
              size={20}
              color={snap.likedByMe ? colors.danger : colors.primary50}
            />
            <Text
              style={[
                tw`ml-[4px] text-caption`,
                { color: snap.likedByMe ? colors.danger : colors.primary50 },
              ]}
            >
              {formatCount(snap.likeCount)}
            </Text>
          </TouchableOpacity>

          <View style={tw`flex-row items-center`}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary50} />
            <Text style={tw`ml-[4px] text-caption text-primary50`}>
              {formatCount(snap.commentCount)}
            </Text>
          </View>

          <View style={tw`flex-row items-center`}>
            <Ionicons name="eye-outline" size={19} color={colors.primary50} />
            <Text style={tw`ml-[4px] text-caption text-primary50`}>
              {formatCount(snap.viewCount)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSavePress}
          activeOpacity={0.7}
          style={tw`flex-row items-center`}
        >
          <Ionicons
            name={snap.savedByMe ? 'bookmark' : 'bookmark-outline'}
            size={19}
            color={snap.savedByMe ? colors.secondary : colors.primary50}
          />
          <Text
            style={[
              tw`ml-[4px] text-caption`,
              { color: snap.savedByMe ? colors.secondary : colors.primary50 },
            ]}
          >
            저장
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
