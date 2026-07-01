import apiClient from './client';
import type { components } from '../types/api';

type NotificationListResponse = components['schemas']['UserNotificationListResponse'];
type NotificationPublic = components['schemas']['UserNotificationPublic'];

export type { NotificationPublic };

export interface NotificationPage {
  notifications: NotificationPublic[];
  nextCursor: string | null;
  unreadCount: number;
}

export async function fetchNotifications(cursor?: string | null): Promise<NotificationPage> {
  const res = await apiClient.get<NotificationListResponse>('/me/notifications', {
    params: {
      limit: 20,
      ...(cursor ? { cursor } : {}),
    },
  });
  return {
    notifications: res.data.data,
    nextCursor: res.data.page?.next_cursor ?? null,
    unreadCount: res.data.unread_count,
  };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.post(`/me/notifications/${encodeURIComponent(notificationId)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/me/notifications/read-all');
}
