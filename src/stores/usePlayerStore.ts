import { useState, useEffect } from 'react'

interface PlayerState {
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
  videoElement: HTMLVideoElement | null
  activeClipId: string | null
  videoError: boolean
  isVideoLoaded: boolean
}

let currentState: PlayerState = {
  currentTime: 0,
  duration: 100,
  isPlaying: false,
  volume: 1,
  videoElement: null,
  activeClipId: null,
  videoError: false,
  isVideoLoaded: false,
}

const listeners = new Set<(state: PlayerState) => void>()

export const setPlayerState = (updates: Partial<PlayerState>) => {
  let hasChanges = false
  for (const key in updates) {
    if (
      updates[key as keyof PlayerState] !==
      currentState[key as keyof PlayerState]
    ) {
      hasChanges = true
      break
    }
  }

  // Only trigger re-renders if the state actually changed to prevent infinite loops
  if (hasChanges) {
    currentState = { ...currentState, ...updates }
    listeners.forEach((listener) => listener(currentState))
  }
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

// Stable reference to control functions to prevent excessive re-renders
// when these are used in dependency arrays of useEffects across components.
const controls = {
  play: () => {
    if (currentState.videoElement) {
      currentState.videoElement.play().catch(() => {})
    }
    setPlayerState({ isPlaying: true })
  },
  pause: () => {
    if (currentState.videoElement) {
      currentState.videoElement.pause()
    }
    setPlayerState({ isPlaying: false })
  },
  seek: (time: number) => {
    if (currentState.videoElement) {
      currentState.videoElement.currentTime = time
    }
    setPlayerState({ currentTime: time })
  },
  setVolume: (vol: number) => {
    if (currentState.videoElement) {
      currentState.videoElement.volume = vol
    }
    setPlayerState({ volume: vol })
  },
  setVideoElement: (el: HTMLVideoElement | null) => {
    setPlayerState({ videoElement: el })
  },
}

export function usePlayerControls() {
  return controls
}
