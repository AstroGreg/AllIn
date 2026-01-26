import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { LogBox } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'
import { ThemeProvider } from './src/context/ThemeContext'

const App = () => {
  LogBox.ignoreAllLogs();

  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootStackNavigation />
      </NavigationContainer>
    </ThemeProvider>
  )
}

export default App