import React, { useEffect, useMemo } from 'react'
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigationContainerRef, type Theme } from '@react-navigation/native'
import { BackHandler, LogBox, Platform } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { EventsProvider } from './src/context/EventsContext'
import { setRuntimeUrlOverrides } from './src/constants/RuntimeConfig'
import './src/i18n'

const parseJsonProp = <T,>(value: unknown): T | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'object') return value as T;
  const raw = String(value).trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

const AppNavigation = ({
  initialRouteName,
  initialRouteParams,
}: {
  initialRouteName?: string;
  initialRouteParams?: Record<string, any>;
}) => {
  const { colors, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef();
  const linking = useMemo(
    () => ({
      prefixes: ['spotme://'],
      config: {
        screens: {
          GroupInviteLinkScreen: 'group-invite/:token',
        },
      },
    }),
    [],
  );

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
    <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
      <RootStackNavigation
        initialRouteName={initialRouteName}
        initialRouteParams={initialRouteParams}
      />
    </NavigationContainer>
  );
};

const App = (props: any) => {
  LogBox.ignoreAllLogs();

  const initialRouteName = typeof props?.e2eInitialRouteName === 'string'
    ? String(props.e2eInitialRouteName).trim() || undefined
    : undefined;
  const initialRouteParams = useMemo(
    () => parseJsonProp<Record<string, any>>(props?.e2eInitialRouteParams),
    [props?.e2eInitialRouteParams],
  );
  const initialE2EAuth = useMemo(
    () => parseJsonProp<Record<string, any>>(props?.e2eAuthState),
    [props?.e2eAuthState],
  );

  useEffect(() => {
    setRuntimeUrlOverrides({
      apiBaseUrl: typeof props?.e2eApiBaseUrl === 'string' ? props.e2eApiBaseUrl : null,
      hlsBaseUrl: typeof props?.e2eHlsBaseUrl === 'string' ? props.e2eHlsBaseUrl : null,
    });
  }, [props?.e2eApiBaseUrl, props?.e2eHlsBaseUrl]);

  return (
    <AuthProvider initialE2EAuth={initialE2EAuth}>
      <EventsProvider>
        <ThemeProvider>
          <AppNavigation
            initialRouteName={initialRouteName}
            initialRouteParams={initialRouteParams}
          />
        </ThemeProvider>
      </EventsProvider>
    </AuthProvider>
  )
}

export default App
