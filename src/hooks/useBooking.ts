import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createReservation,
  fetchAvailability,
  type AvailabilityDate,
  type AvailabilityDesignId,
  type AvailabilityOptionIds,
  type AvailabilityResponse,
  type ReservationCreatePayload,
  type ReservationResponse,
} from '../api/bookingApi';
import type { ApiError } from '../api/errors';

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

export function useCreateReservation() {
  return useMutation<ReservationResponse, ApiError, ReservationCreatePayload>({
    mutationFn: createReservation,
  });
}
