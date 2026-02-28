import React, { useEffect } from 'react'
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigationContainerRef, type Theme } from '@react-navigation/native'
import { BackHandler, LogBox, Platform } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { EventsProvider } from './src/context/EventsContext'
import './src/i18n'

const AppNavigation = () => {
  const { colors, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onHardwareBackPress = () => {
      if (!navigationRef.isReady()) return false;
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => {
      subscription.remove();
    };
  }, [navigationRef]);

  const navTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primaryColor,
      background: colors.backgroundColor,
      card: colors.cardBackground,
      text: colors.mainTextColor,
      border: colors.borderColor,
      notification: colors.primaryColor,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <RootStackNavigation />
    </NavigationContainer>
  );
};

const App = () => {
  LogBox.ignoreAllLogs();

  return (
    <AuthProvider>
      <EventsProvider>
        <ThemeProvider>
          <AppNavigation />
        </ThemeProvider>
      </EventsProvider>
    </AuthProvider>
  )
}

export default App
