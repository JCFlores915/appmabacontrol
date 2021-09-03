import React, { ReactElement, useMemo, useEffect, useCallback, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native'

import { Resize } from '../../components/common'

import request from '../../services/axios'

export const ProfileScreen:React.FC = ({ route }):ReactElement => {
  const styles = useMemo(() => factory({}), [])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [data, setData] = useState()
  
  const clientId = route.params.clientId

  useEffect(() => {
    request.post('?op=perfilCliente', { idcliente: clientId })
      .then(res => {
        setData(res.data)
      })
      .finally(() => {
        setIsLoading(false)
      })

  }, [clientId])

  if (isLoading && !data) return <View style={styles.containerCenter}>
    <ActivityIndicator color='#EECFD4' size='large' />
  </View>

  return (
    <View style={styles.screen}>
      <Resize styles={{ height: 20 }} />
      <View style={[styles.row, { justifyContent: 'flex-start' }]}>
        <Image 
          style={styles.avatar}
          source={{ uri: 'https://thumbs.dreamstime.com/b/icono-masculino-del-avatar-en-estilo-plano-icono-masculino-del-usuario-avatar-del-hombre-de-la-historieta-91462914.jpg' }} 
        />
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.bold, styles.size]}>{data?.name}</Text>
          <Text style={styles.bold}>{data?.identification_card}</Text>
          <Resize styles={{ height: 15 }} />

          {/* <Text style={styles.bold}>Cuota No: 5</Text> */}
        </View>
      </View>

      <Resize styles={{ height: 20 }} />

      <View>
        <Text style={[styles.bold, styles.size]}>Informacion personal</Text>

        <Resize styles={{ height: 10 }} />
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Telefono: </Text>
          <Text>{data?.phone}</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Correo: </Text>
          <Text>{data?.email}</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Ciudad: </Text>
          <Text>{data?.city}</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Direccion: </Text>
          <Text>{data?.address}</Text>
        </View>
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
    containerCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    avatar: {
      borderRadius: 200,
      resizeMode: 'cover',
      height: 100,
      width: 100
    },
    bold: {
      fontWeight: 'bold',
    },
    size: {
      fontSize: 17
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wrap: {
      flexWrap: 'wrap',
      paddingVertical: 8
    }
  })
}
