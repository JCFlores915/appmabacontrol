import React from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { Resize, Button } from './common'

interface Props {}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    
  }

  onPressed() {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <View style={styles.container}>
        <Icon
          name='error'
          color={'gray'}
          size={70}
        />
        <Resize
          styles={{ height: 10 }}
        />
        <Text style={styles.message}>Oh no!, ocurrio un error inesperado, por favor intente de nuevo o mas tarde.</Text>
        <Resize
          styles={{ height: 50 }}
        />

        <Button
          message='ACEPTAR'
          styles={styles.button}
          onPressed={this.onPressed}
        />
      </View>
    }

    return this.props.children 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8FD',
    justifyContent: 'center',
    alignItems: 'center'
  },
  message: {
    textAlign: 'center',
    maxWidth: 290,
    color: 'gray'
  },
  button: {
    minWidth: 220
  }
})