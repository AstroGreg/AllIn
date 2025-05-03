import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { LogBox } from 'react-native'
import RootStackNavigation from './src/navigations/RootStackNavigation'

const App = () => {
  LogBox.ignoreAllLogs();

  return (
    <NavigationContainer>
      <RootStackNavigation />
    </NavigationContainer>
  )
}

export default App