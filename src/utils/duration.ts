import type { Design, DesignDetail } from '../types';

/**
 * 다인샵의 경우 디자이너마다 소요시간이 다를 수 있음.
 * 고객에게는 가장 오래 걸리는 시간(최댓값)을 노출.
 * 백엔드에 designer.duration_minutes 필드가 없는 경우 design.duration fallback.
 */
export function getMaxDuration(design: Design | DesignDetail): number {
  const detail = design as DesignDetail;
  if (detail.designers && detail.designers.length > 0) {
    const designerDurations = detail.designers
      .map((d) => d.durationMinutes)
      .filter((d): d is number => typeof d === 'number' && d > 0);
    if (designerDurations.length > 0) {
      return Math.max(...designerDurations);
    }
  }
  return detail.duration ?? 0;
}
