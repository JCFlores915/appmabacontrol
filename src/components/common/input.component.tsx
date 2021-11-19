import React, { ReactElement } from 'react'
import { useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleProp,
  StyleSheet,
  TextInputProps,
  ViewStyle
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

type Props = {
  label: string
  icon: {
    name: string
    size?: number
    color?: string
  }
  customProps?: TextInputProps
  containerStyle?: StyleProp<ViewStyle>
}
export const Input:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const { label, icon, } = props

  return (
    <View style={[props.containerStyle, styles.container]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.content}>
        <View style={styles.row}>
          <Icon
            name={icon.name}
            style={styles.icon}
            size={icon.size || 24}
            color={icon.color || '#697477'}
          />
          <TextInput
            style={styles.input}
            multiline={false}
            {...props.customProps}
          />
        </View>
      </View>
    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    container: {
      
    },
    content: {
      backgroundColor: '#fbfbfb',
      borderRadius: 6,
      shadowColor: "#000",
      paddingVertical: 8,
      paddingHorizontal: 20,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.00,

      elevation: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    icon: {
      marginRight: 8,
      position: 'relative',
      left: -5
    },
    input: {
      paddingHorizontal: 5,
      paddingVertical: 6.5,
      flexGrow: 1,
      color: '#000'
    },
    label: {
      fontSize: 14,
      position: 'relative',
      left: 4,
      bottom: 4,
      fontWeight: 'bold'
    }
  })
}