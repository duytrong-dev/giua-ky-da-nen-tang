import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/store/ToastContext';

export const unstable_settings = {
  anchor: '(root)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
