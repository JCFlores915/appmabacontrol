import React, { ReactElement, useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'

type Props = {
  message: string
  onPressed: () => void
  isLoading?: boolean
  styles?: StyleProp<ViewStyle>
}
export const Button:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const { message, onPressed, isLoading = false } = props

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPressed}>
      <View style={[styles.container, props.styles]}>
        {isLoading ? (
          <ActivityIndicator size='small' color={'#000'} />
        ) : (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    container: {
      height: 50,
      borderRadius: 40,
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