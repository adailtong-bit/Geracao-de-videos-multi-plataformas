import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Wand2, Play, Pause } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const hasSourceAudio = project.cuts?.some((c) => c.sourceStart !== undefined)

  useEffect(() => {
    setVideoElement(videoRef.current)
    return () => setVideoElement(null)
  }, [setVideoElement, project.videoUrl])

  useEffect(() => {
    if (project.videoDuration) {
      setPlayerState({ duration: project.videoDuration })
    }
  }, [project.videoDuration])

  const handleLoadedMetadata = () => {
    if (videoRef.current && !project.videoDuration) {
      setPlayerState({
        duration: videoRef.current.duration,
      })
    }
  }

  const handleEnded = () => {
    setPlayerState({ isPlaying: false })
  }

  const togglePlay = () => {
    if (!hasContent) return
    if (isPlaying) pause()
    else play()
  }

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

      if (isPlaying) {
        const nextTime = currentTimeRef.current + delta
        if (nextTime >= (project.videoDuration || 0)) {
          setPlayerState({
            currentTime: project.videoDuration || 0,
            isPlaying: false,
          })
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        } else {
          setPlayerState({ currentTime: nextTime })

          if (videoRef.current) {
            const hasCuts = project.cuts && project.cuts.length > 0
            if (hasCuts) {
              const activeCut = project.cuts!.find(
                (c) => nextTime >= c.start && nextTime < c.end,
              )
              if (activeCut && activeCut.sourceStart !== undefined) {
                const target =
                  activeCut.sourceStart + (nextTime - activeCut.start)
                if (Math.abs(videoRef.current.currentTime - target) > 0.3) {
                  videoRef.current.currentTime = target
                }
                if (videoRef.current.paused) {
                  videoRef.current.play().catch(() => {})
                }
              } else {
                if (videoRef.current.paused) {
                  videoRef.current.play().catch(() => {})
                }
              }
            } else {
              if (Math.abs(videoRef.current.currentTime - nextTime) > 0.3) {
                videoRef.current.currentTime = nextTime
              }
              if (videoRef.current.paused) {
                videoRef.current.play().catch(() => {})
              }
            }
          }
        }
        frameId = requestAnimationFrame(tick)
      }
    }

    if (isPlaying) {
      lastTime = performance.now()
      frameId = requestAnimationFrame(tick)
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    } else {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, project.videoDuration, project.cuts])

  useEffect(() => {
    if (!isPlaying && videoRef.current) {
      const hasCuts = project.cuts && project.cuts.length > 0
      if (hasCuts) {
        const activeCut = project.cuts!.find(
          (c) => currentTime >= c.start && currentTime < c.end,
        )
        if (activeCut && activeCut.sourceStart !== undefined) {
          videoRef.current.currentTime =
            activeCut.sourceStart + (currentTime - activeCut.start)
        }
      } else {
        videoRef.current.currentTime = currentTime
      }
    }
  }, [currentTime, isPlaying, project.cuts])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
        audioRef.current.currentTime = currentTime
      }
    }
  }, [currentTime])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const duckingInterval = setInterval(() => {
      if (!audioRef.current) return

      let speaking = false
      if (!hasSourceAudio) {
        speaking =
          'speechSynthesis' in window && window.speechSynthesis.speaking
      } else {
        speaking = true
      }

      setIsTtsSpeaking(speaking)

      const baseVolume =
        project.mood === 'calm'
          ? 0.15
          : project.mood === 'dramatic'
            ? 0.35
            : 0.25
      const targetVolume = speaking
        ? volume * (baseVolume * 0.2)
        : volume * baseVolume
      const currentVol = audioRef.current.volume

      if (Math.abs(currentVol - targetVolume) > 0.01) {
        audioRef.current.volume = currentVol + (targetVolume - currentVol) * 0.1
      }
    }, 100)

    return () => clearInterval(duckingInterval)
  }, [volume, project.mood, hasSourceAudio])

  const prevIsPlayingRef = useRef(isPlaying)
  const prevTimeRef = useRef(currentTime)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!('speechSynthesis' in window) || hasSourceAudio) return

    const timeDiff = Math.abs(currentTime - prevTimeRef.current)
    const isSeek = timeDiff > 0.5
    const justStartedPlaying = isPlaying && !prevIsPlayingRef.current
    const justPaused = !isPlaying && prevIsPlayingRef.current

    prevTimeRef.current = currentTime
    prevIsPlayingRef.current = isPlaying

    if (justStartedPlaying || (isPlaying && isSeek)) {
      window.speechSynthesis.cancel()

      setTimeout(() => {
        if (!project.aiClips || project.aiClips.length === 0) return

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
          utterance.lang = project.language || 'pt-BR'

          let rate = 1.0
          let pitch = 1.0

          if (project.voiceProfile === 'deep') {
            pitch = 0.8
            rate = 0.95
          } else if (project.voiceProfile === 'soft') {
            pitch = 1.2
            rate = 0.9
          } else if (project.voiceProfile === 'announcer') {
            pitch = 1.0
            rate = 1.1
          }

          if (project.mood === 'calm') rate -= 0.1
          if (project.mood === 'dramatic') {
            rate -= 0.05
            pitch -= 0.1
          }
          if (project.mood === 'inspirational') rate += 0.05

          utterance.rate = rate
          utterance.pitch = pitch
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
  }, [isPlaying, currentTime, project.aiClips, volume, project, hasSourceAudio])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
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
        className="relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0 group cursor-pointer"
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
                Processando mídias para visual em HD.
              </p>
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
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                playsInline
                controls={false}
              />
            )}

            {project.bRolls && project.bRolls.length > 0 && (
              <div className="absolute inset-0 z-10 pointer-events-none bg-black/20">
                {project.bRolls.map((br) => {
                  const isActive =
                    currentTime >= br.start && currentTime < br.end
                  const isRendered =
                    currentTime >= br.start - 0.5 && currentTime <= br.end + 1.5
                  if (!isRendered) return null
                  return (
                    <img
                      key={br.id}
                      src={br.url}
                      alt="Semantic"
                      className={cn(
                        'absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                      style={{ transitionDuration: '2000ms' }}
                    />
                  )
                })}
              </div>
            )}

            {!project.noTextMode &&
              project.aiClips?.map((clip) => {
                const activeSub = clip.subtitles.find(
                  (s) => currentTime >= s.start && currentTime < s.end,
                )
                if (!activeSub) return null
                return (
                  <div
                    key={clip.id}
                    className="absolute bottom-8 left-4 right-4 z-20 flex justify-center pointer-events-none animate-in fade-in duration-200"
                  >
                    <div className="bg-black/70 backdrop-blur-md text-white/95 px-4 py-2 rounded-lg text-sm md:text-base font-medium shadow-lg text-center max-w-[90%] leading-relaxed tracking-wide">
                      {activeSub.text}
                    </div>
                  </div>
                )
              })}

            {!isPlaying && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 transition-all pointer-events-none">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Play className="w-10 h-10 ml-2 fill-current" />
                </div>
              </div>
            )}
          </>
        ) : (
          !isGenerating && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <span className="block text-zinc-200 font-semibold mb-1.5">
                  Processamento Visual HD
                </span>
                <span className="block text-xs sm:text-sm text-zinc-400 max-w-[280px]">
                  Gere ou importe seu vídeo. Aplicaremos curadoria de imagens
                  semânticas e narração orgânica.
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
