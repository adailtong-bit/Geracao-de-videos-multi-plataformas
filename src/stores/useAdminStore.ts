import { useState, useEffect } from 'react'
import { PlatformSettings } from '@/types'

const ADMIN_SETTINGS_KEY = 'multiproject_admin_settings'

const defaultSettings: PlatformSettings = {
  freeVideoLimit: 5,
  pricePerVideo: 5,
  subscriptionPrice: 29,
  paymentMethods: {
    stripe: true,
    paypal: false,
    pix: true,
  },
}

const getStoredSettings = (): PlatformSettings => {
  try {
    const data = localStorage.getItem(ADMIN_SETTINGS_KEY)
    return data ? JSON.parse(data) : defaultSettings
  } catch {
    return defaultSettings
  }
}

let currentSettings = getStoredSettings()
const listeners = new Set<(s: PlatformSettings) => void>()

export const setAdminSettings = (updates: Partial<PlatformSettings>) => {
  currentSettings = { ...currentSettings, ...updates }
  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(currentSettings))
  listeners.forEach((l) => l(currentSettings))
}

export default function useAdminStore() {
  const [settings, setSettings] = useState<PlatformSettings>(currentSettings)

  useEffect(() => {
    listeners.add(setSettings)
    return () => {
      listeners.delete(setSettings)
    }
  }, [])

  return {
    settings,
    updateSettings: setAdminSettings,
  }
}
