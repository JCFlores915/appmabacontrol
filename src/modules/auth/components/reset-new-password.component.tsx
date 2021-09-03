import React, { ReactElement, useMemo, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid as Toast
} from 'react-native'
import Modal from 'react-native-modal'

// Import components
import { Input, Button, Resize } from '../../../components/common'

import request from '../../../services/axios'

type Props = {
  isVisible: boolean
  username: number
  onReset: () => void
  onClose: () => void
}
const ResetNewPassword:React.FC<Props> = (props):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [values, setValues] = useState({
    password: { isValid: true, value: '', },
    newPassword: { isValid: true, value: '' },
    confirmNewPassword: { isValid: true, value: '' }
  })
  const {
    isVisible = false
  } = props

  const onChange = useCallback((value: string, key: 'password' | 'newPassword' | 'confirmNewPassword') => {
    setValues(prevState => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        value
      }
    }))
  }, [])

  const onPressed = useCallback(() => {
    if (!values.password.value || !values.newPassword.value || !values.confirmNewPassword.value) return Toast.show('Todos los campos son obligatorios.', Toast.SHORT)
    if (values.newPassword.value !== values.confirmNewPassword.value) {
      return Toast.show('Las nuevas contraseñas no coinciden.', Toast.SHORT)
    }
    if (values.password.value === values.newPassword.value) return Toast.show('La contraseña nueva no puede ser igual a la contraseña actual.', Toast.SHORT)
    setIsLoading(true)
    request.post('?op=actualizarPrimerInicio', { id: props.username, clave: values.password.value, nuevaclave: values.newPassword.value })
      .then(response => {
        const type = Number(response.data.success)
        switch (type) {
          case 0:
            Toast.show('La contraseña actual es invalida.', Toast.SHORT)
            break
          case 1:
            Toast.show('Contraseña actualizada correctamente.', Toast.SHORT)
            props.onReset()
            props.onClose()
            break
        }
      })
      .catch(err => {
        Toast.show('Usuario o contraseña son incorrectos.', Toast.SHORT)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [values, props])

  return (
    <Modal
      isVisible={isVisible}
    >
      <View style={styles.container}>
        <Text>Por politicas de seguridad, por ser primer inicio de sesion con su usuario debe cambiar contraseña.</Text>

        <Resize styles={{ height: 20 }} />
        <View>
          <Input 
            label='Contraseña actual'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'password'),
              value: values.password.value,
              secureTextEntry: true
            }}
            icon={{ name: 'lock' }}
            containerStyle={{ marginBottom: 22 }}            
          />

          <Input 
            label='Nueva contraseña'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'newPassword'),
              value: values.newPassword.value,
              secureTextEntry: true
            }}
            icon={{ name: 'lock' }}
            containerStyle={{ marginBottom: 22 }}            
          />

          <Input 
            label='Confirmar contraseña'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'confirmNewPassword'),
              value: values.confirmNewPassword.value,
              secureTextEntry: true
            }}
            icon={{ name: 'lock' }}           
          />

          <Resize styles={{ height: 45 }} />
          <View>
            <Button
              isLoading={isLoading}
              onPressed={onPressed}
              message='Actualizar'
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    container: {
      backgroundColor: '#F3F8FD',
      paddingHorizontal: 12,
      paddingVertical: 20
    }
  })
}

export default ResetNewPassword
