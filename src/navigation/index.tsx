import React, { ReactElement } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens
import { CloseTheBox, HomeScreen, ScannerScreen, SignInScreen, SplashScreen, ProfileScreen, MatchPrinterScreen, ExpensesScreen } from '../modules'

import { useAuth } from '../context/auth.context'

const Stack = createNativeStackNavigator()

type Props = {}
export const Navigator:React.FC<Props> = React.memo((props):ReactElement => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) return <SplashScreen />
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator initialRouteName='/home'>
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
          <Stack.Screen 
            options={{
              headerTitle: 'Cerrar caja de la ruta',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }} 
            name='/closethebox' 
            component={CloseTheBox} 
          />
          <Stack.Screen 
            options={{
              headerTitle: 'Detalle del cliente',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }} 
            name='/profile' 
            component={ProfileScreen} 
          />

          <Stack.Screen 
            options={{
              headerTitle: 'Ingresar gastos administrativos',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }} 
            name='/expenses' 
            component={ExpensesScreen} 
          />

          <Stack.Screen 
            options={{
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }} 
            name='/match-printer'
            component={MatchPrinterScreen} 
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false, animationTypeForReplace: isLoggedIn ? 'pop' : 'push' }} name='/signin' component={SignInScreen} />
          <Stack.Screen
            options={{
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#EECFD4',
              }
            }}
            name='/match-printer'
            component={MatchPrinterScreen} 
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
})

