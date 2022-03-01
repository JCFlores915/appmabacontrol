import React, { ReactElement, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid as Toast
} from 'react-native'
import MapView, { Marker, Callout, Polyline, MarkerAnimated } from 'react-native-maps'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/AntDesign'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Geolocation from 'react-native-geolocation-service'

import { Button, Resize } from '../../components/common'

import { useAuth } from '../../context/auth.context'

import request from '../../services/axios'

import { getDirections } from '../../utils'
import { useLocation } from '../../hooks/useLocation'

import {
  COMMANDS,
  BLEPrinter
} from 'react-native-thermal-receipt-printer-image-qr'

interface LatLng {
  latitude: number
  longitude: number
  heading?: number
}
export const HomeScreen: React.FC = ():ReactElement => {
  const navigation = useNavigation()
  const { bottom, top } = useSafeAreaInsets()
  const {location, loading} = useLocation()
  const styles = useMemo(() => factory({ insets: { bottom }}), [])
  const [data, setData] = useState<Array<{ latitude: number, longitude: number, idclient: number, cancel: number, color_status: string, name: string }>>([])
  const [coords, setCoords] = useState<Array<LatLng>>([])
  const [state, setState] = useState<{ latitude: number, longitude: number, idclient: number, cancel: number, color_status: string, name: string }>()
  const [clientId, setClientId] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user, signOut } = useAuth()

  const mapView = useRef<MapView>()
  const marker = useRef<MarkerAnimated>()

  useFocusEffect(() => {
    request.post('?op=rutasAsignadas', { id: user.id })
      .then(response => {
        setData(response.data)
      })
  })

  useEffect(() => {
    if (!loading && location.latitude > 0) {
      if (mapView.current !== undefined) {
        mapView.current.animateCamera({
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 0,
          heading: 0,
          altitude: 1000,
          zoom: 15,
        })
      }
    }
  }, [loading, location, mapView])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const watchId = Geolocation.watchPosition(({ coords: { latitude, longitude, heading } }) => {
        if (marker.current) {
          marker.current.animateMarkerToCoordinate({ latitude, longitude }, 7000)
        }
      }, err => {
        console.log(err)
      }, {
        distanceFilter: 0,
        enableHighAccuracy: true,
        showLocationDialog: true
      })
  
      return () => {
        Geolocation.clearWatch(watchId)
      }
    }, 8000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])


  const onPressed = useCallback(() => navigation.navigate('/closethebox', { }),[])
  const onPressedExpreses = useCallback(() => navigation.navigate('/expenses'), [])
  
  const onPressedConfig = useCallback(() => navigation.navigate('/match-printer'), [])

  const onPressedMarker = useCallback((clientId: number) => {
    if (!user.printer?.address) {
      return Alert.alert('Advertencia', 'No tienes vinculada una impresora, antes de continuar por favor vincula la impresora.', [
        { text: 'OK', onPress: () => {
          navigation.navigate('/match-printer')
        }}
      ])
    }
    navigation.navigate('/scanner', { clientId })
  }, [user])

  const onPressedRoute = useCallback((latlng: LatLng, id: number, item) => {
    // console.log('onPressedRoute -> ', location)
    if (clientId !== id) {
      setIsLoading(true)
      getDirections(location.latitude + ',' + location.longitude, latlng.latitude + ',' + latlng.longitude)
        .then(coords => {
          setClientId(id)
          setState(item)
          setCoords(coords)
        })
        .catch(err => {
          console.log('err -> ', err)
          Toast.show('Ocurrio un error al intentar trazar la ruta.', Toast.SHORT)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [location, state, clientId])

  const onPressedLogout = useCallback(() => {
    Alert.alert('CERRAR SESION', '¿Seguro que quieres cerrar la sesion?', [
      { text: 'NO', onPress: () => {} },
      { text: 'SI', onPress: () => {
        signOut()
      }}
    ])
  }, [])
  const onPressedDrawRoute = useCallback((item) => {
    onPressedRoute({ latitude: Number(item.latitude), longitude: Number(item.longitude) }, item.idclient, item)
  }, [location, state, clientId])

  return (
    <View style={styles.screen}>
      <MapView
        provider='google'
        ref={mapView}
        loadingEnabled
        style={styles.screen}
        loadingIndicatorColor='#EECFD4'
        loadingBackgroundColor='#F3F8FD'
        customMapStyle={require('../../../style.json')}
      >
        <MarkerAnimated
          ref={marker}
          coordinate={{ latitude: location?.latitude, longitude: location?.longitude }}
        >
          <IconFontAwesome 
            name='truck-moving'
            size={20}
            color='gray'
          />
        </MarkerAnimated>

        {_.map(data, (item, index) => {
          return (
            <View key={JSON.stringify({ item, index})}>
              <Marker
                pinColor={item.color_status}
                coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
                onPress={() => (Number(item.cancel) === 0 || Number(item.cancel) === 2) ? onPressedDrawRoute(item) : {}}
              />
              <Marker
                coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
                anchor={{ x: 0, y: 0 }}
              >
                <View>
                  <Text style={{ color: '#212121', fontWeight: 'bold' }}>{item.name}</Text>
                </View>
              </Marker>
            </View>
          )
        })}
        {coords.length > 0 && (
          <Polyline
            coordinates={coords}
            strokeColor="#115F83"
            strokeWidth={3}
          />
        )}
      </MapView>

      {isLoading && (
        <View style={{
          width: '100%',
          height: '100%',
          flex: 1,
          position: 'absolute',
          top: top,
          left: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{ }}>
            <ActivityIndicator color='#000' size='large' />
          </View>
        </View>
      )}

      <View style={{
        width: '100%',
        height: 150,
        position: 'absolute',
        top: 30 + top,
        left: 0,
      }}>
        {state && (
          <View style={{
            // backgroundColor: '#000',
            borderRadius: 10,
            paddingHorizontal: 10,
            marginHorizontal: 40,
            paddingVertical: 5,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row'
          }}>
            <TouchableOpacity onPress={ () => onPressedMarker(state.idclient)}>
              <View style={{ 
                marginVertical: 10,
                backgroundColor: '#000',
                paddingHorizontal:20,
                paddingVertical: 10,
                borderRadius: 200,
                minWidth: 220,
                }}>
                  <Text style={{
                    color: '#fff',
                    textAlign: 'center'
                  }}>Realizar pago</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <Button
            message='Cerrar ruta'
            onPressed={onPressed}
            styles={styles.button}
          />
          <Resize styles={{ width: 20 }} />
          <Button
            message='Agregar gastos'
            onPressed={onPressedExpreses}
            styles={styles.button}
          />
        </View>

        <TouchableOpacity onPress={onPressedConfig}>
          <Icon name="setting" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={{
        position: 'absolute',
        top: top + 15,
        right: 12,

      }}>
        <TouchableOpacity onPress={onPressedLogout}>
          <Icon name="logout" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const factory = (conditions: any) => {
  const { bottom } = conditions.insets
  return StyleSheet.create({
    screen: {
      flex: 1,
      position: 'relative'
    },
    container: {
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      bottom: bottom + 40,
      flexWrap: 'wrap',
      width: '100%',
      zIndex: 999,
      left: 0
    },
    button: {
      backgroundColor: '#000',
    },
    center: {
      flex: 1,
      backgroundColor:'#F3F8FD',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
}