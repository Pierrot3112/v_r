import { LinkProps } from 'expo-router';

declare module 'expo-router' {
  interface LinkProps {
    href: 
      | '/'
      | '/(auth)/login'
      | '/(auth)/register'
      | '/(auth)/forgot-password'
      | '/(auth)/ValidCodeSms'
      | `/${string}`
      | { pathname: string; params?: Record<string, string> };
  }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(auth)/login': undefined;
      '/(auth)/register': undefined;
      '/(auth)/forgot-password': undefined;
      '/(auth)/ValidCodeSms': { phone?: string };
    }
  }
}