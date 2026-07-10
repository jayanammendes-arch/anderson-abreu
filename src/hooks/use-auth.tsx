import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isAdmin: boolean
  signUp: (name: string, email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: any }>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  updateProfile: (data: { name?: string; avatar?: File }) => Promise<{ error: any }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await pb.collection('users').create({ name, email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    try {
      const result = await pb.collection('users').authWithOAuth2({ provider })
      const meta = result.meta as { name?: string; avatarUrl?: string } | undefined
      const record = result.record as { id: string; name?: string; avatar?: string }
      if (meta?.name && !record.name) {
        try {
          await pb.collection('users').update(record.id, { name: meta.name })
        } catch {
          // name update is non-critical
        }
      }
      if (meta?.avatarUrl && !record.avatar) {
        try {
          const res = await fetch(meta.avatarUrl)
          const blob = await res.blob()
          const formData = new FormData()
          formData.append('avatar', blob, 'avatar.jpg')
          await pb.collection('users').update(record.id, formData)
        } catch {
          // avatar update is non-critical
        }
      }
      try {
        await pb.collection('users').authRefresh()
      } catch {
        // ignore refresh errors
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const updateProfile = async (data: { name?: string; avatar?: File }) => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) return { error: new Error('Não autenticado') }
      if (data.avatar) {
        const formData = new FormData()
        if (data.name) formData.append('name', data.name)
        formData.append('avatar', data.avatar)
        await pb.collection('users').update(userId, formData)
      } else if (data.name) {
        await pb.collection('users').update(userId, { name: data.name })
      }
      try {
        await pb.collection('users').authRefresh()
      } catch {
        // ignore refresh errors — the update itself succeeded
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const email = pb.authStore.record?.email
      if (!email) return { error: new Error('Não autenticado') }
      await pb.collection('users').authWithPassword(email, currentPassword)
      const userId = pb.authStore.record?.id
      if (!userId) return { error: new Error('Não autenticado') }
      await pb.collection('users').update(userId, {
        password: newPassword,
        passwordConfirm: newPassword,
      })
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const isAdmin = !!user?.is_admin

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        requestPasswordReset,
        updateProfile,
        updatePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
