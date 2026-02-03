import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { LogBox } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'

const App = () => {
  LogBox.ignoreAllLogs();

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootStackNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App