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
      let role: 'admin' | 'user' = 'user'
      let plan: 'free' | 'pro' = 'free'
      let videosGenerated = 0
      let paymentStatus: 'paid' | 'overdue' | 'pending' = 'paid'
      let isBlocked = false

      // Sample Data Implementation based on email patterns
      if (email.toLowerCase().includes('admin')) {
        role = 'admin'
        plan = 'pro'
      } else if (email.toLowerCase().includes('paid')) {
        plan = 'pro'
        videosGenerated = 45
      } else if (email.toLowerCase().includes('free')) {
        plan = 'free'
        videosGenerated = 3
      } else if (email.toLowerCase().includes('overdue')) {
        plan = 'pro'
        videosGenerated = 12
        paymentStatus = 'overdue'
        isBlocked = true
      }

      setAuthUser({
        id: crypto.randomUUID(),
        email,
        name: name || (role === 'admin' ? 'Admin' : 'Creator'),
        plan,
        role,
        videosGenerated,
        paymentStatus,
        isBlocked,
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
