# MoodSync Mobile App Publication Guide

This document provides instructions for building and publishing the MoodSync application to iOS App Store and Google Play Store using Capacitor.

## Prerequisites

- Apple Developer Account ($99/year) for iOS App Store
- Google Play Developer Account ($25 one-time fee) for Google Play Store
- Node.js and npm installed
- Xcode (for iOS builds)
- Android Studio (for Android builds)

## Setup

The project has already been set up with Capacitor. The main configuration files are:

- `capacitor.config.ts` - Main configuration file for Capacitor
- `client/public/manifest.json` - PWA manifest file
- `client/public/service-worker.js` - Service worker for offline capabilities
- `client/src/lib/capacitor.ts` - Helper functions for Capacitor integration

## Building the Web App

Before generating native builds, build the web app:

```bash
# From project root
npm run build
```

This will create a production build in the `client/dist` directory, which Capacitor will use for the native apps.

## Adding Native Platforms

### Add iOS platform

```bash
npx cap add ios
```

### Add Android platform

```bash
npx cap add android
```

## Syncing Changes

After making changes to the web app and rebuilding, sync the changes to the native platforms:

```bash
npx cap sync
```

## Opening in Native IDEs

### Open in Xcode (iOS)

```bash
npx cap open ios
```

### Open in Android Studio

```bash
npx cap open android
```

## Configuring Native Projects

### iOS Configuration

1. In Xcode, open the `App/App.xcodeproj` file
2. Set your Bundle Identifier (should match the `appId` in capacitor.config.ts)
3. Configure signing with your Apple Developer account
4. Update app icons in the `App/App/Assets.xcassets/AppIcon.appiconset` directory
5. Update splash screen in `App/App/Assets.xcassets/Splash.imageset`
6. Configure additional iOS-specific settings in the Info.plist file

### Android Configuration

1. In Android Studio, open the `android` folder
2. Update application ID in `android/app/build.gradle` (should match the `appId` in capacitor.config.ts)
3. Update app icons in `android/app/src/main/res` folders
4. Update splash screen in `android/app/src/main/res/drawable` folder
5. Configure additional Android-specific settings in the AndroidManifest.xml file

## Building for Production

### Building for iOS

1. In Xcode, select `Product > Archive`
2. Once the archive is complete, click `Distribute App`
3. Follow the steps in the distribution wizard
4. Choose `App Store Connect` as the distribution method
5. Complete the submission process

### Building for Android

1. In Android Studio, select `Build > Generate Signed Bundle / APK`
2. Choose `Android App Bundle` for Google Play Store submission
3. Create or select a signing key
4. Complete the build process
5. The AAB file will be generated in `android/app/release/`

## Submitting to App Stores

### App Store (iOS)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Create a new app record
3. Fill in all required metadata, screenshots, and app information
4. Upload the build (should appear after Xcode submission)
5. Submit for review

### Google Play Store

1. Log in to [Google Play Console](https://play.google.com/console/)
2. Create a new application
3. Complete all required store listing information, including screenshots and descriptions
4. Upload the AAB file
5. Set up pricing and distribution
6. Submit for review

## Push Notifications

Push notifications have been configured in the app using Capacitor's Push Notifications plugin. To fully implement them:

1. For iOS: Set up an Apple Push Notification Service (APNs) certificate
2. For Android: Configure Firebase Cloud Messaging (FCM)
3. Implement a server-side component that can send push notifications to the devices

## PWA Support

The app also supports installation as a Progressive Web App (PWA) with:

- A manifest file (`client/public/manifest.json`)
- Service worker for offline support (`client/public/service-worker.js`)
- Required icons and splash screens

## Updating the App

When you need to update the app:

1. Make changes to the web app
2. Rebuild the web app (`npm run build`)
3. Sync changes to native platforms (`npx cap sync`)
4. Test thoroughly
5. Build new versions for iOS and Android
6. Submit updates to the respective app stores

## Requirements Checklist for App Store Submission

- [ ] App icons in all required sizes
- [ ] Splash screen
- [ ] App screenshots for various device sizes
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] App review information (demo account if needed)

## Requirements Checklist for Google Play Submission

- [ ] App icons
- [ ] Feature graphic
- [ ] Screenshots for various device sizes
- [ ] App description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Pricing and distribution settings