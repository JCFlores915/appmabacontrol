import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid as Toast
} from 'react-native'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { BLEPrinter } from 'react-native-thermal-receipt-printer-image-qr'

import { Button, Resize, Input } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'

import request from '../../../services/axios'

type Props = {
  isVisible: boolean
  onToggle: () => void
  data: Array<{

  }>
  total: number
}
const DetailsModal:React.FC<Props> = (props):ReactElement => {
  let timeoutId: NodeJS.Timeout
  const { user, signOut } = useAuth()
  const styles = useMemo(() => factory({ }), [])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onPressed = useCallback(() => {
    setIsLoading(true)
    request.post('?op=cierreCaja', {
      idempleado: user.id,
      idoperaciones: user.idapartura,
      montocierrecordoba: props.total,
      montocierredolar: 0,
      montoconversion: 0,
      totalcierre: 0
    })
      .then(({ data }) => {
        if (data.success === 1) {
          props.onToggle()
          Toast.show('Cierre de caja registrado correctamente.', Toast.SHORT)

          request.post('?op=reciboCierreCaja', {
            idoperaciones: user.idapartura
          })
            .then((res) => {
              console.log('res -> ', res)
              BLEPrinter.init();
              BLEPrinter.connectPrinter(user.printer?.address)
                .then(() => {
                  const date = new Date()
                  let information = ''
                  props.data.forEach(el => {
                    information += `  ${el.idfactura}           ${date.getHours()}:${date.getMinutes()}      C$${Number(el.saldofinal).toFixed(2)}      Anticipo\n`  
                  })

                  BLEPrinter.printBill(`
<C><B>Cierre de cobro</B></C>

<C>Tipo de cierre: Plan de Necesidad</C>
<C>${date.getDay()}/${date.getMonth()}/${date.getFullYear()} Hora: ${date.getHours()}:${date.getMinutes()}</C>
<C>Ruta Numero: 1</C>

Codigo        Hora       Monto       Concepto


${information}

<C>Total: C$${Number(res.data.total_cuotas_pagadas).toFixed(4)}</C>


<C>Yo ${user.name} doy fe de haber recibido el dinero que en este documento se detalla.</C>

<C>--------------------------</C>
<C>Colector</C>



<L>Depositado en: -------------------------------</L>


<L>Minuta #: ------------------------------- </L>


<C> ------------------------------- </C>
<C>Recibido</C>
<C>(Administración)</C>
`)
              })

              timeoutId = setTimeout(() => {
                signOut()
                Toast.show('Su ruta de cobro a finalizado.', Toast.SHORT)
              }, 2000)
            })
            .catch(() => {
              Toast.show('Ocurrio un error al cerrar la caja, por favor intente de nuevo o mas tarde.', Toast.SHORT)
            })

          return
        }
        Toast.show('Ocurrio un error al cerrar la caja, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      })
      .catch(() => {
        Toast.show('Ocurrio un error, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [user, props])

  return (
    <Modal
      style={{ justifyContent: "flex-start" }}
      isVisible={props.isVisible}
      onBackdropPress={props.onToggle}
      swipeDirection={["down", "up", "left", "right"]}
    >
      <View style={styles.modal}>
        <View style={[styles.row, styles.spaceBetween]}>
          <Text style={styles.title}>Cierre de caja</Text>
          <TouchableOpacity onPress={props.onToggle}>
            <View style={styles.icon}>
              <Icon
                color='#697477'
                name="close"
                size={32}
              />
            </View>
          </TouchableOpacity>
        </View>
        <Resize styles={{ height: 20 }} />
        <View>
          <View pointerEvents='none'>
            <Input
              label='Total cordoba'
              customProps={{
                keyboardType: 'numeric',
                value: Number(props.total).toFixed(4),
                
              }}
              
              icon={{ name: 'cash' }}
              containerStyle={{ marginBottom: 18 }}
            />
          </View>

          <Resize styles={{ height: 40 }} />
          <Button 
            isLoading={isLoading}
            onPressed={onPressed}
            message='CONFIRMAR'
          />
        </View>
      </View>
    </Modal>
  )
}

const factory = (conditions: any) => {
  return StyleSheet.create({
    modal: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 15
    },
    row: {
      flexDirection: 'row'
    },
    background: {
      backgroundColor: '#C9C9C9',
      paddingHorizontal: 14,
      paddingVertical: 7.6,
      borderRadius: 200
    },
    text: {

    },
    divider: {
      height: 1,
      backgroundColor: '#ddd'
    },
    textCenter: {
      textAlign: 'center'
    },
    center: {
      alignItems: 'center'
    },
    symbol: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#3695BE',
    },
    bold: {
      fontWeight: 'bold',
    },
    total: {
      fontSize: 18,
      fontWeight: 'bold'
    },
    icon: {
      alignSelf: 'flex-end',
      paddingHorizontal: 4,
      paddingVertical: 4
    },
    spaceBetween: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16
    }
  })
}

export default DetailsModal
