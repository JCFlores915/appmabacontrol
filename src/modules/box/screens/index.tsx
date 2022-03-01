import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid as Toast
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

import { Button, Resize } from '../../../components/common'
import DetailsModal from '../components/details.component'

import request from '../../../services/axios'

import { useAuth } from '../../../context/auth.context'

export const CloseTheBox:React.FC = ():ReactElement => {
  const { bottom } = useSafeAreaInsets()
  const navigation = useNavigation()
  const { user } = useAuth()

  const styles = useMemo(() => factory({ insets: { bottom } }), [])

  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [data, setData] = useState()

  useEffect(() => {
    request.post('?op=detalleCierreCaja', { idempleado: user.id })
      .then(({ data }) => {
        setData(data)
      })
      .catch(err => {
        navigation.goBack()
        Toast.show('Ocurrio un error al obtener el detalle de cierre de caja.', Toast.LONG)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // const onCloseTheBox = useCallback(() => {}, [])

  const onToggle = useCallback(() => setIsVisible(prevState => !prevState), [])

  const renderItem = useCallback(({ item }): ReactElement => {
    return (
      <View style={{ paddingHorizontal: 10, marginBottom: 12 }}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row' , alignItems: 'center' }}>
            <View
              style={[styles.circle, { backgroundColor: item.estado_color }]}
            />
            <View style={{ marginLeft: 15 }}>
              <Text>{item.cedula}</Text>
              <View style={styles.row}>
                <Text style={styles.text}>{item.nombre}</Text>
                <Text style={[styles.quote, { marginLeft: 10 }]}>No. {item.cuotas}</Text>
              </View>
            </View>
          </View>


          <Text style={styles.text}>C${Number(item.saldofinal).toFixed(4)}</Text>
        </View>
      </View>
    )
  }, [])

  if (isLoading && !data) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator color='#EECFD4' size='large' />
  </View>

  return (
    <View style={styles.screen}>
      <DetailsModal
        data={data?.detalle_cuota ? [...data?.detalle_cuota] : []}
        isVisible={isVisible}
        onToggle={onToggle}
        total={data?.total.total_final}
      />
      <FlatList
        data={data?.detalle_cuota ? [...data?.detalle_cuota] : []}
        renderItem={renderItem}
        keyExtractor={(item, index) => JSON.stringify({ item, index})}
        ListHeaderComponent={<View style={[styles.row, styles.wrapper]}>
          <Text style={[styles.bold, styles.size]}>Facturados: {String(data?.conteo[0]?.facturado)}</Text>
          <Text style={[styles.bold, styles.size]}>No facturados: {String(data?.conteo[1]?.no_pagado)}</Text>
          <Text style={[styles.bold, styles.size]}>Pendientes: {String(data?.conteo[2]?.pendientes)}</Text>
        </View>}
        ListEmptyComponent={
          <View style={{ height: 1, backgroundColor: 'gray' }}>

          </View>
        }
      />

      <View style={styles.content}>
        <Button
          message='Cerrar caja'
          onPressed={onToggle}
          styles={styles.button}
        />

        <View style={styles.row}>
          <Text style={[styles.bold, styles.separator]}>Total:</Text>
          <Text>C${Number(data?.total.total_final).toFixed(4)}</Text>
        </View>
      </View>
    </View>
  )
}

const factory = (conditions: any) => {
  const { bottom } = conditions.insets
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#F3F8FD',
    },
    wrapper: {
      paddingHorizontal: 10,
      paddingVertical: 18
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: bottom,
      paddingVertical: 20,
      paddingHorizontal: 10,
      backgroundColor: '#EECFD4'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#000',
      minWidth: 180
    },
    bold: {
      fontSize: 16,
      fontWeight: 'bold'
    },
    separator: {
      marginHorizontal: 10
    },
    size: {
      fontSize: 14
    },
    circle: {
      width: 40,
      height: 40,
      borderRadius: 200
    },
    text: {
      color: 'gray',
      flexWrap: 'wrap'
    },
    quote: {
      fontWeight: 'bold'
    }
  })
}

export default CloseTheBox
