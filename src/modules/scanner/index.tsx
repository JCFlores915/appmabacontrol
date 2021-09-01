import React, { ReactElement, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'
import QRCodeScanner from "react-native-qrcode-scanner"

export const ScannerScreen:React.FC = ():ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  return (
    <View style={styles.screen}>

    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1
    },
  })
}