import type { ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

// Figma Filter_home/Filter_pop/Filter_pop_color가 공유하는 칩 컨테이너 스타일(테두리/배경/그림자).
// FilterChip, TagChip, ColorTagChip 3곳에서 동일하게 사용 — 그림자 값 등을 고칠 땐 여기 한 곳만 수정.
export function chipContainerStyle(isActive: boolean): ViewStyle {
  return {
    borderColor: isActive ? colors.secondary : 'rgba(125,105,93,0.3)',
    backgroundColor: isActive ? colors.secondary : colors.background,
    shadowOpacity: 0,
    elevation: 0,
  };
}

export function chipTextColor(isActive: boolean): string {
  return isActive ? colors.background : colors.secondary;
}
