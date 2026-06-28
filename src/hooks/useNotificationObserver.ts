import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

// 앱이 실행 중일 때 도착한 알림도 배너/목록/사운드로 표시한다.
// 핸들러를 설정하지 않으면 포그라운드 알림은 표시되지 않는다(Expo v56 문서).
// 모듈 로드 시 1회만 설정된다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
