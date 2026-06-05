import { useMemo } from 'react';
import { useDesignDetail } from './useDesignDetail';
import type { DesignDetail, DesignOption } from '../types';

export interface BookingSummary {
  design: DesignDetail | undefined;
  selectedOptions: DesignOption[];
  extraPrice: number;
  extraDuration: number;
  totalPrice: number;
  totalDuration: number;
}

/**
 * 예약 플로우(옵션 → 날짜 → 시간 → 확인) 4개 화면이 공유하던 요약 계산을 일원화한다.
 * useDesignDetail을 감싸 design + 선택 옵션 기준 합계(가격/소요시간)를 반환.
 */
export function useBookingSummary(designId: string, selectedOptionIds: string[]) {
  const query = useDesignDetail(designId);
  const design = query.data;
  const key = selectedOptionIds.join(',');

  const summary = useMemo<BookingSummary>(() => {
    const selectedOptions = (design?.options ?? []).filter((o) =>
      selectedOptionIds.includes(o.id)
    );
    const extraPrice = selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
    const extraDuration = selectedOptions.reduce((s, o) => s + o.durationDelta, 0);
    return {
      design,
      selectedOptions,
      extraPrice,
      extraDuration,
      totalPrice: (design?.price ?? 0) + extraPrice,
      totalDuration: (design?.duration ?? 0) + extraDuration,
    };
    // selectedOptionIds는 key로 안정 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, key]);

  return { ...query, ...summary };
}
