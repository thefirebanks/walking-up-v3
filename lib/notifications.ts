import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for local notifications only (no push tokens for development)
 * For production, you can extend this to get Expo push tokens for use with Supabase Edge Functions
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Walking Up Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        description: 'Notifications for location sharing',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission not granted');
      return null;
    }
    
    console.log('✅ Local notifications permission granted');
    
    // For local notifications in development, we don't need a push token
    // For production, you could uncomment the following to get an Expo push token:
    // const token = (await Notifications.getExpoPushTokenAsync()).data;
    // return token;
    
    return 'local-notifications-enabled';
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return null;
  }
};

/**
 * Save user's notification preferences (simplified for local notifications)
 */
export const savePushToken = async (token: string): Promise<boolean> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      return false;
    }

    // For local notifications, we'll just mark that notifications are enabled
    // You can optionally save this to the database if needed
    console.log('Local notifications enabled for user:', currentUser.user.id);
    return true;
  } catch (error) {
    console.error('Error in savePushToken:', error);
    return false;
  }
};

/**
 * Send a local notification when someone shares their location
 */
export const sendLocationSharedNotification = async (senderName: string): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Location Shared 📍',
        body: `${senderName} shared their location with you`,
        data: { type: 'location_shared', senderName },
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Listen for location shares in real-time and show notifications
 */
export const subscribeToLocationShares = (userId: string) => {
  const subscription = supabase
    .channel('location_shares')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_shares',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        // Get sender information
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', payload.new.sender_id)
          .single();

        const senderName = senderProfile?.full_name || senderProfile?.email || 'Someone';
        
        // Show local notification
        await sendLocationSharedNotification(senderName);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from location share notifications
 */
export const unsubscribeFromLocationShares = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};
