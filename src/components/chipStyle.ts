import type { ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

// Figma Filter_home/Filter_pop/Filter_pop_color가 공유하는 칩 컨테이너 스타일(테두리/배경/그림자).
// FilterChip, TagChip, ColorTagChip 3곳에서 동일하게 사용 — 그림자 값 등을 고칠 땐 여기 한 곳만 수정.
export function chipContainerStyle(isActive: boolean): ViewStyle {
  return {
    borderColor: isActive ? colors.secondary : 'rgba(125,105,93,0.3)',
    backgroundColor: isActive ? colors.secondary : colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: isActive ? 3.78 : 7.559,
    // Android elevation은 Figma의 옅은(opacity 0.1) 블러와 렌더링 모델이 달라 과해 보임 — 생략
    elevation: 0,
  };
}

export function chipTextColor(isActive: boolean): string {
  return isActive ? colors.background : colors.secondary;
}
