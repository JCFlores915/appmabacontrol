import React, { ReactElement, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'

type Props = {
  message: string
  onPressed: () => void
}
export const Button:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const { message, onPressed } = props

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPressed}>
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </TouchableOpacity>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    container: {
      borderRadius: 40,
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: '#EECFD4',
      justifyContent: 'center',
      alignItems: 'center'
    },
    message: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold'
    }
  })
}