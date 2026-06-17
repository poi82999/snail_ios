import { useQuery } from '@tanstack/react-query';
import { fetchReservations } from '../api/scheduleApi';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
  });
}
