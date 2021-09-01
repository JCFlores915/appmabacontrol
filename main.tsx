import React, { ReactElement } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Provider } from './src/context/auth.context'

import { Navigator } from './src/navigation'

const Main:React.FC = ():ReactElement => {
  return (
    <SafeAreaProvider>
      <Provider />
    </SafeAreaProvider>
  )
}

export default Main
