import React, { ReactElement, useCallback, useMemo, useState } from 'react'

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ToastAndroid as Toast
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Resize, Input } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'
import request from '../../../services/axios'

export const ExpensesScreen:React.FC = (props):ReactElement => {
  const { bottom } = useSafeAreaInsets()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const { user } = useAuth()

  const styles = useMemo(() => factory({ insets: { bottom } }), [])

  const onSubmit = useCallback(() => {
    if (description.trim() === '' || amount.trim() === '') {
      return Toast.show('Todos los campos son obligatorios.', Toast.SHORT)
    }
    setIsFetching(true)
    request.post('?op=insertarGatosAdministrativos', { idempleado: user.id, descripcion: description, monto: amount })
      .then(({ data }) => {
        if (data.success === 1) {
          Toast.show('Guardado correctamente.', Toast.SHORT)
          props.navigation.goBack()
        } else {
          Toast.show('Ocurrio un error, por favor intenta de nuevo o mas tarde.', Toast.SHORT)
        }
      })
      .catch(err => {
        Toast.show('Ocurrio un error, por favor intenta de nuevo o mas tarde.', Toast.SHORT)
      })
      .finally(() => {
        setIsFetching(false)
      })
  }, [description, props.navigation, amount, user])

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Resize styles={{ height: 10 }} />
          <Text style={styles.label}>Descripcion</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder=''
            placeholderTextColor='gray'
            multiline
            style={{
              borderRadius: 10,
              height: 100,
              width: '100%',
              borderWidth: 1,
              borderColor: '#ddd',
              paddingVertical: 0,
              paddingHorizontal: 10,
              color: '#000',
              backgroundColor: '#fbfbfb'
            }}
          />

          <Resize styles={{ height: 25 }} />
          <Input
            label='Monto'
            customProps={{
              onChangeText: (value: string) => setAmount(value),
              value: amount,
              keyboardType: 'number-pad'
            }}
            icon={{ name: 'call-missed' }}
            containerStyle={{ marginBottom: 18 }}
          />

        </View>
      </ScrollView>
      <View style={styles.content}>
        <Button
          message='Guardar gasto'
          onPressed={onSubmit}
          isLoading={isFetching}
          styles={{ backgroundColor: '#000', minWidth: 240 }}
          activityIndicatorColor={'#fbfbfb'}
        />
      </View>
    </View>
  )
}

const factory = (conditions: any) => {
  const { bottom } = conditions.insets
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#F3F8FD',
    },
    label: {
      fontSize: 14,
      position: 'relative',
      left: 4,
      bottom: 4,
      fontWeight: 'bold'
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: bottom,
      paddingVertical: 20,
      paddingHorizontal: 10,
      backgroundColor: '#EECFD4'
    },
  })
}
