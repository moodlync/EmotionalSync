import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moodsync.app',
  appName: 'MoodSync',
  webDir: 'client/dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  server: {
    // Enable this for live reload during development
    // Comment out before publishing to app stores
    url: 'http://localhost:5000',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'moodsync.keystore',
      keystoreAlias: 'moodsync',
    }
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
