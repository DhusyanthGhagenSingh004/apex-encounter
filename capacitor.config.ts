import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.02ac3d63eb6645b1859156c9152e205b',
  appName: 'apex-encounter',
  webDir: 'dist',
  server: {
    url: 'https://02ac3d63-eb66-45b1-8591-56c9152e205b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
