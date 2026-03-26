import { useState, useEffect } from 'react'
import type { PlatformSettings, CostEntry } from '@/types'

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
  gateways: [
    {
      provider: 'stripe',
      publicKey: '',
      privateKey: '',
      env: 'sandbox',
      enabled: true,
    },
    {
      provider: 'mercadopago',
      publicKey: '',
      privateKey: '',
      env: 'sandbox',
      enabled: false,
    },
  ],
  costs: [
    {
      id: 'c1',
      date: '2023-10-01',
      description: 'Skip Cloud Hosting',
      amount: 150,
      type: 'hosting',
    },
    {
      id: 'c2',
      date: '2023-10-05',
      description: 'OpenAI API Usage',
      amount: 320,
      type: 'api',
    },
  ],
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

  const addCost = (cost: Omit<CostEntry, 'id'>) => {
    const newCost: CostEntry = { ...cost, id: crypto.randomUUID() }
    setAdminSettings({ costs: [...settings.costs, newCost] })
  }

  return {
    settings,
    updateSettings: setAdminSettings,
    addCost,
  }
}
