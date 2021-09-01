import React, { ReactElement } from 'react'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Provider } from './src/context/auth.context'

import { requestAccessFineLocationPermission } from './src/services/permissions'

const Main:React.FC = ():ReactElement => {

  useEffect(() => {
    requestAccessFineLocationPermission()
  }, [])

  return (
    <SafeAreaProvider>
      <Provider />
    </SafeAreaProvider>
  )
}

export default Main
