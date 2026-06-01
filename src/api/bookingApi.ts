import apiClient from './client';
import type { components, paths } from '../types/api';

type AvailabilityOperation =
  paths['/api/v1/designs/{design_id}/availability']['get'];
type AvailabilityQuery = AvailabilityOperation['parameters']['query'];
type AvailabilityPath = AvailabilityOperation['parameters']['path'];
type CreateReservationOperation = paths['/api/v1/reservations']['post'];

export type AvailabilityDesignId = AvailabilityPath['design_id'];
export type AvailabilityDate = AvailabilityQuery['date'];
export type AvailabilityOptionIds = AvailabilityQuery['option_ids'];
export type AvailabilityResponse =
  AvailabilityOperation['responses'][200]['content']['application/json'];
export type ReservationCreatePayload = components['schemas']['ReservationCreate'];
export type ReservationResponse =
  CreateReservationOperation['responses'][201]['content']['application/json'];

export async function fetchAvailability(
  designId: AvailabilityDesignId,
  date: AvailabilityDate,
  optionIds?: AvailabilityOptionIds
): Promise<AvailabilityResponse> {
  const params: AvailabilityQuery = {
    date,
    option_ids: optionIds,
  };

  const response = await apiClient.get<AvailabilityResponse>(
    `/designs/${designId}/availability`,
    { params }
  );

  return response.data;
}

export async function createReservation(
  payload: ReservationCreatePayload
): Promise<ReservationResponse> {
  const response = await apiClient.post<ReservationResponse>(
    '/reservations',
    payload
  );

  return response.data;
}
