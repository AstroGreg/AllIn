import React from 'react'
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native'
import { LogBox, View, StyleSheet } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { EventsProvider } from './src/context/EventsContext'
import { NetworkLoggerProvider } from './src/context/NetworkLoggerContext'
import NetworkLoggerOverlay from './src/components/networkLogger/NetworkLoggerOverlay'
import './src/i18n'

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
    <NetworkLoggerProvider>
      <AuthProvider>
        <EventsProvider>
          <ThemeProvider>
            <View style={appStyles.container}>
              <AppNavigation />
              {__DEV__ && <NetworkLoggerOverlay />}
            </View>
          </ThemeProvider>
        </EventsProvider>
      </AuthProvider>
    </NetworkLoggerProvider>
  )
}

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App
