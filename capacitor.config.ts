
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.supraclientnexus',
  appName: 'supra-client-nexus',
  webDir: 'dist',
  server: {
    url: 'https://571771e6-b817-4602-a697-0499691ad4b3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
