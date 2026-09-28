import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  clearSession,
  getCurrentPermissions,
  login as requestLogin,
  restoreSession,
  saveSession,
  type AuthPermissions,
} from '@/lib/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  status: AuthStatus
  profile: AuthPermissions | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [profile, setProfile] = useState<AuthPermissions | null>(null)

  useEffect(() => {
    let active = true
    void restoreSession().then((restored) => {
      if (active) {
        setProfile(restored)
        setStatus(restored ? 'authenticated' : 'unauthenticated')
      }
    })

    return () => {
      active = false
    }
  }, [])

  async function signIn(username: string, password: string) {
    const tokens = await requestLogin(username, password)
    saveSession(tokens)
    try {
      const currentProfile = await getCurrentPermissions(tokens.access)
      setProfile(currentProfile)
      setStatus('authenticated')
    } catch (error) {
      clearSession()
      setProfile(null)
      setStatus('unauthenticated')
      throw error
    }
  }

  function signOut() {
    clearSession()
    setProfile(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ status, profile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}