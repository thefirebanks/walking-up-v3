import { Alert } from 'react-native';

/**
 * Simple notification service using React Native's Alert
 * This doesn't require any external services or permissions
 */

/**
 * Send a simple alert notification when a friend shares their location
 * @param friendName The name of the friend who shared their location
 */
export const sendLocationSharedNotification = async (friendName: string): Promise<void> => {
  try {
    console.log("🔔 sendLocationSharedNotification called for:", friendName);
    Alert.alert(
      'Location Shared',
      `${friendName} has shared their location with you!`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
    console.log("✅ Alert.alert called successfully");
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

/**
 * Send a simple alert notification when a friend stops sharing their location
 * @param friendName The name of the friend who stopped sharing their location
 */
export const sendLocationStoppedNotification = async (friendName: string): Promise<void> => {
  try {
    console.log("🔔 sendLocationStoppedNotification called for:", friendName);
    Alert.alert(
      'Location Stopped',
      `${friendName} has stopped sharing their location with you.`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
    console.log("✅ Stop Alert.alert called successfully");
  } catch (error) {
    console.error('❌ Error sending stop notification:', error);
  }
};

/**
 * Initialize notification service (no-op for alert-based notifications)
 */
export const initializeNotifications = async (): Promise<void> => {
  console.log('🔔 Simple alert notifications initialized');
};

/**
 * Request notification permissions (no-op for alert-based notifications)
 * @returns always returns true since alerts don't require permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  return true;
};

/**
 * Get notification permissions status (no-op for alert-based notifications)
 * @returns always returns granted status since alerts don't require permissions
 */
export const getNotificationPermissionsStatus = async () => {
  return { 
    status: 'granted' as const, 
    granted: true, 
    expires: 'never' as const,
    canAskAgain: false
  };
}; 