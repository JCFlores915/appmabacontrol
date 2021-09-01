import React, { ReactElement } from 'react'
import {
  View,
  Text
} from 'react-native'
import Modal from 'react-native-modal'

type Props = {
  isVisible: boolean
}
const ResetNewPassword:React.FC<Props> = (props):ReactElement => {
  const {
    isVisible = false
  } = props
  return (
    <Modal
      isVisible={isVisible}
    >
      <View>

      </View>
    </Modal>
  )
}

export default ResetNewPassword
