import { useState, useEffect } from 'react'

export interface AudioAsset {
  id: string
  name: string
  duration: number
  url: string
}

let currentLibrary: AudioAsset[] = [
  {
    id: '1',
    name: 'Cinematic Ambient',
    duration: 120,
    url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  },
  {
    id: '2',
    name: 'Upbeat Corporate',
    duration: 95,
    url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  },
  {
    id: '3',
    name: 'Inspiring Piano',
    duration: 150,
    url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg',
  },
]

const listeners = new Set<(lib: AudioAsset[]) => void>()

export function useAudioStore() {
  const [library, setLibrary] = useState<AudioAsset[]>(currentLibrary)

  useEffect(() => {
    listeners.add(setLibrary)
    return () => {
      listeners.delete(setLibrary)
    }
  }, [])

  const uploadAudio = (file: File) => {
    const newTrack = {
      id: crypto.randomUUID(),
      name: file.name,
      duration: 180, // Mock duration for newly uploaded files
      url: URL.createObjectURL(file),
    }
    const updated = [...currentLibrary, newTrack]
    currentLibrary = updated
    listeners.forEach((l) => l(updated))
  }

  return { library, uploadAudio }
}
