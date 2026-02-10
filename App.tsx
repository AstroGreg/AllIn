import React from 'react'
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native'
import { LogBox } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { EventsProvider } from './src/context/EventsContext'

const AppNavigation = () => {
  const { colors, isDark } = useTheme();

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
    <NavigationContainer theme={navTheme}>
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
