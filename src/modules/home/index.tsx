import React, { ReactElement, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import Geolocation from 'react-native-geolocation-service'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/AntDesign'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '../../components/common'

import { useAuth } from '../../context/auth.context'

import request from '../../services/axios'

const data = [
  {
    "latitude": 11.931419184389728,
    "longitude": -85.9435317961521
  },
  {
    "latitude": 11.936436968424271,
    "longitude":  -85.95526180870522,
  },
  {
    "latitude": 11.928642799882043,
    "longitude": -85.96051289274196,
  },
  {
    "latitude": 11.921902741975723,
    "longitude": -85.95412769664465,
  },
]

export const HomeScreen: React.FC = ():ReactElement => {
  let watchId = 0
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
  const { bottom } = useSafeAreaInsets()
  const styles = useMemo(() => factory({ insets: { bottom }}), [])
  const [data, setData] = useState([])
  const { user } = useAuth()

  const mapView = useRef<MapView>()

  useEffect(() => {
    request.post('?op=')
      .then(response => {

      })
  }, [])

  useEffect(() => {
    Geolocation.getCurrentPosition(({ coords: { latitude, longitude }}) => {
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

  const onPressed = useCallback(() => {},[])
  const onPressedConfig = useCallback(() => {}, [])

  if (_.size(location) <= 0) return <View />

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
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              />
            </View>
          )
        })}
        <Polyline
          coordinates={[ { longitude: location.longitude, latitude: location.latitude },...data]}
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