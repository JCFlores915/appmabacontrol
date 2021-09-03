import React, { ReactElement, useCallback, useMemo, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid as Toast
} from 'react-native'
import QRCodeScanner from "react-native-qrcode-scanner"
import { BarCodeReadEvent } from 'react-native-camera'
import { useNavigation } from '@react-navigation/native'
import { BLEPrinter } from 'react-native-thermal-receipt-printer'

import { Button, Resize } from '../../components/common'

import request from '../../services/axios'
import { useAuth } from '../../context/auth.context'

export const ScannerScreen:React.FC = ({ route }):ReactElement => {
  const styles = useMemo(() => factory({ }), [])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { user } = useAuth()
  const [data, setData] = useState()
  const navigation = useNavigation()
  
  const clientId = route.params.clientId
console.log(data)
  useEffect(() => {
    request.post('?op=detallesCliente', { idcliente: clientId })
      .then(res => {
        setData(res.data)
        console.log(res.data)
      })
      .finally(() => {
        setIsLoading(false)
      })

  }, [clientId])

  const printer = useCallback((info) => {
    request.post('', {})
      .then(res => {
        BLEPrinter.init();
        BLEPrinter.connectPrinter(user.printer?.address)
          .then(() => {
            const date = new Date()
            BLEPrinter.printBill(`
<C><B>Recibo de Pago</B></C>
<C>Cliente: Juan Perez</C>
<C>Fecha Actual: ${date.getDay()}-${date.getMonth()}-${date.getFullYear()}</C>
<C>Correspondiente al mes: mayo de 2021</C>
<C>Cobrador: Enrique Perez</C>


<L>C$2,000</L>
<L>SALDO ANTERIOR</L>
<C>C$300</C>
<C>ESTE</C>
<R>C$1,700</R>
<R>SALDO NUEVO</R>

Y Recuerde
<M>FUNERARIA BARRANTES</M>
es la mas grande y segura en quien confiar!`)
          })
          .catch(err => {
            Toast.show('Error al conectarse con la impresora.', Toast.SHORT)
          })
      })
      .catch(err => {
        Toast.show('Ocurrio un error al generar la factura, por favor intente de nuevo.', Toast.SHORT)
      })
      .finally(() => {

      })
  }, [user])

  const onRead = useCallback((e: BarCodeReadEvent) => {
    if (e.data !== null) {
      const types = e.data.split('/')
      if (types[0] === data?.identification_card && types[1] === data?.data_fee.idenvoice) {
        request.post('?op=facturarCuota', { idcuota: data?.data_fee.iddetail })
          .then(res => {
            switch (res.data.success) {
              case 0:
                Toast.show(res.data.message, Toast.SHORT)
                break
              case 1:
                printer(data)
                Toast.show(res.data.message, Toast.SHORT)
                break
            }
          })
          .catch(err => {
            Toast.show('Ocurrio un error al generar la factura, por favor intente de nuevo.', Toast.SHORT)
          })
      } else {
        Toast.show('El codigo qr que esta escaneando no pertenece a este contrato.', Toast.SHORT)
      }
    }
  }, [data])
  
  const onPressed = useCallback(() => navigation.navigate('/profile', { clientId }), [clientId])

  if (isLoading && !data) return <View style={styles.containerCenter}>
    <ActivityIndicator color='#EECFD4' size='large' />
  </View>
  return (
    <View style={styles.screen}>
      <QRCodeScanner
        cameraStyle={{ height: '45%', width: '100%' }}
        markerStyle={styles.marker}
        showMarker
        onRead={onRead}
        bottomContent={
          <View style={styles.container}>
            <Text style={[styles.text, { fontSize: 24 }]}>CUOTA NO: {String(data?.data_fee.number_fee)}</Text>

            <Resize styles={{ height: 5 }} />
            <Text style={[styles.text, { fontSize: 15 }]}>Nombre: {data.name}</Text>
            <Resize styles={{ height: 10 }} />

            <Text style={[styles.text, { fontSize: 18 }]}>Cedula: {data.identification_card}</Text>
            <Resize styles={{ height: 30 }} />

            <View style={[]}>
              <Button
                styles={styles.button}
                onPressed={onPressed}
                message='Detalle del cliente'
              />
            </View>

            <Resize styles={{ height: 10 }} />
          </View>
        }
      />
    </View>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#F3F8FD',
    },
    containerCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    marker: {},
    container: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
    },
    bold: {},
    button: {
      backgroundColor: '#000',
      minWidth: 180
    },
    text: {}
  })
}