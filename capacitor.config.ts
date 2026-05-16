import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0be945b1b30f44028e2c9da4a7630623',
  appName: 'VirtuLab',
  webDir: 'dist',
  server: {
    url: 'https://0be945b1-b30f-4402-8e2c-9da4a7630623.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
