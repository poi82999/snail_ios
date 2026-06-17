import React, { useState } from 'react';
import {
  Image,
  Share,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Snap } from '../types';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import AvatarPlaceholder from './AvatarPlaceholder';
import TaggedDesignInfoCard from './TaggedDesignInfoCard';
import { useDesignDetail } from '../hooks/useDesignDetail';

interface SnailCardProps {
  snap: Snap;
  onPress: () => void;
  onLike: () => void;
  onPressTag?: (designId: string) => void;
}

function formatCount(count: number): string {
  return count.toLocaleString('ko-KR');
}

function LikeIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Path
        d="M4.41667 12.7604C4.0048 12.3513 3.67848 11.8643 3.45672 11.3278C3.23496 10.7912 3.1222 10.2159 3.125 9.63542C3.125 8.46128 3.59142 7.33524 4.42166 6.505C5.2519 5.67476 6.37795 5.20833 7.55208 5.20833C9.19792 5.20833 10.6354 6.10417 11.3958 7.4375H12.5625C12.9491 6.75943 13.5084 6.19592 14.1836 5.80435C14.8588 5.41278 15.6257 5.20712 16.4063 5.20833C17.5804 5.20833 18.7064 5.67476 19.5367 6.505C20.3669 7.33524 20.8333 8.46128 20.8333 9.63542C20.8333 10.8542 20.3125 11.9792 19.5417 12.7604L11.9792 20.3125L4.41667 12.7604ZM20.2708 13.5C21.2604 12.5 21.875 11.1458 21.875 9.63542C21.875 8.18501 21.2988 6.79402 20.2732 5.76843C19.2477 4.74284 17.8567 4.16667 16.4063 4.16667C14.5833 4.16667 12.9688 5.05208 11.9792 6.42708C11.4741 5.72552 10.809 5.1545 10.039 4.76138C9.26912 4.36827 8.41656 4.16439 7.55208 4.16667C6.10168 4.16667 4.71068 4.74284 3.68509 5.76843C2.6595 6.79402 2.08333 8.18501 2.08333 9.63542C2.08333 11.1458 2.69792 12.5 3.6875 13.5L11.9792 21.7917L20.2708 13.5Z"
        fill={filled ? colors.danger : colors.secondary}
      />
    </Svg>
  );
}

function CommentIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Path
        d="M3.125 21.4479L6.86458 17.7083H18.75C19.3025 17.7083 19.8324 17.4888 20.2231 17.0981C20.6138 16.7074 20.8333 16.1775 20.8333 15.625V6.25C20.8333 5.69747 20.6138 5.16756 20.2231 4.77686C19.8324 4.38616 19.3025 4.16667 18.75 4.16667H5.20833C4.6558 4.16667 4.1259 4.38616 3.73519 4.77686C3.34449 5.16756 3.125 5.69747 3.125 6.25V21.4479ZM3.125 22.9167H2.08333V6.25C2.08333 5.4212 2.41257 4.62634 2.99862 4.04029C3.58468 3.45424 4.37953 3.125 5.20833 3.125H18.75C19.5788 3.125 20.3737 3.45424 20.9597 4.04029C21.5458 4.62634 21.875 5.4212 21.875 6.25V15.625C21.875 16.4538 21.5458 17.2487 20.9597 17.8347C20.3737 18.4208 19.5788 18.75 18.75 18.75H7.29167L3.125 22.9167Z"
        fill={colors.secondary}
      />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Path
        d="M16.3542 7.33517L9.17709 11.5227C9.30209 11.8664 9.375 12.2414 9.375 12.6268C9.375 13.0123 9.30209 13.3873 9.17709 13.731L16.3542 17.9185C16.7646 17.4247 17.3174 17.0695 17.9372 16.9014C18.5569 16.7333 19.2134 16.7604 19.8171 16.9792C20.4209 17.1979 20.9425 17.5975 21.3107 18.1235C21.679 18.6495 21.8761 19.2764 21.875 19.9185C21.875 21.6477 20.4792 23.0435 18.75 23.0435C17.0208 23.0435 15.625 21.6477 15.625 19.9185C15.625 19.5331 15.6979 19.1581 15.8229 18.8143L8.64584 14.6268C8.23538 15.1207 7.68258 15.4758 7.06285 15.6439C6.44311 15.812 5.7866 15.7849 5.18287 15.5662C4.57913 15.3475 4.05756 14.9478 3.68928 14.4218C3.321 13.8958 3.12395 13.269 3.125 12.6268C3.12395 11.9847 3.321 11.3579 3.68928 10.8319C4.05756 10.3058 4.57913 9.90621 5.18287 9.6875C5.7866 9.46878 6.44311 9.44163 7.06285 9.60973C7.68258 9.77784 8.23538 10.133 8.64584 10.6268L15.8229 6.43934C15.6979 6.09559 15.625 5.72059 15.625 5.33517C15.625 3.606 17.0208 2.21017 18.75 2.21017C20.4792 2.21017 21.875 3.606 21.875 5.33517C21.8761 5.9773 21.679 6.60412 21.3107 7.13015C20.9425 7.65618 20.4209 8.0558 19.8171 8.27451C19.2134 8.49322 18.5569 8.52038 17.9372 8.35227C17.3174 8.18417 16.7646 7.82899 16.3542 7.33517ZM18.75 22.0018C19.9063 22.0018 20.8333 21.0748 20.8333 19.9185C20.8333 18.7623 19.9063 17.8352 18.75 17.8352C17.5938 17.8352 16.6667 18.7727 16.6667 19.9185C16.6667 21.0643 17.6042 22.0018 18.75 22.0018ZM6.25 14.7102C7.40625 14.7102 8.33334 13.7831 8.33334 12.6268C8.33334 11.4706 7.40625 10.5435 6.25 10.5435C5.09375 10.5435 4.16667 11.481 4.16667 12.6268C4.16667 13.7727 5.09375 14.7102 6.25 14.7102ZM18.75 7.4185C19.9063 7.4185 20.8333 6.49142 20.8333 5.33517C20.8333 4.17892 19.9063 3.25184 18.75 3.25184C17.5938 3.25184 16.6667 4.18934 16.6667 5.33517C16.6667 6.481 17.6042 7.4185 18.75 7.4185Z"
        fill={colors.secondary}
      />
    </Svg>
  );
}

function TagIcon() {
  return (
    <Svg width={19.698} height={19.75} viewBox="0 0 19.6982 19.7502" fill="none">
      <Path
        d="M14.1597 18.838C13.5749 19.4221 12.7822 19.7502 11.9557 19.7502C11.1292 19.7502 10.3365 19.4221 9.7517 18.838L1.09161 10.3963C0.467832 9.82447 0 8.97198 0 8.05711V3.11888C0 2.2917 0.328595 1.4984 0.913499 0.913499C1.4984 0.328595 2.2917 0 3.11888 0H8.05711C8.97198 0 9.82447 0.467832 10.3963 1.09161L18.7861 9.80368C19.3701 10.3885 19.6982 11.1812 19.6982 12.0077C19.6982 12.8342 19.3701 13.6269 18.7861 14.2117L14.1597 18.838ZM13.4216 18.0999L18.0479 13.4736C18.8588 12.6627 18.8588 11.3423 18.0479 10.5314L9.471 1.64261C9.12792 1.24755 8.6289 1.03963 8.05711 1.03963L3.08769 1.00844C1.9441 1.00844 1.03963 1.97529 1.03963 3.11888V8.05711C1.03963 8.6289 1.24755 9.12792 1.64261 9.471L10.4794 18.0999C11.2903 18.9108 12.6107 18.9108 13.4216 18.0999ZM4.67832 2.07925C5.36764 2.07925 6.02872 2.35308 6.51614 2.8405C7.00356 3.32792 7.27739 3.98901 7.27739 4.67832C7.27739 5.36764 7.00356 6.02872 6.51614 6.51614C6.02872 7.00356 5.36764 7.27739 4.67832 7.27739C3.98901 7.27739 3.32792 7.00356 2.8405 6.51614C2.35308 6.02872 2.07925 5.36764 2.07925 4.67832C2.07925 3.98901 2.35308 3.32792 2.8405 2.8405C3.32792 2.35308 3.98901 2.07925 4.67832 2.07925ZM4.67832 3.11888C4.26473 3.11888 3.86808 3.28318 3.57563 3.57563C3.28318 3.86808 3.11888 4.26473 3.11888 4.67832C3.11888 5.09191 3.28318 5.48856 3.57563 5.78101C3.86808 6.07346 4.26473 6.23776 4.67832 6.23776C5.09191 6.23776 5.48856 6.07346 5.78101 5.78101C6.07346 5.48856 6.23776 5.09191 6.23776 4.67832C6.23776 4.26473 6.07346 3.86808 5.78101 3.57563C5.48856 3.28318 5.09191 3.11888 4.67832 3.11888Z"
        fill="white"
      />
    </Svg>
  );
}

function timeAgo(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

// Figma: SnailPost (426:4307)
export default function SnailCard({ snap, onPress, onLike, onPressTag }: SnailCardProps): React.ReactElement {
  const primaryImageUri = snap.images[0];
  const [showTagInfo, setShowTagInfo] = useState(false);
  const { data: taggedDesign } = useDesignDetail(snap.taggedDesignId ?? '', {
    enabled: showTagInfo && Boolean(snap.taggedDesignId),
  });

  const handleLikePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onLike();
  };

  const handleSharePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    Share.share({ message: snap.body });
  };

  const handleTagPress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    setShowTagInfo((prev) => !prev);
  };

  const handleTagInfoPress = (): void => {
    setShowTagInfo(false);
    if (snap.taggedDesignId) onPressTag?.(snap.taggedDesignId);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={{ width: '100%' }}>
      {/* Top */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11.611, paddingHorizontal: 16, paddingVertical: 12 }}>
        {snap.author.profileImageUri ? (
          <Image
            source={{ uri: snap.author.profileImageUri }}
            style={{ width: 35.348, height: 35.348, borderRadius: 17.674 }}
            resizeMode="cover"
          />
        ) : (
          <AvatarPlaceholder />
        )}
        <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.secondary }}>
          {snap.author.nickname}
        </Text>
      </View>

      {/* PostImage */}
      <View style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.disabled }}>
        {primaryImageUri && (
          <Image source={{ uri: primaryImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        )}
        {/* Figma: PostInfo의 Tag 버튼 — 탭하면 태그된 디자인의 썸네일/샵명/가격 오버레이(Info)가 뜨고,
            그 오버레이를 다시 탭해야 디자인 상세로 이동. 오버레이 데이터는 탭한 순간에만 조회(lazy). */}
        {snap.taggedDesignId && (
          <TouchableOpacity
            onPress={handleTagPress}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              left: 22,
              bottom: 28,
              width: 45.26,
              height: 45.26,
              borderRadius: 22.63,
              backgroundColor: 'rgba(111,111,111,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TagIcon />
          </TouchableOpacity>
        )}
        {showTagInfo && taggedDesign && (
          <View style={{ position: 'absolute', right: 11.552, bottom: 11.348 }}>
            <TaggedDesignInfoCard
              thumbnailUri={taggedDesign.imageUri}
              shopName={taggedDesign.shopName}
              price={taggedDesign.price}
              onPress={handleTagInfoPress}
            />
          </View>
        )}
      </View>

      {/* Bottom */}
      <View style={{ gap: 5, paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={handleLikePress} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <LikeIcon filled={snap.likedByMe} />
            <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>
              {formatCount(snap.likeCount)}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <CommentIcon />
            <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>
              {formatCount(snap.commentCount)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSharePress} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ShareIcon />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.secondary, flexShrink: 1 }} numberOfLines={1}>
            {snap.body}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.primary10 }}>
            ...더보기
          </Text>
        </View>

        <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.primary10 }}>
          {timeAgo(snap.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
