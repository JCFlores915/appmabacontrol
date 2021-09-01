import React, { ReactElement, useMemo, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'
import MapView from 'react-native-maps'

import { useAuth } from '../../context/auth.context'

export const HomeScreen: React.FC = ():ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const { user } = useAuth()

  return (
    <View style={styles.screen}>
      <MapView
        style={styles.screen}
      >

      </MapView>
    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1
    }
  })
}