import React, { ReactElement, useMemo } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

export const SplashScreen:React.FC = ():ReactElement => {
  const styles = useMemo(() => factory({}), [])
  return (
    <View style={styles.screen}>
      <ActivityIndicator size='large' color='#000' />
    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#EECFD4',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
}