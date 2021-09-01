import React, { ReactElement, createContext, useReducer, useCallback, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Navigator } from '../navigation'
const AuthContext = createContext<State & Context>({} as State & Context)
type Props = { }
interface Action {
  type: 'SIGN_IN' | 'SIGN_OUT' | 'LOADING'
  payload?: any
}
interface State {
  loading: boolean
  isLoggedIn: boolean
  user: User
}

interface User {
  id: number
  name: string
  surname: string
  first_start: number
}
interface Context {
  signIn: (user: User) => void
  signOut: () => void
}
const Provider:React.FC<Props> = ():ReactElement => {
  const [state, dispatch] = useReducer(reducer, { loading: false, isLoggedIn: false, user: {} })

  useEffect(() => {
    load()
  }, [])

  const load = useCallback(async () => {
    dispatch({ type: 'LOADING', payload: true })
    const data = await AsyncStorage.getItem('@storage_maba')
    if (data) {
      const user = JSON.parse(data)
      dispatch({ type: 'SIGN_IN', payload: user })
    }
    dispatch({ type: 'LOADING', payload: false })
  }, [])

  const signIn = useCallback((user: User): void => {
    AsyncStorage.setItem('@storage_maba', JSON.stringify(user))
      .then(() => {
        dispatch({ type: 'SIGN_IN', payload: user })
      })
  }, [])

  const signOut = useCallback((): void => {
    dispatch({ type: 'SIGN_OUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, signOut, ...state }}>
      <Navigator />
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
    case 'LOADING':
      return {
        ...prevState,
        loading: action.payload
      }
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