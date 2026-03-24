import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Wand2, Play, Pause } from 'lucide-react'
import { useEffect, useRef, useMemo, useState } from 'react'
import {
  usePlayerControls,
  setPlayerState,
  usePlayerState,
} from '@/stores/usePlayerStore'
import { Skeleton } from '@/components/ui/skeleton'

function PlaybackController({ project }: { project: Project }) {
  const { currentTime, activeClipId, isPlaying } = usePlayerState()
  const { pause, seek } = usePlayerControls()

  useEffect(() => {
    if (!activeClipId || !isPlaying) return
    const clip = project.aiClips?.find((c) => c.id === activeClipId)
    if (clip && currentTime >= clip.end) {
      pause()
      seek(clip.start)
    }
  }, [currentTime, activeClipId, isPlaying, project.aiClips, pause, seek])

  return null
}

export function PreviewCanvas({
  project,
  isGenerating = false,
}: {
  project: Project
  isGenerating?: boolean
}) {
  const { setVideoElement, play, pause } = usePlayerControls()
  const { isPlaying, currentTime, volume } = usePlayerState()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false)

  const hasContent =
    !!project.videoUrl || (project.bRolls && project.bRolls.length > 0)

  useEffect(() => {
    setVideoElement(videoRef.current)
    return () => setVideoElement(null)
  }, [setVideoElement, project.videoUrl])

  useEffect(() => {
    if (project.videoDuration) {
      setPlayerState({ duration: project.videoDuration })
    }
  }, [project.videoDuration])

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setPlayerState({ currentTime: videoRef.current.currentTime })
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setPlayerState({
        duration: project.videoDuration || videoRef.current.duration,
      })
    }
  }

  const handleEnded = () => {
    setPlayerState({ isPlaying: false })
  }

  const handlePlay = () => setPlayerState({ isPlaying: true })
  const handlePause = () => setPlayerState({ isPlaying: false })

  const togglePlay = () => {
    if (!hasContent) return
    if (isPlaying) pause()
    else play()
  }

  // Virtual timer for generated image-only playback
  const currentTimeRef = useRef(currentTime)
  useEffect(() => {
    currentTimeRef.current = currentTime
  }, [currentTime])

  useEffect(() => {
    let lastTime = performance.now()
    let frameId: number

    const tick = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (isPlaying && !project.videoUrl) {
        const nextTime = currentTimeRef.current + delta
        if (nextTime >= (project.videoDuration || 0)) {
          setPlayerState({
            currentTime: project.videoDuration || 0,
            isPlaying: false,
          })
        } else {
          setPlayerState({ currentTime: nextTime })
        }
      }
      if (isPlaying && !project.videoUrl) {
        frameId = requestAnimationFrame(tick)
      }
    }

    if (isPlaying && !project.videoUrl) {
      lastTime = performance.now()
      frameId = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, project.videoUrl, project.videoDuration])

  // Sync background audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // Sync background audio timeline
  useEffect(() => {
    if (audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
        audioRef.current.currentTime = currentTime
      }
    }
  }, [currentTime])

  // Intelligent Audio Ducking
  useEffect(() => {
    const duckingInterval = setInterval(() => {
      if (!audioRef.current) return
      const speaking =
        'speechSynthesis' in window && window.speechSynthesis.speaking
      setIsTtsSpeaking(speaking)

      const targetVolume = speaking ? volume * 0.05 : volume * 0.25
      const currentVol = audioRef.current.volume

      if (Math.abs(currentVol - targetVolume) > 0.01) {
        audioRef.current.volume = currentVol + (targetVolume - currentVol) * 0.1
      }
    }, 100)

    return () => clearInterval(duckingInterval)
  }, [volume])

  // Text-to-Speech Generation for Continuous Narration (Orator Style)
  const prevIsPlayingRef = useRef(isPlaying)
  const prevTimeRef = useRef(currentTime)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    const timeDiff = Math.abs(currentTime - prevTimeRef.current)
    const isSeek = timeDiff > 0.5
    const justStartedPlaying = isPlaying && !prevIsPlayingRef.current
    const justPaused = !isPlaying && prevIsPlayingRef.current

    prevTimeRef.current = currentTime
    prevIsPlayingRef.current = isPlaying

    if (justStartedPlaying || (isPlaying && isSeek)) {
      window.speechSynthesis.cancel()

      // Slight delay allows TTS engine to fully reset before beginning new continuous utterance
      setTimeout(() => {
        if (!project.aiClips || project.aiClips.length === 0) return

        // Find the active text chunk based on current time
        let textToSpeak = ''
        for (const clip of project.aiClips) {
          if (currentTime >= clip.start && currentTime < clip.end) {
            const remainingSubs = clip.subtitles.filter(
              (s) => s.end > currentTime,
            )
            textToSpeak = remainingSubs.map((s) => s.text).join(' ')
            break
          }
        }

        if (textToSpeak) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak)
          utterance.lang = 'pt-BR'
          utterance.rate = 0.95 // Slightly slower for orator feel
          utterance.pitch = 0.9 // Deeper, more resonant tone
          utterance.volume = volume

          currentUtteranceRef.current = utterance
          window.speechSynthesis.speak(utterance)
        }
      }, 50)
    } else if (justPaused) {
      window.speechSynthesis.pause()
    } else if (isPlaying && !isSeek && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, [isPlaying, currentTime, project.aiClips, volume])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const getRatioStyle = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
      case '1:1':
        return { aspectRatio: '1/1', width: '100%', maxHeight: '100%' }
      case '4:5':
        return { aspectRatio: '4/5', height: '100%', maxWidth: '100%' }
      default:
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      <PlaybackController project={project} />

      <div
        className={cn(
          'relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0 group cursor-pointer',
        )}
        style={getRatioStyle()}
        onClick={togglePlay}
      >
        {isGenerating && (
          <div className="absolute inset-0 z-50 flex flex-col p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-md text-white animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6 opacity-40">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 shrink-0" />
              <div className="space-y-2.5 w-full">
                <Skeleton className="h-3 sm:h-4 w-32 sm:w-40 bg-white/20" />
                <Skeleton className="h-2 sm:h-3 w-20 sm:w-28 bg-white/20" />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center flex-col">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse mb-6 ring-4 ring-blue-500/10">
                <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
              <h3 className="font-bold text-xl sm:text-2xl mb-2 text-center drop-shadow-sm">
                Alinhando Semântica...
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 text-center max-w-[280px]">
                Processando áudio e mapeando o contexto visual para sua
                história.
              </p>
            </div>

            <div className="mt-auto space-y-3 opacity-40 pb-4">
              <Skeleton className="h-4 sm:h-5 w-full bg-white/20" />
              <Skeleton className="h-4 sm:h-5 w-5/6 bg-white/20" />
              <Skeleton className="h-4 sm:h-5 w-4/6 bg-white/20" />
            </div>
          </div>
        )}

        {hasContent ? (
          <>
            {project.audioTrack?.url && (
              <audio
                ref={audioRef}
                src={project.audioTrack.url}
                loop
                preload="auto"
                className="hidden"
              />
            )}

            {project.videoUrl && (
              <video
                ref={videoRef}
                src={project.videoUrl}
                className="w-full h-full object-cover opacity-90 relative z-0"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onPlay={handlePlay}
                onPause={handlePause}
                playsInline
                controls={false}
              />
            )}

            {/* Organic Cinematic Crossfades for Semantic Visuals */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-black/40">
              {project.bRolls?.map((br) => {
                const isActive = currentTime >= br.start && currentTime < br.end
                // Keep rendering for a moment after to allow smooth fade out
                const isRendered =
                  currentTime >= br.start - 0.5 && currentTime <= br.end + 1.5

                if (!isRendered) return null

                return (
                  <img
                    key={br.id}
                    src={br.url}
                    alt="Semantic B-Roll"
                    className={cn(
                      'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                )
              })}
            </div>

            {!project.videoUrl &&
              (!project.bRolls || project.bRolls.length === 0) && (
                <div className="absolute inset-0 z-10 bg-zinc-900 flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">Sem Mídia</span>
                </div>
              )}

            {!isPlaying && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all pointer-events-none">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-transform scale-95 group-hover:scale-100">
                  <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-2 fill-current drop-shadow-md" />
                </div>
              </div>
            )}

            {isPlaying && (
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all pointer-events-none">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/60 text-white/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm transition-transform scale-95 group-hover:scale-100 border border-white/10">
                  <Pause className="w-10 h-10 sm:w-12 sm:h-12 fill-current drop-shadow-md" />
                </div>
              </div>
            )}
          </>
        ) : (
          !isGenerating && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-zinc-900/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2 shadow-inner border border-zinc-700/50">
                <Wand2 className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <span className="block text-zinc-200 font-semibold text-base sm:text-lg mb-1.5">
                  Processamento Visual Limpo
                </span>
                <span className="block text-xs sm:text-sm max-w-[280px] text-zinc-400 leading-relaxed mx-auto">
                  Gere ou importe seu vídeo. Aplicaremos uma curadoria de
                  imagens semânticas e narração com transições orgânicas.
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
