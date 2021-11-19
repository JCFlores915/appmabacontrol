import Geolocation from 'react-native-geolocation-service'

export const getCurrentPosition = (cb: (latitude: number, logitude: number) => void): void => {
  Geolocation.getCurrentPosition(({ coords: { latitude, longitude }}) => {
    cb(latitude, longitude)
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

export const watchPosition = (cb: (latitude: number, longitude: number, watchId: number) => void, ): void => {
  const watchId = Geolocation.watchPosition(({ coords: { latitude, longitude }}) => {
    cb(latitude, longitude, watchId)
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