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

  // Hermes에서 TanStack Query v5 result 객체를 spread하면 non-enumerable 프로퍼티가
  // 누락되는 버그가 있어 필요한 프로퍼티를 명시적으로 반환
  return {
    notifications,
    unreadCount,
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
  };
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
