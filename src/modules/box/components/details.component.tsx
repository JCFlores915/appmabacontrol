import React, { ReactElement, useCallback, useMemo } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Button, Resize } from '../../../components/common'

type Props = {
  isVisible: boolean
  onToggle: () => void
}
const DetailsModal:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const onPressed = useCallback(() => {}, [])

  return (
    <Modal
      style={{ justifyContent: "flex-start" }}
      isVisible={props.isVisible}
      onBackdropPress={props.onToggle}
      swipeDirection={["down", "up", "left", "right"]}
    >
      <View style={styles.modal}>
        <TouchableOpacity onPress={props.onToggle}>
          <View style={styles.icon}>
            <Icon
              color='#697477'
              name="close"
              size={32}
            />
          </View>
        </TouchableOpacity>
        <Resize styles={{ height: 10 }} />
        <View>
          <View style={styles.center}>
            <View style={[styles.row, styles.background]}>
              <Text style={styles.symbol}>C$</Text>

              <Resize styles={{ height: 20 }} />
              <Text style={styles.total}>300.00</Text>
            </View>
          </View>
          <Resize styles={{ height: 20 }} />
          <Text style={[styles.text, styles.textCenter]}>Fecha del cierre: 20/10/2020</Text>
          <Resize styles={{ height: 20 }} />
          <View style={styles.divider} />
          <Resize styles={{ height: 20 }} />

          <Text style={[styles.text, styles.textCenter]}>Direccion de usuario</Text>

          <Resize styles={{ height: 40 }} />
          <Button 
            onPressed={onPressed}
            message='CONFIRMAR'
          />
        </View>
      </View>
    </Modal>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    modal: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 15
    },
    row: {
      flexDirection: 'row'
    },
    background: {
      backgroundColor: '#C9C9C9',
      paddingHorizontal: 14,
      paddingVertical: 7.6,
      borderRadius: 200
    },
    text: {

    },
    divider: {
      height: 1,
      backgroundColor: '#ddd'
    },
    textCenter: {
      textAlign: 'center'
    },
    center: {
      alignItems: 'center'
    },
    symbol: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#3695BE',
    },
    bold: {
      fontWeight: 'bold',
    },
    total: {
      fontSize: 18,
      fontWeight: 'bold'
    },
    icon: {
      alignSelf: 'flex-end',
      paddingHorizontal: 4,
      paddingVertical: 4
    }
  })
}

export default DetailsModal
