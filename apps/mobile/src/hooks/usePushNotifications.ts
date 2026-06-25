import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useApi } from '../context/ApiContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications(userId: string | null) {
  const api = useApi();
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
      // Register token with Supabase via the api
      // The SupabaseMomentsApi would need a registerPushToken method;
      // for now store is handled in the app config
      console.log('[push] token:', tokenData.data);
      registered.current = true;
    }

    register();
  }, [userId]);
}
