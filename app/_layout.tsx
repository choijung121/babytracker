import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper'; // Import PaperProvider
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ title: 'Back', headerShown: false }} />
          <Stack.Screen
            name="trackers/sleep"
            options={{ title: 'Sleep', headerBackTitle: '' }}
          />
          <Stack.Screen
            name="trackers/nursing"
            options={{ title: 'Nursing', headerBackTitle: '' }}
          />
          <Stack.Screen
            name="trackers/bottle"
            options={{ title: 'Bottle', headerBackTitle: '' }}
          />
          <Stack.Screen
            name="trackers/diaper"
            options={{ title: 'Diaper', headerBackTitle: '' }}
          />
          <Stack.Screen
            name="summary"
            options={{ title: 'Daily Summary', headerBackTitle: '' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
