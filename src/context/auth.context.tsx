import React, { ReactElement, createContext, useReducer, useCallback, useContext } from 'react'
import { useEffect } from 'react'

import { Navigator } from '../navigation'

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
  signIn: () => void
  signOut: () => void
}
const Provider:React.FC<Props> = ():ReactElement => {
  const [state, dispatch] = useReducer(reducer, { loading: false, isLoggedIn: false, user: {} })

  useEffect(() => {

  }, [])

  const signIn = useCallback(() => {
    dispatch({ type: 'SIGN_IN', payload: { name: 'idsarth' } })
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