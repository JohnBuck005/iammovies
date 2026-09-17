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
  },
};

export default config;
