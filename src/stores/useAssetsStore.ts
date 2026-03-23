import { useState, useEffect } from 'react'
import { Asset } from '@/types'

const ASSETS_KEY = 'multiproject_assets'

const getStoredAssets = (): Asset[] => {
  try {
    const data = localStorage.getItem(ASSETS_KEY)
    return data
      ? JSON.parse(data)
      : [
          {
            id: '1',
            name: 'Subscribe Banner',
            type: 'banner',
            bgColor: '#e11d48',
            content: 'Subscribe Now!',
          },
          {
            id: '2',
            name: 'Follow CTA',
            type: 'cta',
            bgColor: '#2563eb',
            content: 'Follow for more',
          },
        ]
  } catch {
    return []
  }
}

let currentAssets: Asset[] = getStoredAssets()
const listeners = new Set<(assets: Asset[]) => void>()

export const saveAssets = (assets: Asset[]) => {
  currentAssets = assets
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets))
  listeners.forEach((l) => l(assets))
}

export default function useAssetsStore() {
  const [assets, setAssets] = useState<Asset[]>(currentAssets)

  useEffect(() => {
    listeners.add(setAssets)
    return () => {
      listeners.delete(setAssets)
    }
  }, [])

  return {
    assets,
    addAsset: (asset: Omit<Asset, 'id'>) => {
      saveAssets([...currentAssets, { ...asset, id: crypto.randomUUID() }])
    },
    removeAsset: (id: string) => {
      saveAssets(currentAssets.filter((a) => a.id !== id))
    },
  }
}
