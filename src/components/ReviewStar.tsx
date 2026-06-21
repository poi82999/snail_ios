import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ReviewStarProps {
  filled: boolean;
}

const STAR_COLOR = '#D9C482';

// Figma: ReviewRate (554:7188) — RateTrue(채워진 별)/RateFalse(빈 별, stroke만)
export default function ReviewStar({ filled }: ReviewStarProps) {
  return (
    <Svg width={18.08} height={17.2} viewBox="0 0 18.08 17.2" fill="none">
      {filled ? (
        <Path
          d="M14.63 17.2L9.04 13.84L3.46 17.2L4.92 10.85L0 6.57L6.49 6L9.04 0L11.59 6L18.08 6.57L13.16 10.84L14.63 17.2Z"
          fill={STAR_COLOR}
        />
      ) : (
        <Path
          d="M11.1299 6.19531L11.2471 6.47168L11.5459 6.49805L16.8613 6.96484L12.832 10.4619L12.6055 10.6592L12.6729 10.9521L13.877 16.1631L9.29785 13.4111L9.04004 13.2568L8.78223 13.4121L4.21094 16.1631L5.40723 10.9619L5.47461 10.6699L5.24805 10.4727L1.21582 6.96484L6.53418 6.49805L6.83301 6.47168L6.9502 6.19531L9.04004 1.27734L11.1299 6.19531Z"
          stroke={STAR_COLOR}
        />
      )}
    </Svg>
  );
}
