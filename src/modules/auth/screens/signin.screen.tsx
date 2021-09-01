import React, { ReactElement, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import logo from '../../../assets/images/logo.png'

// Import components
import { Input, Button, Resize } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'

export const SignInScreen: React.FC = ():ReactElement => {
  const styles = useMemo(() => factory({ insets: { top, bottom }}), [])

  const { top, bottom } = useSafeAreaInsets()
  const { signIn } = useAuth()

  const onPressed = useCallback(() => {
    signIn()
  }, [])
  return (
    <View style={styles.screen}>
      <View>
        <Image source={logo} style={styles.logo} />
      </View>

      <Resize styles={{ height: 60 }} />

      <View style={styles.form}>
        <Input
          label='Usuario'
          customProps={{ }}
          icon={{ name: 'account' }}
          containerStyle={{ marginBottom: 18 }}
        />

        <Input
          label='Contraseña'
          icon={{ name: 'lock' }}
          customProps={{
            secureTextEntry: true,

          }}
        />
        <Resize styles={{ height: 45 }} />
        <View>
          <Button 
            onPressed={onPressed}
            message='Ingresar'
          />
        </View>
        <Resize styles={{ height: 30 }} />
        <View style={styles.content}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.text}>Ingresar con pin</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.text}>¿Olvidaste contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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