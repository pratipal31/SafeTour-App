import '@/global.css';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`} style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <NavThemeProvider value={NAV_THEME[colorScheme]}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </NavThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </>
  );
}
