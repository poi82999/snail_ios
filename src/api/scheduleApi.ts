import { Reservation } from '../types';
import { apiClient } from './client';

export async function fetchReservations(): Promise<Reservation[]> {
  const res = await apiClient.get<Reservation[]>('/reservations');
  return res.data;
}
