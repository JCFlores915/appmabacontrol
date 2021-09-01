import React, { ReactElement } from 'react'
import {
  View,
  Text
} from 'react-native'

import { useAuth } from '../../context/auth.context'

export const HomeScreen: React.FC = ():ReactElement => {
  const { user } = useAuth()
  return (
    <View>
      <Text>{user.name}</Text>
    </View>
  )
}