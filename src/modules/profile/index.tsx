import React, { ReactElement, useMemo } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet
} from 'react-native'

import { Resize } from '../../components/common'

export const ProfileScreen:React.FC = ():ReactElement => {
  const styles = useMemo(() => factory({}), [])
  return (
    <View style={styles.screen}>
      <Resize styles={{ height: 20 }} />
      <View style={[styles.row, { justifyContent: 'flex-start' }]}>
        <Image 
          style={styles.avatar}
          source={{ uri: 'https://thumbs.dreamstime.com/b/icono-masculino-del-avatar-en-estilo-plano-icono-masculino-del-usuario-avatar-del-hombre-de-la-historieta-91462914.jpg' }} 
        />
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.bold, styles.size]}>James Smith</Text>
          <Text style={styles.bold}>201-121292-0054L</Text>
          <Resize styles={{ height: 15 }} />

          <Text style={styles.bold}>Cuota No: 5</Text>
        </View>
      </View>

      <Resize styles={{ height: 20 }} />

      <View>
        <Text style={[styles.bold, styles.size]}>Informacion personal</Text>

        <Resize styles={{ height: 10 }} />
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Telefono: </Text>
          <Text>+(505) 503-2342</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Correo: </Text>
          <Text>pe@gmail.com</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Ciudad: </Text>
          <Text>Managua</Text>
        </View>
        <View style={[styles.row, styles.wrap]}>
          <Text style={[styles.bold]}>Direccion: </Text>
          <Text>Calle la calzada al oeste, 1/2 al sur.</Text>
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
