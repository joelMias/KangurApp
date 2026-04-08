import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kangurapp.app',
  appName: 'KangurApp',
  webDir: 'dist', 
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['password']
    }
  }
};

export default config;