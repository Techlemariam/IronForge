import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ironforge.app',
  appName: 'IronForge',
  webDir: 'public',
  server: {
    // START: Development configuration
    androidScheme: 'http',
    cleartext: true,
    // Replace with your actual local IP for device testing, e.g., 'http://192.168.1.100:3000'
    url: 'http://192.168.68.55:3000',
    // END: Development configuration

    // PRODUCTION: Uncomment below and comment above for store release
    // url: 'https://your-production-url.com', 
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;

