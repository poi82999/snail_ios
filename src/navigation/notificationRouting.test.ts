import { describe, expect, it } from '@jest/globals';
import { resolveNotificationTarget } from './notificationRouting';

describe('resolveNotificationTarget', () => {
  it('reservation → ReservationDetail', () => {
    expect(resolveNotificationTarget({ resource_type: 'reservation', resource_id: 'r1' })).toEqual({
      screen: 'ReservationDetail',
      params: { reservationId: 'r1' },
    });
  });

  it('design / shop / snail 매핑', () => {
    expect(resolveNotificationTarget({ resource_type: 'design', resource_id: 'd1' })).toEqual({
      screen: 'DesignDetail',
      params: { designId: 'd1' },
    });
    expect(resolveNotificationTarget({ resource_type: 'shop', resource_id: 's1' })).toEqual({
      screen: 'ShopDetail',
      params: { shopId: 's1' },
    });
    expect(resolveNotificationTarget({ resource_type: 'snail', resource_id: 'n1' })).toEqual({
      screen: 'SnapDetail',
      params: { snapId: 'n1' },
    });
  });

  it('resource_id가 없으면 null', () => {
    expect(resolveNotificationTarget({ resource_type: 'reservation' })).toBeNull();
  });

  it('알 수 없는 타입·비객체는 null (안전 무시)', () => {
    expect(resolveNotificationTarget({ resource_type: 'unknown', resource_id: 'x' })).toBeNull();
    expect(resolveNotificationTarget(null)).toBeNull();
    expect(resolveNotificationTarget('string')).toBeNull();
    expect(resolveNotificationTarget({})).toBeNull();
  });
});
