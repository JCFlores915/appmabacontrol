import React, { ReactElement, useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ToastAndroid as Toast,
} from 'react-native'
import Modal from 'react-native-modal'

import { Button, Resize } from '../../../components/common'

import request from '../../../services/axios'

type Props = {
  isVisible: boolean
  onClose: () => void
  onReset: () => void
  userId: number
}
const OpenBox:React.FC<Props> = (props):ReactElement => {
  const [amount, setAmount] = useState('0')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // const onChange = useCallback((value: string) => {
  //   if (value === '-') return Toast.show('Valor invalido.', Toast.SHORT)
  //   setAmount(Number(value))
  // }, [])

  const onPressed = useCallback(() => {
    // if (Number(amount) <= 0) {
    //   return Toast.show('Ingrese un monto valido.', Toast.SHORT)
    // }
    setIsLoading(true)
    request.post('?op=aperturaCaja', { idempleado: props.userId, montoapertura: amount })
    .then(({ data }) => {
      if (data.success === 1) {
        props.onReset()
        Toast.show('Monto registrado correctamente.', Toast.SHORT)
        props.onClose()
      } else {
        Toast.show('Ocurrio un error al momento de guardar el monto.', Toast.SHORT)
      }
    })
    .catch(err => {
      console.log('err -> ', err)
      Toast.show('Ocurrio un error al momento de guardar el monto.', Toast.SHORT)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }, [amount, props])
  return (
    <Modal
      isVisible={props.isVisible}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>APERTURA DE CAJA.</Text>
        </View>

        <Resize styles={{ height: 25 }} />

        <View pointerEvents='none'>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            placeholder='Monto de apertura'
            placeholderTextColor='gray'
            onChangeText={setAmount}
            style={styles.input}
            value={'0'}

          />
        </View>

        <Resize styles={{ height: 50 }} />

        <View style={{ alignItems: 'center' }}>
          <Button
            message='GUARDAR'
            isLoading={isLoading}
            onPressed={onPressed}
            styles={styles.button}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F8FD',
    paddingHorizontal: 12,
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    minWidth: 240,
    color: 'black'
  },
  button: {
    minWidth: 240
  },
  label: {
    fontSize: 14,
    position: 'relative',
    left: 4,
    bottom: 4,
    fontWeight: 'bold'
  }
})

export default OpenBox
