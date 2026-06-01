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
export type AvailableSlot = AvailabilityResponse[number];
export type ReservationCreatePayload = components['schemas']['ReservationCreate'];
export type ReservationResponse =
  CreateReservationOperation['responses'][201]['content']['application/json'];

export interface ReservationSelection {
  designId: string;
  /** 슬롯의 start_at(ISO 8601, UTC)을 그대로 전달 — date+time을 합치지 말 것 */
  startAt: string;
  designerId?: string | null;
  /** 제거/연장/케어 옵션 UUID들을 하나의 배열로 합쳐 전달 */
  selectedOptionIds?: string[];
  userRequest?: string | null;
}

// 백엔드 ReservationCreate 계약으로 변환한다. UI의 옵션 분리(removal/extend)와
// 날짜/시간 분리를 여기서 단일 필드(selected_option_ids, start_at)로 합친다.
export function buildReservationPayload(
  selection: ReservationSelection
): ReservationCreatePayload {
  return {
    design_id: selection.designId,
    start_at: selection.startAt,
    designer_id: selection.designerId ?? undefined,
    selected_option_ids: selection.selectedOptionIds ?? [],
    user_request: selection.userRequest ?? undefined,
  };
}

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
