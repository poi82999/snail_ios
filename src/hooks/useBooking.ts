import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createReservation,
  fetchAvailability,
  filterSlotsByDesigner,
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

export function useDisplaySlots(
  designId: AvailabilityDesignId,
  date?: AvailabilityDate | null,
  optionIds?: AvailabilityOptionIds,
  designerId?: string | null
) {
  const availabilityQuery = useAvailability(designId, date, optionIds);
  const displaySlots = useMemo<DisplaySlot[]>(() => {
    const slots = toDisplaySlots(availabilityQuery.data ?? []);

    return filterSlotsByDesigner(slots, designerId);
  }, [availabilityQuery.data, designerId]);

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
