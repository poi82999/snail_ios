import { navigationRef } from './navigationRef';

// 푸시 알림 data를 앱 내 화면으로 매핑한다. 백엔드 알림 모델(UserNotificationPublic)의
// resource_type/resource_id 규약을 따른다. 알 수 없는 형태는 null을 반환해 안전하게 무시한다.
// (실제 푸시 payload 형태는 백엔드 확인 필요 — 불일치 시 라우팅이 no-op이 되어 안전하다.)
type NotificationTarget =
  | { screen: 'ReservationDetail'; params: { reservationId: string } }
  | { screen: 'DesignDetail'; params: { designId: string } }
  | { screen: 'ShopDetail'; params: { shopId: string } }
  | { screen: 'SnapDetail'; params: { snapId: string } };

export function resolveNotificationTarget(data: unknown): NotificationTarget | null {
  if (typeof data !== 'object' || data === null) return null;

  const record = data as Record<string, unknown>;
  const resourceType =
    typeof record.resource_type === 'string' ? record.resource_type : undefined;
  const resourceId = typeof record.resource_id === 'string' ? record.resource_id : undefined;
  if (!resourceId) return null;

  switch (resourceType) {
    case 'reservation':
      return { screen: 'ReservationDetail', params: { reservationId: resourceId } };
    case 'design':
      return { screen: 'DesignDetail', params: { designId: resourceId } };
    case 'shop':
      return { screen: 'ShopDetail', params: { shopId: resourceId } };
    case 'snap':
    case 'snail':
      return { screen: 'SnapDetail', params: { snapId: resourceId } };
    default:
      return null;
  }
}

// 알림 탭 시 호출. 매핑되는 타깃이 있고 네비게이션이 준비됐으면 이동한다.
export function navigateToNotificationTarget(data: unknown): boolean {
  const target = resolveNotificationTarget(data);
  if (!target || !navigationRef.isReady()) return false;

  switch (target.screen) {
    case 'ReservationDetail':
      navigationRef.navigate('ReservationDetail', target.params);
      break;
    case 'DesignDetail':
      navigationRef.navigate('DesignDetail', target.params);
      break;
    case 'ShopDetail':
      navigationRef.navigate('ShopDetail', target.params);
      break;
    case 'SnapDetail':
      navigationRef.navigate('SnapDetail', target.params);
      break;
  }
  return true;
}
