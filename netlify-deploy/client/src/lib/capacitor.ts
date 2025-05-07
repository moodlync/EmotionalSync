/**
 * Safe Capacitor implementation that gracefully falls back when not in native mode
 * or when Capacitor is not fully loaded
 */

// Dynamic imports to prevent loading errors during bundling
let _capacitorCore: any;
let _pushNotifications: any;

// Flag to track if we're running in a native environment
let _isNative = false;

// Try to load Capacitor modules dynamically
async function loadCapacitorModules() {
  try {
    // Only try to load in browser environment
    if (typeof window !== 'undefined') {
      // Dynamic imports to avoid bundling issues
      _capacitorCore = (await import('@capacitor/core')).Capacitor;
      
      // Check if we're in a native environment
      _isNative = _capacitorCore.isNativePlatform();
      
      // Only load push notifications in native environment
      if (_isNative) {
        _pushNotifications = (await import('@capacitor/push-notifications')).PushNotifications;
      }
      
      console.log('Capacitor modules loaded successfully', { isNative: _isNative });
      return true;
    }
  } catch (error) {
    console.log('Capacitor not available, running in web mode only', error);
  }
  return false;
}

// Try to load modules but don't block execution
if (typeof window !== 'undefined') {
  loadCapacitorModules().then((success) => {
    console.log('Capacitor initialization complete', { success });
  });
}

/**
 * Check if the app is running as a native app
 */
export const isNative = () => {
  return _isNative;
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = () => {
  if (!_capacitorCore) return false;
  return _capacitorCore.getPlatform() === 'ios';
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = () => {
  if (!_capacitorCore) return false;
  return _capacitorCore.getPlatform() === 'android';
};

/**
 * Setup push notifications for native platforms
 * Uses a safe approach that won't break in web environments
 */
export const setupPushNotifications = async () => {
  // Make sure Capacitor is loaded first
  if (!await loadCapacitorModules()) {
    console.log('Capacitor not available, skipping push notification setup');
    return;
  }
  
  if (!_isNative || !_pushNotifications) {
    console.log('Push notifications are only available on native platforms');
    return;
  }
  
  try {
    // Request permission to use push notifications
    const result = await _pushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await _pushNotifications.register();
      
      // Setup push notification listeners
      setupNotificationListeners();
    } else {
      console.log('Push notification permission denied');
    }
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
};

/**
 * Setup notification listeners for native platforms
 */
const setupNotificationListeners = () => {
  if (!_pushNotifications) return;

  // On registration success
  _pushNotifications.addListener('registration', (token: any) => {
    console.log('Push registration success:', token.value);
  });

  // On registration error
  _pushNotifications.addListener('registrationError', (error: any) => {
    console.error('Error on registration:', error);
  });

  // On push notification received
  _pushNotifications.addListener('pushNotificationReceived', (notification: any) => {
    console.log('Push notification received:', notification);
  });

  // On push notification action
  _pushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
    console.log('Push notification action performed:', action);
  });
};

/**
 * Get the platform-specific app store link
 */
export const getAppStoreLink = () => {
  if (isIOS()) {
    return 'https://apps.apple.com/app/moodsync/id0000000000';
  } else if (isAndroid()) {
    return 'https://play.google.com/store/apps/details?id=com.moodsync.app';
  }
  return null;
};

/**
 * Get the device information
 */
export const getDeviceInfo = () => {
  if (!_capacitorCore) {
    return {
      platform: 'web',
      isNative: false,
      isWeb: true,
      isIOS: false,
      isAndroid: false
    };
  }
  
  return {
    platform: _capacitorCore.getPlatform(),
    isNative: _isNative,
    isWeb: !_isNative,
    isIOS: isIOS(),
    isAndroid: isAndroid()
  };
};