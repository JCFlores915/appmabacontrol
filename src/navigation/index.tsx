import React, { ReactElement } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens
import { HomeScreen, ScannerScreen, SignInScreen, SplashScreen } from '../modules'

import { useAuth } from '../context/auth.context'

const Stack = createNativeStackNavigator()

type Props = {}
export const Navigator:React.FC<Props> = React.memo((props):ReactElement => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) return <SplashScreen />
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false }} name='/home' component={HomeScreen} />
          <Stack.Screen 
            options={{
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }} 
            name='/scanner' 
            component={ScannerScreen} 
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false, animationTypeForReplace: isLoggedIn ? 'pop' : 'push' }} name='/signin' component={SignInScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
})

