import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createReservation,
  fetchAvailability,
  toDisplaySlots,
  type AvailabilityDate,
  type AvailabilityDesignId,
  type AvailabilityOptionIds,
  type AvailabilityResponse,
  type DisplaySlot,
  type ReservationCreatePayload,
  type ReservationResponse,
} from '../api/bookingApi';
import type { ApiError } from '../api/errors';

export { buildReservationPayload } from '../api/bookingApi';

export function useAvailability(
  designId: AvailabilityDesignId,
  date?: AvailabilityDate | null,
  optionIds?: AvailabilityOptionIds
) {
  return useQuery<AvailabilityResponse, ApiError>({
    queryKey: ['availability', designId, date, optionIds],
    queryFn: () => fetchAvailability(designId, date!, optionIds),
    enabled: Boolean(date),
  });
}

// 디자이너로 필터링해서 일부 슬롯을 빼지 않고 그날 전체 슬롯을 그대로 반환한다.
// 디자이너별 가능 여부는 슬롯 자체의 availableDesignerIds로 호출 쪽(ReserveTimeBar)에서 판단 —
// 그래야 "이 디자이너는 이 시간에 안 됨"을 빈 시간이 아니라 예약된 시간으로 그릴 수 있다.
export function useDisplaySlots(
  designId: AvailabilityDesignId,
  date?: AvailabilityDate | null,
  optionIds?: AvailabilityOptionIds
) {
  const availabilityQuery = useAvailability(designId, date, optionIds);
  const displaySlots = useMemo<DisplaySlot[]>(
    () => toDisplaySlots(availabilityQuery.data ?? []),
    [availabilityQuery.data]
  );

  return {
    ...availabilityQuery,
    data: displaySlots,
    displaySlots,
  };
}

export function useCreateReservation() {
  return useMutation<ReservationResponse, ApiError, ReservationCreatePayload>({
    mutationFn: createReservation,
  });
}
