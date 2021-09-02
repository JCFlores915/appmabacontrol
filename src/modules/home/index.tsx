import React, { ReactElement, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/AntDesign'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Geolocation from 'react-native-geolocation-service'

import { Button } from '../../components/common'

import { useAuth } from '../../context/auth.context'

import request from '../../services/axios'

export const HomeScreen: React.FC = ():ReactElement => {
  let watchId = 0
  const navigation = useNavigation()
  const { bottom } = useSafeAreaInsets()
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
  const styles = useMemo(() => factory({ insets: { bottom }}), [])
  const [data, setData] = useState<Array<{ latitude: number, longitude: number }>>([])
  const { user } = useAuth()

  const mapView = useRef<MapView>()

  useEffect(() => {
    request.post('?op=rutasAsignadas', { id: user.id })
      .then(response => {
        setData(response.data)
      })
  }, [])

  useEffect(() => {
    Geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setLocation({ latitude, longitude })
      if (mapView.current !== null) {
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
    }, err => {
      console.log(err)
    }, {
      distanceFilter: 0,
      enableHighAccuracy: true,
      forceRequestLocation: true,
      forceLocationManager: false,
      showLocationDialog: true
    })
  }, [mapView])

  useEffect(() => {
    if (location.latitude > 0) {
      watchId = Geolocation.watchPosition(({ coords: { latitude, longitude }}) => {
        setLocation({ latitude, longitude })
      }, (error) => {
        console.log(error)
      },
      {
        distanceFilter: 0,
        enableHighAccuracy: true,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true
      })
    }

    return () => {
      Geolocation.clearWatch(watchId)
    }
  }, [location])

  const onPressed = useCallback(() => navigation.navigate('/closethebox', { }),[])
  
  const onPressedConfig = useCallback(() => navigation.navigate('/match-printer'), [])

  const onPressedMarker = useCallback(() => navigation.navigate('/scanner', { }), [])

  if (location.latitude <= 0) return <View style={{ backgroundColor:'red', flex:1}} />

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapView}
        loadingEnabled
        showsUserLocation
        followsUserLocation
        style={styles.screen}
        loadingBackgroundColor='#fff'
        loadingIndicatorColor='#EECFD4'
      >
        
        {_.map(data, (item, index) => {
          return (
            <View key={JSON.stringify({ item, index})}>
              <Marker
                onPress={onPressedMarker}
                coordinate={{ latitude: Number(item.latitude), longitude: Number(item.longitude) }}
              />
            </View>
          )
        })}
        <Polyline
          coordinates={[ { latitude: location.latitude, longitude: location.longitude }, ..._.map(data, item => ({ latitude: Number(item.latitude), longitude: Number(item.longitude) }))]}
          strokeColor="#000"
          strokeWidth={2}
        />
      </MapView>
      <View style={styles.container}>
        <Button
          message='CERRAR CAJA DE LA RUTA'
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
    }
  })
}