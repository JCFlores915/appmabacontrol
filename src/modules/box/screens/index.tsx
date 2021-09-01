import React, { ReactElement, useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Resize } from '../../../components/common'
import DetailsModal from '../components/details.component'

import request from '../../../services/axios'

export const CloseTheBox:React.FC = ():ReactElement => {
  const { bottom } = useSafeAreaInsets()
  const styles = useMemo(() => factory({ insets: { bottom } }), [])
  const [isVisible, setIsVisible] = useState<boolean>(false)

  // const onCloseTheBox = useCallback(() => {}, [])

  const onToggle = useCallback(() => setIsVisible(prevState => !prevState), [])

  const renderItem = useCallback(({ item }): ReactElement => {
    return (
      <View>

      </View>
    )
  }, [])

  return (
    <View style={styles.screen}>
      <DetailsModal
        isVisible={isVisible}
        onToggle={onToggle}
      />
      <FlatList
        data={[]}
        renderItem={renderItem}
        keyExtractor={(item, index) => JSON.stringify({ item, index})}
        ListHeaderComponent={<View style={[styles.row, styles.wrapper]}>
          <Text style={[styles.bold, styles.size]}>Facturados: 3</Text>
          <Text style={[styles.bold, styles.size]}>No facturados: 2</Text>
          <Text style={[styles.bold, styles.size]}>Pendientes: 4</Text>
        </View>}
      />

      <View style={styles.content}>
        <Button
          message='Cerrar caja'
          onPressed={onToggle}
          styles={styles.button}
        />

        <View style={styles.row}>
          <Text style={[styles.bold, styles.separator]}>Total:</Text>
          <Text>C$300.00</Text>
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
      paddingHorizontal: 20,
      paddingVertical: 18
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: bottom,
      paddingVertical: 20,
      paddingHorizontal: 20,
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
    }
  })
}

export default CloseTheBox