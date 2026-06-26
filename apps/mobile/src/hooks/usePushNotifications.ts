import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../context/ApiContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function routeForNotification(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  const type = data.type as string | undefined;
  switch (type) {
    case 'reaction':
    case 'comment':
      return data.momentId ? `/moment/${data.momentId}` : null;
    case 'connection_request':
      return '/notifications';
    case 'spark':
      return data.sparkDeliveryId ? `/spark/${data.sparkDeliveryId}` : '/sparks';
    case 'memory':
      return data.momentId ? `/moment/${data.momentId}` : null;
    case 'birthday':
      return '/(tabs)/calendar';
    default:
      return '/notifications';
  }
}

export function usePushNotifications(userId: string | null) {
  const api = useApi();
  const router = useRouter();
  const registered = useRef(false);

  useEffect(() => {
    if (!userId || registered.current) return;

    async function register() {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Momeants',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: null,
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      await api.savePushToken(tokenData.data).catch(() => {});
      registered.current = true;
    }

    register();
  }, [userId]);

  // Handle tapping a notification — navigate to the relevant screen
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      const route = routeForNotification(data);
      if (route) {
        router.push(route as any);
      }
    });
    return () => subscription.remove();
  }, [router]);
}
