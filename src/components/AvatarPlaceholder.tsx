import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface AvatarPlaceholderProps {
  size?: number;
}

// Figma 공통 기본 아바타(원 + 사람 아이콘). 프로필 이미지가 없을 때 쓰는 placeholder.
// ReviewCard, SnailCard 등 여러 곳에서 동일하게 사용 — 중복 방지를 위해 공유.
export default function AvatarPlaceholder({ size = 35.348 }: AvatarPlaceholderProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 35.3481 35.3481" fill="none">
      <Circle cx={17.6741} cy={17.6741} r={17.6741} fill={colors.secondary50} />
      <Path
        d="M17.6741 18.3241C22.2281 18.3241 25.9241 20.0511 25.9241 22.1741V24.9241H9.42407V22.1741C9.42407 20.0511 13.1201 18.3241 17.6741 18.3241ZM17.6741 8.42407C18.6952 8.42407 19.6744 8.8297 20.3964 9.55171C21.1184 10.2737 21.5241 11.253 21.5241 12.2741C21.5241 13.2952 21.1184 14.2744 20.3964 14.9964C19.6744 15.7184 18.6952 16.1241 17.6741 16.1241C16.653 16.1241 15.6737 15.7184 14.9517 14.9964C14.2297 14.2744 13.8241 13.2952 13.8241 12.2741C13.8241 11.253 14.2297 10.2737 14.9517 9.55171C15.6737 8.8297 16.653 8.42407 17.6741 8.42407Z"
        fill="white"
      />
    </Svg>
  );
}
