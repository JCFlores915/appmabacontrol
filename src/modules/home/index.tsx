import React, { ReactElement, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import MapView, { Marker, Polyline, Circle } from 'react-native-maps'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/AntDesign'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
// import Geolocation from 'react-native-geolocation-service'

import { Button, Resize } from '../../components/common'

import { useAuth } from '../../context/auth.context'

import request from '../../services/axios'

const latitude = 11.930716577776334, longitude =-85.95514852399023
export const HomeScreen: React.FC = ():ReactElement => {
  const navigation = useNavigation()
  const { bottom } = useSafeAreaInsets()
  const [location, setLocation] = useState({ latitude, longitude })
  const styles = useMemo(() => factory({ insets: { bottom }}), [])
  const [data, setData] = useState<Array<{ latitude: number, longitude: number, idclient: number, cancel: number }>>([])
  const { user } = useAuth()

  const mapView = useRef<MapView>()

  useFocusEffect(() => {
    request.post('?op=rutasAsignadas', { id: user.id })
      .then(response => {
        setData(response.data)
      })
  })

  useEffect(() => {
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
    // Geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
    //   console.log('geolocation  => ', latitude, longitude)
    // }, err => {
    //   console.log(err)
    // }, {
    //   distanceFilter: 0,
    //   enableHighAccuracy: true,
    //   showLocationDialog: true
    // })
  }, [mapView])

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

  // if (location.latitude <= 0) return <View style={styles.center}>
  //   <ActivityIndicator color='#EECFD4' size='large' />
  //   <Resize styles={{ height: 20 }} />
  //   <Text>Obteniendo ubicacion, por favor espere.</Text>
  // </View>

  return (
    <View style={styles.screen}>
      <MapView
        initialRegion={{ latitude, longitude, latitudeDelta: 0.0143, longitudeDelta: 0.0134 }}
        ref={mapView}
        loadingEnabled
        // showsUserLocation
        // followsUserLocation
        style={styles.screen}
        loadingIndicatorColor='#EECFD4'
        loadingBackgroundColor='#F3F8FD'
        customMapStyle={require('../../../style.json')}
      >
        
        {_.map(data, (item, index) => {
          return (
            <View key={JSON.stringify({ item, index})}>
              <Marker
                pinColor={(Number(item.cancel) || 0) === 0 ? 'red' : 'blue'}
                coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
                onPress={() => (Number(item.cancel) || 0) === 0 ? onPressedMarker(item.idclient) : {}}
              />
            </View>
          )
        })}
        <Polyline
          coordinates={[ { latitude: location.latitude, longitude: location.longitude }, ..._.map(data, item => ({ latitude: Number(item.latitude), longitude: Number(item.longitude) }))]}
          strokeColor="#000"
          strokeWidth={2}
        />
        <Circle
          radius={30}
          fillColor='#000'
          strokeColor='#000'
          strokeWidth={3}
          center={{ latitude: location.latitude, longitude: location.longitude }}
        />
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