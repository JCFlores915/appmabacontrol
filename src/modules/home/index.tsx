import React, { ReactElement, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import MapView, { Marker, Polyline, MarkerAnimated } from 'react-native-maps'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/AntDesign'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Geolocation from 'react-native-geolocation-service'

import { Button, Resize } from '../../components/common'

import { useAuth } from '../../context/auth.context'

import request from '../../services/axios'

interface LatLng {
  latitude: number
  longitude: number
  heading?: number
}
const latitude = 11.930716577776334, longitude =-85.95514852399023
export const HomeScreen: React.FC = ():ReactElement => {
  const navigation = useNavigation()
  const { bottom } = useSafeAreaInsets()
  const [location, setLocation] = useState<LatLng>({ latitude: 0, longitude: 0 })
  const styles = useMemo(() => factory({ insets: { bottom }}), [])
  const [data, setData] = useState<Array<{ latitude: number, longitude: number, idclient: number, cancel: number, color_status: string }>>([])
  const { user } = useAuth()

  const mapView = useRef<MapView>()
  const marker = useRef<MarkerAnimated>()

  useFocusEffect(() => {
    request.post('?op=rutasAsignadas', { id: user.id })
      .then(response => {
        setData(response.data)
      })
  })

  useEffect(() => {
    Geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setLocation({ latitude, longitude })
      if (mapView.current !== undefined) {
        mapView.current.animateCamera({
          center: {
            latitude,
            longitude,
          },
          pitch: 0,
          heading: 0,
          altitude: 1000,
          zoom: 15,
        })
      }
      console.log('geolocation  => ', latitude, longitude)
    }, err => {
      console.log(err)
    }, {
      distanceFilter: 0,
      enableHighAccuracy: true,
      showLocationDialog: true
    })
  }, [mapView])

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

  if (location.latitude <= 0) return <View style={styles.center}>
    <ActivityIndicator color='#EECFD4' size='large' />
    <Resize styles={{ height: 20 }} />
    <Text>Obteniendo ubicacion, por favor espere.</Text>
  </View>

  return (
    <View style={styles.screen}>
      <MapView
        // initialRegion={{ latitude, longitude, latitudeDelta: 0.0143, longitudeDelta: 0.0134 }}
        ref={mapView}
        loadingEnabled
        // showsUserLocation
        // followsUserLocation
        style={styles.screen}
        loadingIndicatorColor='#EECFD4'
        loadingBackgroundColor='#F3F8FD'
        customMapStyle={require('../../../style.json')}
      >
        <MarkerAnimated
          ref={marker}
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
        >
          <IconFontAwesome 
            name='truck-moving'
            size={30}
            color='gray'
          />
        </MarkerAnimated>

        {_.map(data, (item, index) => {
          return (
            <View key={JSON.stringify({ item, index})}>
              <Marker
                pinColor={item.color_status}
                coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
                onPress={() => (Number(item.cancel) === 0 || Number(item.cancel) === 2) ? onPressedMarker(item.idclient) : {}}
              />
            </View>
          )
        })}
        <Polyline
          coordinates={[ { latitude: location.latitude, longitude: location.longitude }, ..._.map(data, item => ({ latitude: Number(item.latitude), longitude: Number(item.longitude) }))]}
          strokeColor="#000"
          strokeWidth={2}
        />
        {/* <Circle
          radius={30}
          fillColor='#000'
          strokeColor='#000'
          strokeWidth={3}
          center={{ latitude: location.latitude, longitude: location.longitude }}
        /> */}
      </MapView>
      <View style={styles.container}>
        <Button
          message='Cerrar caja de la ruta'
          onPressed={onPressed}
          styles={styles.button}
        />
        <TouchableOpacity onPress={onPressedConfig}>
          <Icon name="setting" size={30} color="#000" />
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