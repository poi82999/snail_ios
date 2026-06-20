import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelReservation, fetchReservationDetail, fetchReservations } from '../api/scheduleApi';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
  });
}

export function useReservationDetail(reservationId: string) {
  return useQuery({
    queryKey: ['reservations', reservationId],
    queryFn: () => fetchReservationDetail(reservationId),
    enabled: Boolean(reservationId),
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: string; reason?: string }) =>
      cancelReservation(reservationId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.setQueryData(['reservations', data.id], data);
    },
  });
}
