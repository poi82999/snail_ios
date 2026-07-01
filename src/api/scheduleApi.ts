import { Reservation, ReservationDetail } from '../types';
import apiClient from './client';
import type { components, paths } from '../types/api';

type ReservationsResponse =
  paths['/api/v1/me/reservations']['get']['responses'][200]['content']['application/json'];
type ReservationMe = components['schemas']['ReservationMe'];
type ReservationActionRequest = components['schemas']['ReservationActionRequest'];

function mapReservationToUi(reservation: ReservationMe): Reservation {
  return {
    id: reservation.id,
    shopName: reservation.shop?.name ?? '',
    thumbnailUri: reservation.shop?.thumbnail_url ?? reservation.design?.thumbnail_url ?? '',
    startAt: reservation.start_at,
    status: reservation.status,
    designId: reservation.design_id,
  };
}

function mapReservationToDetailUi(reservation: ReservationMe): ReservationDetail {
  return {
    id: reservation.id,
    status: reservation.status,
    startAt: reservation.start_at,
    endAt: reservation.end_at,
    userRequest: reservation.user_request ?? null,
    rejectedReason: reservation.rejected_reason ?? null,
    cancelledReason: reservation.cancelled_reason ?? null,
    shopId: reservation.shop_id,
    shopName: reservation.shop?.name ?? '',
    shopThumbnailUri: reservation.shop?.thumbnail_url ?? '',
    designId: reservation.design_id,
    designTitle: reservation.design?.title ?? '',
    designPrice: reservation.design?.base_price ?? 0,
    designDuration: reservation.design?.duration_minutes ?? 0,
    designThumbnailUri: reservation.design?.thumbnail_url ?? '',
    designerName: reservation.designer?.name ?? null,
  };
}

export async function fetchReservations(): Promise<Reservation[]> {
  const res = await apiClient.get<ReservationsResponse>('/me/reservations');
  return res.data.data.map(mapReservationToUi);
}

export async function fetchReservationDetail(reservationId: string): Promise<ReservationDetail> {
  const res = await apiClient.get<ReservationMe>(`/me/reservations/${encodeURIComponent(reservationId)}`);
  return mapReservationToDetailUi(res.data);
}

export async function cancelReservation(
  reservationId: string,
  cancelReason?: string
): Promise<ReservationDetail> {
  const payload: ReservationActionRequest = { cancel_reason: cancelReason };
  const res = await apiClient.post<ReservationMe>(
    `/me/reservations/${encodeURIComponent(reservationId)}/cancel`,
    payload
  );
  return mapReservationToDetailUi(res.data);
}
