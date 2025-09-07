import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Amita_400Regular,
  NotoSansDevanagari_400Regular,
  Hind_400Regular,
} from '@expo-google-fonts/dev';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '../hooks/useColorScheme';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../constants/Theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Amita_400Regular,
    NotoSansDevanagari_400Regular,
    Hind_400Regular,
  });

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="solo" options={{ headerShown: false }} />
            <Stack.Screen name="pass-phone" options={{ headerShown: false }} />
            <Stack.Screen name="versus" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
