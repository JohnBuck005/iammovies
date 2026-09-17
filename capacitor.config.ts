import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iamoviestory.app',
  appName: 'IAmoviestory',
  webDir: '.next',
  server: {
    url: 'https://iamoviestory.com',
    cleartext: false
  },
  plugins: {
    MediaSession: {
      presentationOptions: ['badge', 'sound', 'alert', 'banner', 'list'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
