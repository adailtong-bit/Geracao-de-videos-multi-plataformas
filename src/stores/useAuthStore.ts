import { useState, useEffect } from 'react'
import { User } from '@/types'

const AUTH_KEY = 'multiproject_auth'

const getStoredUser = (): User | null => {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

let currentUser: User | null = getStoredUser()
const listeners = new Set<(user: User | null) => void>()

export const setAuthUser = (user: User | null) => {
  currentUser = user
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
  listeners.forEach((l) => l(user))
}

export default function useAuthStore() {
  const [user, setUser] = useState<User | null>(currentUser)

  useEffect(() => {
    listeners.add(setUser)
    return () => {
      listeners.delete(setUser)
    }
  }, [])

  return {
    user,
    login: (email: string, name: string) => {
      // Mock an admin role if the email contains 'admin'
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'user'
      setAuthUser({
        id: crypto.randomUUID(),
        email,
        name,
        plan: 'free',
        role,
        videosGenerated: 0,
        linkedAccounts: {},
      })
    },
    logout: () => setAuthUser(null),
    updateUser: (updates: Partial<User>) => {
      if (currentUser) {
        setAuthUser({ ...currentUser, ...updates })
      }
    },
  }
}
