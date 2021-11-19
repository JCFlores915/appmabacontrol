import { useEffect, useState } from 'react'
import Geolocation from 'react-native-geolocation-service'
interface LatLng {
  latitude: number
  longitude: number
  heading?: number
}
export const useLocation = () => {
  const [location, setLocation] = useState<LatLng>({ latitude: 0, longitude: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setLocation({ latitude, longitude })
      setLoading(false)
    }, err => {
      console.log(err)
      setLoading(false)
    }, {
      distanceFilter: 0,
      enableHighAccuracy: true,
      showLocationDialog: true
    })
  },[])

  return { location, loading }
}