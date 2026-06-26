import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationPage,
} from '../api/notificationApi';

type NotificationsQueryKey = readonly ['notifications'];

export function useNotifications() {
  const query = useInfiniteQuery<
    NotificationPage,
    Error,
    InfiniteData<NotificationPage>,
    NotificationsQueryKey,
    string | null
  >({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const notifications = query.data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  return { ...query, notifications, unreadCount };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
