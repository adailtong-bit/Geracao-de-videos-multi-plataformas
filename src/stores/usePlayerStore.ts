import { useState, useEffect } from 'react'

interface PlayerState {
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
  videoElement: HTMLVideoElement | null
  activeClipId: string | null
}

let currentState: PlayerState = {
  currentTime: 0,
  duration: 100,
  isPlaying: false,
  volume: 1,
  videoElement: null,
  activeClipId: null,
}

const listeners = new Set<(state: PlayerState) => void>()

export const setPlayerState = (updates: Partial<PlayerState>) => {
  currentState = { ...currentState, ...updates }
  listeners.forEach((listener) => listener(currentState))
}

export function usePlayerState() {
  const [state, setState] = useState(currentState)

  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return state
}

export function usePlayerControls() {
  return {
    play: () => {
      if (currentState.videoElement) {
        currentState.videoElement.play().catch(() => {})
        setPlayerState({ isPlaying: true })
      }
    },
    pause: () => {
      if (currentState.videoElement) {
        currentState.videoElement.pause()
        setPlayerState({ isPlaying: false })
      }
    },
    seek: (time: number) => {
      if (currentState.videoElement) {
        currentState.videoElement.currentTime = time
        setPlayerState({ currentTime: time })
      }
    },
    setVolume: (vol: number) => {
      if (currentState.videoElement) {
        currentState.videoElement.volume = vol
        setPlayerState({ volume: vol })
      }
    },
    setVideoElement: (el: HTMLVideoElement | null) => {
      setPlayerState({ videoElement: el })
    },
  }
}
