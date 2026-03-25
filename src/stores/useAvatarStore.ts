import { useState, useEffect } from 'react'
import { AvatarModel } from '@/types'

const AVATARS_KEY = 'multiproject_avatars'

const PRESETS: AvatarModel[] = [
  {
    id: 'preset-1',
    name: 'Ana (Executiva)',
    type: 'preset',
    imageUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=10',
    status: 'ready',
    createdAt: 0,
  },
  {
    id: 'preset-2',
    name: 'Carlos (Casual)',
    type: 'preset',
    imageUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=20',
    status: 'ready',
    createdAt: 0,
  },
  {
    id: 'preset-3',
    name: 'Maria (Jovem)',
    type: 'preset',
    imageUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=30',
    status: 'ready',
    createdAt: 0,
  },
  {
    id: 'preset-4',
    name: 'Roberto (Sênior)',
    type: 'preset',
    imageUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=40',
    status: 'ready',
    createdAt: 0,
  },
]

const getStoredAvatars = (): AvatarModel[] => {
  try {
    const data = localStorage.getItem(AVATARS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed
    }
  } catch {
    // Fallback if parsing fails
  }
  return PRESETS
}

let currentAvatars: AvatarModel[] = getStoredAvatars()
const listeners = new Set<(avatars: AvatarModel[]) => void>()

export const saveAvatars = (avatars: AvatarModel[]) => {
  currentAvatars = avatars
  localStorage.setItem(AVATARS_KEY, JSON.stringify(avatars))
  listeners.forEach((l) => l(avatars))
}

export default function useAvatarStore() {
  const [avatars, setAvatars] = useState<AvatarModel[]>(currentAvatars)

  useEffect(() => {
    listeners.add(setAvatars)
    return () => {
      listeners.delete(setAvatars)
    }
  }, [])

  return {
    avatars,
    addAvatar: (avatar: Omit<AvatarModel, 'id' | 'createdAt' | 'type'>) => {
      const newAvatar: AvatarModel = {
        ...avatar,
        id: crypto.randomUUID(),
        type: 'custom',
        createdAt: Date.now(),
      }
      saveAvatars([...currentAvatars, newAvatar])
      return newAvatar
    },
    updateAvatar: (id: string, updates: Partial<AvatarModel>) => {
      saveAvatars(
        currentAvatars.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      )
    },
    removeAvatar: (id: string) => {
      saveAvatars(currentAvatars.filter((a) => a.id !== id))
    },
  }
}
