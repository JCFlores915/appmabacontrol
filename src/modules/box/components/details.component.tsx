import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid as Toast
} from 'react-native'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Button, Resize, Input } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'

import request from '../../../services/axios'

type Props = {
  isVisible: boolean
  onToggle: () => void
}
const DetailsModal:React.FC<Props> = (props):ReactElement => {
  let timeoutId: NodeJS.Timeout
  const { user, signOut } = useAuth()
  const styles = useMemo(() => factory({ }), [])
  const [values, setValues] = useState({ cordoba: '', dolar: '0', total: '' })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (values.cordoba && values.dolar) {
      setValues(prevState => {
        const calc = Number(prevState.dolar) * 35.75
        return {
          ...prevState,
          total: String(calc)
        }
      })
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [values.cordoba])

  const onPressed = useCallback(() => {
    if (!values.cordoba) return Toast.show('Ingrese el total en cordoba.', Toast.SHORT)

    setIsLoading(true)
    request.post('?op=cierreCaja', {
      idempleado: user.id,
      idoperaciones: user.idapartura,
      montocierrecordoba: values.cordoba,
      montocierredolar: values.dolar,
      montoconversion: values.total,
      totalcierre: Number(values.cordoba) + Number(values.total)
    })
      .then(({ data }) => {
        if (data.success === 1) {
          props.onToggle()
          Toast.show('Cierre de caja registrado correctamente.', Toast.SHORT)
          timeoutId = setTimeout(() => {
            signOut()
            Toast.show('Su ruta de cobro a finalizado.', Toast.SHORT)
          }, 2000)
          return
        }
        Toast.show('Ocurrio un error al cerrar la caja, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      })
      .catch(() => {
        Toast.show('Ocurrio un error, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [values, user, props])

  const onChange = useCallback((value: string, key: string) => {
    if (value === '-') return
    setValues(prevState => ({ ...prevState, [key]: value }))
  }, [])

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
          <Input
            label='Total cordoba'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'cordoba'),
              keyboardType: 'numeric',
              value: values.cordoba
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
          />

          <Input
            label='Total dolar'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'dolar'),
              value: values.dolar,
              keyboardType: 'numeric',
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
          />

          <Input
            label='Total conversion'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'total'),
              keyboardType: 'numeric',
              value: values.total,
              editable: false
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
          />

          <Resize styles={{ height: 40 }} />
          <Button 
            isLoading={isLoading}
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
