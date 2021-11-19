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

import { BLEPrinter } from 'react-native-thermal-receipt-printer'

import { Button, Resize, Input } from '../../../components/common'
import { useAuth } from '../../../context/auth.context'

import request from '../../../services/axios'

type Props = {
  isVisible: boolean
  onToggle: () => void
}
const DetailsModal:React.FC<Props> = (props):ReactElement => {
  let timeoutId: NodeJS.Timeout
  const { user, signOut } = useAuth()
  const styles = useMemo(() => factory({ }), [])
  const [values, setValues] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onPressed = useCallback(() => {
    if (!values) return Toast.show('Ingrese el total en cordoba.', Toast.SHORT)

    setIsLoading(true)
    request.post('?op=cierreCaja', {
      idempleado: user.id,
      idoperaciones: user.idapartura,
      montocierrecordoba: values,
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
              BLEPrinter.init();
              BLEPrinter.connectPrinter(user.printer?.address)
                .then(() => {
                  const date = new Date()

                  BLEPrinter.printBill(`
<C><B>Cierre de ruta</B></C>

<C>Nombre Empleado: ${user.name}</C>
<C>Fecha del Cierre: ${date.getDay()}-${date.getMonth()}-${date.getFullYear()}</C>
<C>Hora del Cierre: ${date.getHours()}:${date.getMinutes()}</C>

<L>Total Cuotas Pagadas: C$${Number(res.data.total_cuotas_pagadas).toFixed(4)}</L>
<L>Total Apertura: C$${Number(res.data.total_apertura).toFixed(4)}</L>
<L>Total Gastos Administrativos: C$${Number(res.data.total_gasto_administrativo).toFixed(4)}</L>
<L>Total en Caja: C$${Number(res.data.total_cierre).toFixed(4)}</L>

<L>Recuento: ${Number(res.data.recuento).toFixed(4)}</L>
<L>Descuadro: ${Number(res.data.descuadro).toFixed(4)}</L>



<C>--------------------------</C>
<C>Firma del Empleado</C>



<C>--------------------------</C>
<C>Firma Recibido</C>


<C>FUNERARIA BARRANTES</C>
<C>SIEMPRE LIDER EN FUNERARIA</C>`)
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
  }, [values, user, props])

  const onChange = useCallback((value: string) => {
    setValues(value)
  }, [])

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
          <Input
            label='Total cordoba'
            customProps={{
              onChangeText: (value: string) => onChange(value),
              keyboardType: 'numeric',
              value: values
            }}
            icon={{ name: 'cash' }}
            containerStyle={{ marginBottom: 18 }}
          />

          {/* <Input
            label='Total dolar'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'dolar'),
              value: values.dolar,
              keyboardType: 'numeric',
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
          />

          <Input
            label='Total conversion'
            customProps={{
              onChangeText: (value: string) => onChange(value, 'total'),
              keyboardType: 'numeric',
              value: values.total,
              editable: false
            }}
            icon={{ name: 'account' }}
            containerStyle={{ marginBottom: 18 }}
          /> */}

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
