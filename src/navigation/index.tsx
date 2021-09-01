import React, { ReactElement } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens
import { HomeScreen, SignInScreen } from '../modules'

const Stack = createNativeStackNavigator()

type Props = {
  isLoggedIn: boolean
}
export const Navigator:React.FC<Props> = (props):ReactElement => {
  const { isLoggedIn } = props
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false }} name='/home' component={HomeScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false, animationTypeForReplace: isLoggedIn ? 'pop' : 'push' }} name='/signin' component={SignInScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}

