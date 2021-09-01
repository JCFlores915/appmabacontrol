import React, { ReactElement, createContext, useReducer, useCallback, useContext } from 'react'
import { useEffect } from 'react'
import { ToastAndroid as Toast } from 'react-native'

import { Navigator } from '../navigation'
import request from '../services/axios'

const AuthContext = createContext<State & Context>({} as State & Context)
type Props = { }
interface Action {
  type: 'SIGN_IN' | 'SIGN_OUT'
  payload?: any
}
interface State {
  loading: boolean
  isLoggedIn: boolean
  user: {
    name: string
  }
}

interface Context {
  signIn: (username: string, password: string) => void
  signOut: () => void
}
const Provider:React.FC<Props> = ():ReactElement => {
  const [state, dispatch] = useReducer(reducer, { loading: false, isLoggedIn: false, user: {} })

  useEffect(() => {

  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const response = await request.post('?op=inicioSesion', { usuario: username, clave: password })
      console.log(response.data)
      // switch (response.data.success) {
      //   case 0:
      //     dispatch({ type: 'SIGN_IN', payload: { name: 'idsarth' } })
      //     break
      //   case 1:
      //     Toast.show('', Toast.SHORT)
      //     break
      //   case 3:
      //     Toast.show('Usuario que no existe.', Toast.SHORT)
      //     break
      //   default:
      //     Toast.show('Ocurrio un error, por favor intente de nuevo o mas tarde.', Toast.SHORT)
      //     break
      // }
    } catch (error) {
      Toast.show('Ocurrio un error, por favor intente de nuevo o mas tarde.', Toast.SHORT)
    }
  }, [])

  const signOut = useCallback(() => {
    dispatch({ type: 'SIGN_OUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, signOut, ...state }}>
      <Navigator isLoggedIn={state.isLoggedIn} />
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  return useContext(AuthContext)
}

export {
  Provider,
  useAuth
}

const reducer = (prevState: State, action: Action) => {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...prevState,
        user: action.payload,
        isLoggedIn: true
      }
  
    case 'SIGN_OUT':
      return {
        ...prevState,
        isLoggedIn: false,
        user: {},
      }
  }
}