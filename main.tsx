import React, { ReactElement } from 'react'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ErrorBoundary } from './src/components/error-boundary.component'

import { Provider } from './src/context/auth.context'

import { requestAccessFineLocationPermission } from './src/services/permissions'

const Main:React.FC = ():ReactElement => {

  useEffect(() => {
    requestAccessFineLocationPermission()
  }, [])

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Provider />
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

export default Main
