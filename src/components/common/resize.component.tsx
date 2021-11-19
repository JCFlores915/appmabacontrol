import React, { ReactElement } from 'react'
import {
  View,
  StyleProp,
  ViewStyle
} from 'react-native'

type Props = {
  styles: StyleProp<ViewStyle>
}
export const Resize:React.FC<Props> = (props):ReactElement => {
  const { styles } = props
  return (
    <View style={styles} />
  )
}
