import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface FollowButtonProps {
  following: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function PlusIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path
        d="M3.43738 7.8125V7.1875H7.18738V3.4375H7.81238V7.1875H11.5624V7.8125H7.81238V11.5625H7.18738V7.8125H3.43738Z"
        fill={colors.secondary}
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path
        d="M12.1406 4.6281L5.95313 10.8156L2.85938 7.72185L3.30313 7.2781L5.95313 9.93435L11.6969 4.18435L12.1406 4.6281Z"
        fill={colors.secondary}
      />
    </Svg>
  );
}

// Figma: Follow (426:7462) — Follow(+팔로우)/Following(✓팔로잉). 배경/텍스트 색은 상태와 무관하게 고정.
export default function FollowButton({ following, onPress, disabled }: FollowButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        height: 24.769,
        paddingHorizontal: 7.74,
        borderRadius: 12.385,
        borderWidth: 0.774,
        borderColor: colors.secondary50,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {following ? <CheckIcon /> : <PlusIcon />}
      <Text style={{ fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular, color: colors.secondary }}>
        {following ? '팔로잉' : '팔로우'}
      </Text>
    </TouchableOpacity>
  );
}
