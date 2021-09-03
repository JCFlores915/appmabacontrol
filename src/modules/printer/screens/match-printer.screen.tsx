import React, { ReactElement, useMemo, useEffect, useState, useCallback, } from 'react'
import {
  View,
  Text,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItemInfo,
  ToastAndroid as Toast,
} from 'react-native'
import BluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic'
import { StateChangeEvent } from 'react-native-bluetooth-classic/lib/BluetoothEvent'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'

import { requestAccessFineLocationPermission } from '../../../services/permissions'

import { Button, Resize } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'

interface Device {
  name: string
  address: string
  id: string
  bonded?: boolean
}

export const MatchPrinterScreen:React.FC = ({ route }):ReactElement => {
  const styles = useMemo(() => factory({}), [])
  const [devices, setDevices] = useState<Array<Device>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState({ hasError: false, message: '' })
  const [isActive, setIsActive] = useState<boolean>()
  const { user, registerPrinter } = useAuth()

  useEffect(() => {
    BluetoothClassic.isBluetoothEnabled()
      .then(res => {
        setIsActive(res)
      })
      .catch(err => {
        setIsActive(false)
      })
  }, [])

  useEffect(() => {
    requestAccessFineLocationPermission()
  }, [])

  useFocusEffect(() => {
    loadDevices()
  })

  useFocusEffect(() => {
    const subscription = BluetoothClassic.onBluetoothDisabled(
      (event: StateChangeEvent) => setIsActive(event.enabled)
    )
    const enabledSubscription = BluetoothClassic.onBluetoothEnabled(
      (event: StateChangeEvent) => setIsActive(event.enabled)
    )

    return () => {
      subscription.remove();
      enabledSubscription.remove();
    }
  })

  const onActiveBluetooth = useCallback(() => {
    BluetoothClassic.requestBluetoothEnabled()
  }, [])
  
  const loadDevices = useCallback(() => {
    BluetoothClassic.getBondedDevices()
      .then((res: BluetoothDevice[]) => {
        const unpaired = _.map(res, (device: BluetoothDevice) => ({ 
          name: device.name,
          address: device.address,
          id: device.id,
          bonded: device.bonded
        })) as Device[]
        setDevices(unpaired)
      })
      .catch(err => {
        setError({ hasError: true, message: 'Ocurrio un error al mostrar los dispositivos vinculados. intente de nuevo.' })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Device>): ReactElement => {
    return (
      <TouchableOpacity disabled={item.address === user.printer?.address} onPress={() => onPressed(item)}>
        <View style={[styles.row, styles.separator]}>
          <Icon 
            name='devices-other'
            size={38}
            color='#697477'
          />
          <View style={[styles.content]}>
            <Text>{item.name}</Text>
            <Text style={styles.mac}>{item.address}</Text>
          </View>

          {item.address === user.printer?.address && (
            <View style={styles.active}>
              <Icon 
                name='check'
                size={30}
                color='#00B74A'
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }, [user])

  const onPressed = useCallback(async (device: Device) => {
    if ((user.printer?.address !== undefined) && user.printer?.address !== device.address) {
      return Alert.alert("Advertencia", "¿Quieres sobrescribir el dispositivo?", [
        {
          text: "No",
          onPress: () => {},
        },
        { text: "Si", onPress: () => {
          AsyncStorage.setItem('@storage_printer_machine', JSON.stringify(device))
            .then(() => {
              registerPrinter(device)
              Toast.show('La nueva impresora ha sido registrada correctamente.', Toast.SHORT)
            })
        }},
      ])
    }
    AsyncStorage.setItem('@storage_printer_machine', JSON.stringify(device))
      .then(() => {
        registerPrinter(device)
        Toast.show('Impresora registrada correctamente.', Toast.SHORT)
        const key = route.params?.key
        if (key && key === 'noauth') {
          route.params.signIn()
        }
      })
  }, [route.params, user])

  if (!isActive) return <View style={styles.center}>
    <Text style={{ textAlign: 'center', paddingHorizontal: 30 }}>Por favor activa el bluetooth para motrar los dispositivos vinculados.</Text>
    <Resize styles={{ height: 20 }} />
    <Button 
      message='Activar'
      onPressed={onActiveBluetooth}
      styles={styles.button}
    />
  </View>

  return (
    <View style={styles.screen}>
      <Resize styles={{ height: 10 }} />
      <Text></Text>

      <View>
        <Text style={[styles.bold, styles.size]}>Dispositivos vinculados</Text>
        <Resize styles={{ height: 10 }} />

        {loading ? (
          <ActivityIndicator
            color='#EECFD4'
            size='large'
          />
        ) : (
         <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(item, index) => JSON.stringify(item) + index}
            ListEmptyComponent={<View><Text>No hay dispositivos vinculados. Por favor proceda a vincular la impresora manualmente en su dispositivo.</Text></View>}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
         /> 
        )}
      </View>
    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#F3F8FD',
      paddingHorizontal: 20
    },
    bold: {
      fontWeight: 'bold',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    content: {
      marginLeft: 10
    },
    mac: {
      fontSize: 12,
      color: 'gray'
    },
    divider: {
      height: 1,
      backgroundColor: '#ddd'
    },
    separator: {
      paddingVertical: 12
    },
    size: {
      fontSize: 17
    },
    active: {
      position: 'absolute',
      right: 5,
      top: 20
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F3F8FD'
    },
    button: {
      backgroundColor: '#000',
      minWidth: 180
    }
  })
}
