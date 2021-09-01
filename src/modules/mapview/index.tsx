import React, { ReactElement, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import MapView from 'react-native-maps'

type Props = {

}
export const Map:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
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