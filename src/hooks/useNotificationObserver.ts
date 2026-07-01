import { useEffect, useRef } from 'react';
import { isRunningInExpoGo } from 'expo';
// 타입만 가져온다(런타임에 소거됨). 값(런타임) import는 Expo Go 크래시를 유발하므로 금지.
import type * as Notifications from 'expo-notifications';

export interface NotificationObserverHandlers {
  // 앱 실행 중 알림 수신 시
  onReceive?: (notification: Notifications.Notification) => void;
  // 알림 탭 시(딥링크/화면 이동 등은 여기서 처리)
  onRespond?: (response: Notifications.NotificationResponse) => void;
}

/**
 * 알림 수신/탭 리스너를 등록한다. App 루트에서 한 번만 호출하면 된다.
 * 핸들러는 ref로 보관해 매 렌더마다 재구독하지 않는다.
 */
export function useNotificationObserver(handlers: NotificationObserverHandlers = {}) {
  const handlersRef = useRef<NotificationObserverHandlers>(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    // Expo Go(SDK 53+)에서는 원격 푸시가 expo-notifications에서 제거되어, 모듈을 import(require)하는 것만으로
    // Android에서 throw한다(내부 사이드이펙트). Expo Go에서는 핸들러/리스너 설정을 건너뛴다
    // (알림 동작은 개발/프로덕션 빌드에서만). 정적 import 금지 — 반드시 가드 뒤에서 지연 require.
    if (isRunningInExpoGo()) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports -- 지연 로드가 목적(정적 import 금지)
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');

    // 앱이 실행 중일 때 도착한 알림도 배너/목록/사운드로 표시한다.
    // 핸들러를 설정하지 않으면 포그라운드 알림은 표시되지 않는다(Expo v56 문서).
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      handlersRef.current.onReceive?.(notification);
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      handlersRef.current.onRespond?.(response);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
