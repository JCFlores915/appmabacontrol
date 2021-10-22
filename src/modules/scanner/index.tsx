import React, { ReactElement, useCallback, useMemo, useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid as Toast
} from 'react-native'
import QRCodeScanner from "react-native-qrcode-scanner"
import { BarCodeReadEvent } from 'react-native-camera'
import { useNavigation } from '@react-navigation/native'
import { BLEPrinter } from 'react-native-thermal-receipt-printer'

import { Button, Resize, Input } from '../../components/common'

import Modal from 'react-native-modal'

import request from '../../services/axios'
import { useAuth } from '../../context/auth.context'

export const ScannerScreen:React.FC = ({ route }):ReactElement => {
  const navigation = useNavigation()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [data, setData] = useState()
  const [description, setDescription] = useState('')
  
  const styles = useMemo(() => factory({ }), [])
  const clientId = route.params.clientId
  useEffect(() => {
    request.post('?op=detallesCliente', { idcliente: clientId })
      .then(res => {
        setData(res.data)
      })
      .finally(() => {
        setIsLoading(false)
      })

  }, [clientId])

  const printer = useCallback((info) => {
    request.post('?op=reciboCuota', { idfactura: info.data_fee.idenvoice, idcuentaporcobrar: info.data_fee.idreceivable, iddetallecuota: info.data_fee.iddetail })
      .then(res => {
        BLEPrinter.init();
        BLEPrinter.connectPrinter(user.printer?.address)
          .then(() => {
            const date = new Date()
            BLEPrinter.printBill(`
<C><B>Recibo de Pago</B></C>

<C>Cliente: ${res.data.client || info.name}</C>
<C>Fecha Actual: ${date.getDay()}-${date.getMonth()}-${date.getFullYear()}</C>
<C>Correspondiente al mes: ${res.data.date_fee}</C>
<C>Cobrador: ${res.data.employee}</C>

<C>Tipo de cambio: 35.40</C>

<L>SALDO ANTERIOR: C$${Number(res.data.previous_balance).toFixed(4)}</L>
<L>ESTE: C$${Number(res.data.this).toFixed(4)}</L>
<L>SALDO NUEVO: C$${Number(res.data.new_balance).toFixed(4)}</L>

Y Recuerde
<M>FUNERARIA BARRANTES</M>
es la mas grande y segura en quien confiar!`)
            navigation.goBack()
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
  }, [user, navigation])

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

  const onSubmit = useCallback(() => {
    if (description.trim() === '') {
      return Toast.show('Ingresa la descripcion.', Toast.SHORT)
    }
    setIsFetching(true)
    request.post('?op=reciboNoPagado', { iddetallecuota: data?.data_fee.iddetail, description  })
      .then(({ data }) => {
        if (data.success === 1) {
          Toast.show('Registrado correctamente.', Toast.SHORT)
          setIsVisible(false)
          navigation.goBack()
        } else {
          Toast.show('Ocurrio un error, por favor intenta de nuevo o mas tarde.', Toast.SHORT)
        }
      })
      .catch(err => {
        Toast.show('Ocurrio un error, por favor intenta de nuevo o mas tarde.', Toast.SHORT)
      })
      .finally(() => {
        setIsFetching(false)
      })
  }, [description, data, navigation])

  if (isLoading && !data) return <View style={styles.containerCenter}>
    <ActivityIndicator color='#EECFD4' size='large' />
  </View>
  return (
    <View style={styles.screen}>
      <Modal
        isVisible={isVisible}
      >
        <View style={styles.modal}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>RECIBO NO CANCELADO.</Text>
          <Resize styles={{ height: 15 }} />
          <Text style={{ color: 'gray', left: 5, bottom: 3 }}>Motivo.</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder='Descripcion'
            placeholderTextColor='gray'
            multiline
            style={{
              borderRadius: 10,
              height: 100,
              width: '100%',
              borderWidth: 1,
              borderColor: '#ddd',
              paddingVertical: 0,
              paddingHorizontal: 10,
              color: '#000'
            }}
          />
          <Resize styles={{ height: 25 }} />
          <Button
            message='Aceptar'
            onPressed={onSubmit}
            isLoading={isFetching}
            styles={{ backgroundColor: '#000'}}
          />
        </View>
      </Modal>
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

            <View style={{ flexDirection: 'row'}}>
              <Button
                onPressed={onPressed}
                styles={styles.button}
                message='Detalle del cliente'
              />
              <Resize styles={{ width: 20 }} />
              <Button
                message='No cancelado'
                styles={styles.warning}
                onPressed={() => setIsVisible(true)}
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
    text: {},
    warning: {
      backgroundColor: '#F75900',
      minWidth: 180
    },
    modal: {
      backgroundColor: '#F3F8FD',
      paddingHorizontal: 12,
      paddingVertical: 20
    }
  })
}