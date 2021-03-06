import React, { ReactElement, useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ToastAndroid as Toast
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import logo from '../../../assets/images/logo.png'

import request from '../../../services/axios'

// Import components
import { Input, Button, Resize } from '../../../components/common'
import ResetNewPassword from '../components/reset-new-password.component'
import OpenBox from '../components/open-box.component'

// Import custom hooks
import { useAuth } from '../../../context/auth.context'

export const SignInScreen: React.FC = ():ReactElement => {
  const { signIn } = useAuth()
  const navigation = useNavigation()
  const { top, bottom } = useSafeAreaInsets()
  const styles = useMemo(() => factory({ insets: { top, bottom }}), [])
  const [userId, setUserId] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [values, setValues] = useState({ 
    username: { isValid: true, value: '', }, 
    password: { isValid: true, value: '' } 
  })
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isVisibleBox, setIsVisibleBox] = useState<boolean>(false)

  const onReset = useCallback(() => {
    setValues({
      username: { isValid: true, value: '', }, 
      password: { isValid: true, value: '' } 
    })
  }, [])

  const authenticate = useCallback((user) => {
    signIn(user)
  }, [])

  const onPressed = useCallback(() => {
    if (!values.username.value.trim() || !values.password.value) return Toast.show('Todos los campos son obligatorios.', Toast.SHORT)
    setIsLoading(true)
    request.post('?op=inicioSesion', { usuario: values.username.value, clave: values.password.value })
      .then(async response => {
        const type = Number(response.data.success)
        switch (type) {
          case 0:
            Toast.show('Usuario o contrase??a son incorrectos.', Toast.SHORT)
            break
          case 1:
            setUserId(response.data.data.id)
            const value = Number(response.data.data.first_start)
            if (value === 0) {
              const id = Number(response.data.data.idapartura)
              if (id === 0) {
                return setIsVisibleBox(true)
              } else {
                authenticate(response.data.data)
              }
            } else if (value === 1) {
              setIsVisible(true)
            }
            break
        }
      })
      .catch((err) => {
        Toast.show(JSON.stringify(err, null, 3), Toast.LONG)
        // Alert.alert()
        // Toast.show('Ocurrio un error, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [values])

  const onChange = useCallback((value: string, key: 'username' | 'password') => {
    setValues(prevState => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        value
      }
    }))
  }, [])

  return (
    <ScrollView
      keyboardShouldPersistTaps='always'
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.screen}>
        <ResetNewPassword
          username={userId}
          onReset={onReset}
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />

        <OpenBox 
          userId={userId}
          onReset={onReset}
          isVisible={isVisibleBox}
          onClose={() => setIsVisibleBox(false)}
        />

        <View>
          <Image source={logo} style={styles.logo} />
        </View>

        <Resize styles={{ height: 60 }} />

        <View style={styles.form}>
          <Input
            label='Usuario'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'username'),
              value: values.username.value
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
            />

          <Input
            label='Contrase??a'
            icon={{ name: 'lock' }}
            customProps={{
              secureTextEntry: true,
              onChangeText: (value: string) => onChange(value, 'password'),
              value: values.password.value
            }}
            />
          <Resize styles={{ height: 45 }} />
          <View>
            <Button
              isLoading={isLoading}
              onPressed={onPressed}
              message='Ingresar'
              />
          </View>
          <Resize styles={{ height: 30 }} />
          {/* <View style={styles.content}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.text}>Ingresar con pin.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.text}>??Olvidaste contrase??a?</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    </ScrollView>
  )
}

const factory = (conditions: any) => {
  const { top, bottom } = conditions
  return StyleSheet.create({
    screen: {
      flex: 1,
      marginTop: top,
      marginBottom: bottom,
      backgroundColor: '#F3F8FD',
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    logo: {
      width: 210,
      height: 120,
      resizeMode: 'contain'
    },
    form: {
      paddingHorizontal: 8,
      width: '100%'
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    text: {
      fontSize: 12,

    }
  })
}