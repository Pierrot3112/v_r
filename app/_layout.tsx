import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query'; 
import { AuthProvider } from './lib/context/AuthContext';
import { COLORS } from './lib/constants';
import { queryClient } from './lib/config/QueryClientConfig'; 

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.tertiary,
    background: COLORS.bgBlue,
    error: COLORS.red,
    onSurface: COLORS.black,
    onPrimary: COLORS.black,
  },
};

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.colors.background,
              } 
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}