import { Project } from '@/types'
import { cn } from '@/lib/utils'
import {
  Wand2,
  Play,
  Pause,
  ShieldAlert,
  Loader2,
  Columns,
  Eye,
  ArrowLeft,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  usePlayerControls,
  setPlayerState,
  usePlayerState,
} from '@/stores/usePlayerStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

function formatTime(time: number) {
  if (isNaN(time)) return '0:00'
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

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
  update,
  onReturnToCorrection,
}: {
  project: Project
  isGenerating?: boolean
  update?: (updates: Partial<Project>) => void
  onReturnToCorrection?: () => void
}) {
  const { setVideoElement, play, pause, seek } = usePlayerControls()
  const { isPlaying, currentTime, volume, videoError, isVideoLoaded } =
    usePlayerState()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const rawVideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false)
  const [isSplitView, setIsSplitView] = useState(false)

  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false)
  const [localAvatarPos, setLocalAvatarPos] = useState({ x: 50, y: 80 })

  const hasContent =
    !!project.videoUrl || (project.bRolls && project.bRolls.length > 0)
  const hasSourceAudio = project.cuts?.some((c) => c.sourceStart !== undefined)
  const isPureEdition = project.cuts?.some((c) => c.sourceStart !== undefined)
  const hasSourceVideo = !!project.videoUrl
  const canPlay = hasSourceVideo ? !videoError && isVideoLoaded : true

  const showSubtitles = project.subtitleStyle?.enabled !== false

  useEffect(() => {
    if (!isDraggingAvatar) {
      setLocalAvatarPos({
        x: project.avatar?.positionX ?? 50,
        y: project.avatar?.positionY ?? 80,
      })
    }
  }, [project.avatar?.positionX, project.avatar?.positionY, isDraggingAvatar])

  useEffect(() => {
    setPlayerState({ videoError: false, isVideoLoaded: false })
  }, [project.videoUrl])

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
    setPlayerState({ isVideoLoaded: true })
  }

  const handleCanPlay = () => {
    setPlayerState({ isVideoLoaded: true })
  }

  const handleError = () => {
    setPlayerState({ videoError: true })
  }

  const handleEnded = () => {
    setPlayerState({ isPlaying: false })
  }

  const togglePlay = () => {
    if (!hasContent || videoError || isDraggingAvatar) return
    if (!canPlay) return
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

      if (isPlaying && canPlay) {
        const nextTime = currentTimeRef.current + delta
        if (nextTime >= (project.videoDuration || 0)) {
          setPlayerState({
            currentTime: project.videoDuration || 0,
            isPlaying: false,
          })
          if (hasSourceVideo && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        } else {
          setPlayerState({ currentTime: nextTime })

          if (hasSourceVideo && videoRef.current) {
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

    if (isPlaying && canPlay) {
      lastTime = performance.now()
      frameId = requestAnimationFrame(tick)
      if (hasSourceVideo && videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    } else {
      if (hasSourceVideo && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
    return () => cancelAnimationFrame(frameId)
  }, [
    isPlaying,
    project.videoDuration,
    project.cuts,
    videoError,
    isVideoLoaded,
    hasSourceVideo,
    canPlay,
  ])

  useEffect(() => {
    if (
      !isPlaying &&
      hasSourceVideo &&
      videoRef.current &&
      !videoError &&
      isVideoLoaded
    ) {
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
  }, [
    currentTime,
    isPlaying,
    project.cuts,
    videoError,
    isVideoLoaded,
    hasSourceVideo,
  ])

  useEffect(() => {
    if (
      rawVideoRef.current &&
      isSplitView &&
      !videoError &&
      isVideoLoaded &&
      hasSourceVideo
    ) {
      const hasCuts = project.cuts && project.cuts.length > 0
      if (hasCuts) {
        const activeCut = project.cuts!.find(
          (c) => currentTime >= c.start && currentTime < c.end,
        )
        if (activeCut && activeCut.sourceStart !== undefined) {
          const target = activeCut.sourceStart + (currentTime - activeCut.start)
          if (Math.abs(rawVideoRef.current.currentTime - target) > 0.3) {
            rawVideoRef.current.currentTime = target
          }
        }
      } else {
        if (Math.abs(rawVideoRef.current.currentTime - currentTime) > 0.3) {
          rawVideoRef.current.currentTime = currentTime
        }
      }
    }
  }, [
    currentTime,
    project.cuts,
    videoError,
    isVideoLoaded,
    isSplitView,
    hasSourceVideo,
  ])

  useEffect(() => {
    if (rawVideoRef.current) {
      if (isPlaying) {
        rawVideoRef.current.play().catch(() => {})
      } else {
        rawVideoRef.current.pause()
      }
    }
  }, [isPlaying, isSplitView])

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

      const isAdaptive = project.audioTrack?.adaptiveLeveling !== false
      const targetVolume =
        speaking && isAdaptive
          ? volume * (baseVolume * 0.2)
          : volume * baseVolume

      const currentVol = audioRef.current.volume

      if (Math.abs(currentVol - targetVolume) > 0.01) {
        audioRef.current.volume = currentVol + (targetVolume - currentVol) * 0.1
      }
    }, 100)

    return () => clearInterval(duckingInterval)
  }, [
    volume,
    project.mood,
    hasSourceAudio,
    project.audioTrack?.adaptiveLeveling,
  ])

  const prevIsPlayingRef = useRef(isPlaying)
  const prevTimeRef = useRef(currentTime)

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
          utterance.lang = project.sourceLanguage || project.language || 'pt-BR'

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

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingAvatar || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    )
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    )
    setLocalAvatarPos({ x, y })
  }

  const handleCanvasPointerUp = () => {
    if (isDraggingAvatar) {
      setIsDraggingAvatar(false)
      if (update && project.avatar) {
        update({
          avatar: {
            ...project.avatar,
            positionX: localAvatarPos.x,
            positionY: localAvatarPos.y,
          },
        })
      }
    }
  }

  const getRatioStyle = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
      case '16:9':
        return { aspectRatio: '16/9', width: '100%', maxHeight: '100%' }
      case '1:1':
        return { aspectRatio: '1/1', width: '100%', maxHeight: '100%' }
      case '4:5':
        return { aspectRatio: '4/5', height: '100%', maxWidth: '100%' }
      default:
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
    }
  }

  const getFilterStyle = () => {
    const s = project.colorSettings || {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      preset: 'none',
    }
    let filters = `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%)`
    if (s.preset === 'grayscale') filters += ' grayscale(100%)'
    if (s.preset === 'sepia') filters += ' sepia(100%)'
    if (s.preset === 'vintage')
      filters += ' sepia(50%) contrast(120%) saturate(80%)'
    if (s.preset === 'noir')
      filters += ' grayscale(100%) contrast(150%) brightness(80%)'
    if (s.preset === 'candle-light')
      filters += ' sepia(40%) contrast(120%) brightness(90%) hue-rotate(-15deg)'

    return { filter: filters, transition: 'filter 0.3s ease-in-out' }
  }

  const isTalking =
    (isTtsSpeaking || (hasSourceAudio && isPlaying)) && !videoError

  const subColor = project.subtitleStyle?.color || '#ffffff'
  const subBg = project.subtitleStyle?.backgroundColor || 'rgba(0,0,0,0.75)'
  const subSize = project.subtitleStyle?.fontSize || 12

  const handleReturnToCorrection = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReturnToCorrection) {
      onReturnToCorrection()
    } else {
      window.dispatchEvent(new CustomEvent('set_tab', { detail: 'ai-creator' }))
    }
  }

  const avatarScale = project.avatar?.scale ?? 1
  const avatarZIndex = project.avatar?.zIndex ?? 20
  const tone = project.avatar?.tone || 'neutral'
  const atmosphere = project.avatar?.atmosphere || 'none'

  let animDuration = '3s'
  let toneFilter = ''
  if (tone === 'suspense') {
    animDuration = '6s'
    toneFilter = 'contrast(1.1) brightness(0.85)'
  } else if (tone === 'joy') {
    animDuration = '2s'
    toneFilter = 'brightness(1.1) saturate(1.2)'
  } else if (tone === 'fear') {
    animDuration = '1.5s'
    toneFilter = 'grayscale(0.2) contrast(1.15) brightness(0.9)'
  }

  const getAvatarFilter = () => {
    let f = toneFilter
    if (atmosphere === 'campfire')
      f +=
        ' drop-shadow(0 15px 35px rgba(234, 88, 12, 0.7)) sepia(0.3) brightness(0.9)'
    if (atmosphere === 'neon')
      f +=
        ' drop-shadow(0 15px 35px rgba(6, 182, 212, 0.7)) contrast(1.2) brightness(0.95)'
    return f.trim()
  }

  const gestureClasses = [
    'anim-gesture-explain',
    'anim-gesture-point',
    'anim-gesture-emphasize',
    'anim-gesture-ponder',
    'anim-gesture-shrug',
  ]
  const [gestureIdx, setGestureIdx] = useState(0)

  useEffect(() => {
    if (!isTalking) return
    const int = setInterval(() => {
      setGestureIdx((prev) => (prev + 1) % gestureClasses.length)
    }, 3500)
    return () => clearInterval(int)
  }, [isTalking])

  let activeGestureClass = isTalking
    ? gestureClasses[gestureIdx]
    : 'anim-neural-idle'

  if (isTalking && tone === 'suspense') {
    activeGestureClass = 'anim-gesture-suspense'
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      <style>{`
        @keyframes anim-flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
          25% { opacity: 0.9; transform: scale(0.98); }
          75% { opacity: 0.8; transform: scale(1.01); }
        }
        @keyframes anim-pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes neural-idle {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg) perspective(500px); }
          50% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0.2deg) translateY(-2px) perspective(500px) rotateY(2deg); }
        }
        
        @keyframes gesture-explain {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg) perspective(500px); }
          25% { transform: translate(-50%, -51%) scale(calc(var(--scale, 1)*1.01)) rotate(1deg) perspective(500px) rotateY(3deg) skewX(-1deg); }
          75% { transform: translate(-50%, -49%) scale(calc(var(--scale, 1)*0.99)) rotate(-1deg) perspective(500px) rotateY(-2deg) skewX(1deg); }
        }

        @keyframes gesture-point {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg) perspective(500px); }
          30% { transform: translate(-49%, -49%) scale(calc(var(--scale, 1)*1.03)) rotate(-2deg) perspective(500px) rotateY(6deg) rotateX(2deg); }
          70% { transform: translate(-49%, -50%) scale(calc(var(--scale, 1)*1.01)) rotate(-1deg) perspective(500px) rotateY(3deg) rotateX(1deg); }
        }

        @keyframes gesture-emphasize {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg); }
          20% { transform: translate(-50%, -48%) scale(calc(var(--scale, 1)*0.98)) rotate(0deg); }
          40%, 60% { transform: translate(-50%, -52%) scale(calc(var(--scale, 1)*1.04)) rotate(0deg); }
        }

        @keyframes gesture-ponder {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg) skewX(0deg); }
          50% { transform: translate(-51%, -50%) scale(var(--scale, 1)) rotate(-1deg) skewX(-1deg); }
        }

        @keyframes gesture-shrug {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) translateY(0); }
          30%, 70% { transform: translate(-50%, -50%) scale(calc(var(--scale, 1)*1.02)) translateY(-5px); }
        }

        @keyframes gesture-suspense {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg) skewX(0deg) perspective(500px); }
          25% { transform: translate(-50%, -49%) scale(calc(var(--scale, 1)*1.02)) rotate(-1deg) skewX(-1deg) perspective(500px); }
          35% { transform: translate(-50%, -49%) scale(calc(var(--scale, 1)*1.02)) rotate(-1deg) skewX(-1deg) perspective(500px); }
          65% { transform: translate(-49%, -50%) scale(calc(var(--scale, 1)*0.98)) rotate(1deg) skewX(1deg) perspective(500px) translateY(-2px); }
          75% { transform: translate(-49%, -50%) scale(calc(var(--scale, 1)*0.98)) rotate(1deg) skewX(1deg) perspective(500px) translateY(-2px); }
        }

        @keyframes reaction-gasp {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 0.6)); filter: brightness(1); }
          10%, 90% { transform: translate(-50%, -52%) scale(calc(var(--scale, 0.6)*1.05)) rotate(-2deg); filter: brightness(1.2); }
        }

        @keyframes reaction-nod {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 0.6)); }
          25%, 75% { transform: translate(-50%, -49%) scale(var(--scale, 0.6)) rotate(1deg); }
          50% { transform: translate(-50%, -51%) scale(var(--scale, 0.6)) rotate(-1deg); }
        }

        @keyframes reaction-fear {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 0.6)); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-51%, -50%) scale(var(--scale, 0.6)) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translate(-49%, -50%) scale(var(--scale, 0.6)) rotate(1deg); }
        }

        .anim-flicker { animation: anim-flicker 3s infinite; }
        .anim-pulse-slow { animation: anim-pulse-slow 4s infinite; }

        .anim-neural-idle { animation: neural-idle var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-explain { animation: gesture-explain var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-point { animation: gesture-point var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-emphasize { animation: gesture-emphasize var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-ponder { animation: gesture-ponder var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-shrug { animation: gesture-shrug var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-gesture-suspense { animation: gesture-suspense var(--anim-dur) ease-in-out infinite; transform-origin: 50% 100%; }

        .anim-reaction-gasp { animation: reaction-gasp 2s ease-out forwards; transform-origin: 50% 100%; }
        .anim-reaction-nod { animation: reaction-nod 2s ease-in-out infinite; transform-origin: 50% 100%; }
        .anim-reaction-fear { animation: reaction-fear 2s linear infinite; transform-origin: 50% 100%; }
      `}</style>
      <PlaybackController project={project} />

      {!isPlaying && !isGenerating && (
        <div className="absolute top-4 left-4 z-50 animate-in fade-in slide-in-from-left-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReturnToCorrection}
            className="bg-black/60 hover:bg-black/80 text-white border-white/20 backdrop-blur-md font-semibold shadow-lg transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Correção
          </Button>
        </div>
      )}

      {hasContent && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsSplitView(!isSplitView)
            }}
            className="bg-black/50 text-white hover:bg-black/70 border-white/10 shadow-lg backdrop-blur-sm"
          >
            {isSplitView ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <Columns className="w-4 h-4 mr-2" />
            )}
            {isSplitView ? 'Visão Única' : 'Comparar Original'}
          </Button>
        </div>
      )}

      <div
        className={cn(
          'w-full h-full flex items-center justify-center transition-all duration-500',
          isSplitView ? 'gap-4 sm:gap-8 max-w-5xl' : '',
        )}
      >
        {isSplitView && project.videoUrl && (
          <div className="flex-1 h-full flex flex-col items-center justify-center animate-in slide-in-from-left-4 fade-in min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 bg-background/50 px-3 py-1 rounded-full border shadow-sm backdrop-blur-md">
              Original (Raw)
            </span>
            <div
              className="relative bg-black rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10 flex items-center justify-center w-full"
              style={getRatioStyle()}
            >
              <video
                ref={rawVideoRef}
                src={project.videoUrl}
                className="w-full h-full object-contain opacity-70"
                muted
                playsInline
                crossOrigin="anonymous"
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex flex-col items-center justify-center h-full min-w-0 transition-all',
            isSplitView ? 'flex-1' : '',
          )}
        >
          {isSplitView && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm backdrop-blur-md">
              Edição Pura
            </span>
          )}
          <div
            ref={canvasRef}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            className={cn(
              'relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0 w-full select-none group',
            )}
            style={getRatioStyle()}
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
                <div
                  className="absolute inset-0 cursor-pointer z-0"
                  onClick={togglePlay}
                />

                {atmosphere !== 'none' && (
                  <div
                    className={cn(
                      'absolute inset-0 z-[25] pointer-events-none transition-all duration-1000 mix-blend-overlay',
                      atmosphere === 'campfire' &&
                        'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-600/40 via-orange-500/10 to-transparent anim-flicker',
                      atmosphere === 'neon' &&
                        'bg-gradient-to-br from-cyan-500/30 via-transparent to-fuchsia-500/30 anim-pulse-slow',
                    )}
                  />
                )}

                {project.colorSettings?.preset === 'film-grain' && (
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 z-30"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                  />
                )}

                {hasSourceVideo && videoError && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/95 text-white p-6 text-center animate-in fade-in pointer-events-none">
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="font-bold text-xl mb-2">
                      Erro de Reprodução
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-[260px]">
                      Não foi possível carregar o vídeo original. O link pode
                      estar quebrado ou a mídia indisponível.
                    </p>
                  </div>
                )}

                {hasSourceVideo &&
                  !isVideoLoaded &&
                  !videoError &&
                  !isGenerating && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 text-white p-6 text-center pointer-events-none">
                      <Loader2 className="w-10 h-10 text-blue-500 mb-4 animate-spin" />
                      <h3 className="font-bold text-lg mb-1">
                        Carregando Mídia RAW
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-[240px]">
                        Handshake direto com a fonte para garantir integridade.
                      </p>
                    </div>
                  )}

                {project.audioTrack?.url && (
                  <audio
                    ref={audioRef}
                    src={project.audioTrack.url}
                    loop
                    preload="auto"
                    className="hidden"
                  />
                )}

                {hasSourceVideo && !videoError && (
                  <video
                    ref={videoRef}
                    src={project.videoUrl!}
                    className={cn(
                      'w-full h-full object-cover opacity-90 relative z-0 transition-opacity duration-300 pointer-events-none',
                      !isVideoLoaded && 'opacity-0',
                    )}
                    style={getFilterStyle()}
                    onLoadedMetadata={handleLoadedMetadata}
                    onCanPlay={handleCanPlay}
                    onEnded={handleEnded}
                    onError={handleError}
                    playsInline
                    controls={false}
                    crossOrigin="anonymous"
                    preload="auto"
                  />
                )}

                {!isPureEdition &&
                  project.bRolls &&
                  project.bRolls.length > 0 && (
                    <div className="absolute inset-0 z-10 pointer-events-none bg-black/20">
                      {project.bRolls.map((br) => {
                        const isActive =
                          currentTime >= br.start && currentTime < br.end
                        const isRendered =
                          currentTime >= br.start - 0.5 &&
                          currentTime <= br.end + 1.5
                        if (!isRendered || !br.url) return null
                        return (
                          <img
                            key={br.id}
                            src={br.url}
                            alt="Semantic"
                            crossOrigin="anonymous"
                            className={cn(
                              'absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                            style={{
                              transitionDuration: '2000ms',
                              ...getFilterStyle(),
                            }}
                          />
                        )
                      })}
                    </div>
                  )}

                {project.avatar?.listeners?.map((listener) => {
                  const isReacting =
                    currentTime >= listener.reactionTime &&
                    currentTime <= listener.reactionTime + 2
                  const rClass = isReacting
                    ? `anim-reaction-${listener.reactionType}`
                    : 'anim-neural-idle'

                  return (
                    <div
                      key={listener.id}
                      className={cn(
                        'absolute pointer-events-none transition-all',
                        rClass,
                      )}
                      style={
                        {
                          zIndex: 15,
                          left: `${listener.positionX}%`,
                          top: `${listener.positionY}%`,
                          '--scale': listener.scale,
                          '--anim-dur': '2.5s',
                          transform: `translate(-50%, -50%) scale(${listener.scale})`,
                          width: '280px',
                          height: '380px',
                          filter:
                            atmosphere === 'campfire'
                              ? 'brightness(0.6) drop-shadow(0 10px 20px rgba(234, 88, 12, 0.2))'
                              : 'brightness(0.7)',
                        } as any
                      }
                    >
                      <img
                        src={listener.imageUrl}
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain drop-shadow-xl opacity-90"
                        alt="listener"
                      />
                    </div>
                  )
                })}

                {project.avatar?.enabled && project.avatar.imageUrl && (
                  <div
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingAvatar(true)
                    }}
                    className={cn(
                      'absolute transition-all',
                      !isDraggingAvatar && activeGestureClass,
                      isDraggingAvatar
                        ? 'cursor-grabbing opacity-80'
                        : 'cursor-grab',
                    )}
                    style={
                      {
                        zIndex: avatarZIndex,
                        left: `${localAvatarPos.x}%`,
                        top: `${localAvatarPos.y}%`,
                        '--scale': avatarScale,
                        '--anim-dur': animDuration,
                        transform: `translate(-50%, -50%) scale(${avatarScale})`,
                        width: '320px',
                        height: '420px',
                        touchAction: 'none',
                        filter: getAvatarFilter(),
                      } as any
                    }
                  >
                    <img
                      src={project.avatar.imageUrl}
                      alt="Avatar"
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                    />
                    {isTalking && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white text-[9px] px-2.5 py-1 rounded-full backdrop-blur-md font-bold uppercase whitespace-nowrap shadow-xl border border-indigo-400/50 flex items-center gap-1.5 pointer-events-none transition-all">
                        <div className="flex items-end gap-0.5 h-2">
                          <div
                            className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate]"
                            style={{ height: '100%' }}
                          />
                          <div
                            className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate_0.2s]"
                            style={{ height: '60%' }}
                          />
                          <div
                            className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate_0.4s]"
                            style={{ height: '80%' }}
                          />
                        </div>
                        Lip-Sync Fonético
                      </div>
                    )}
                  </div>
                )}

                {showSubtitles &&
                  project.aiClips?.map((clip) => {
                    const activeSub = clip.subtitles.find(
                      (s) => currentTime >= s.start && currentTime < s.end,
                    )
                    if (!activeSub) return null
                    return (
                      <div
                        key={clip.id}
                        className="absolute left-0 right-0 z-30 flex justify-center pointer-events-none animate-in fade-in duration-150 bottom-8 px-4 sm:px-8"
                      >
                        <div
                          className="px-3 py-1.5 rounded-md font-medium shadow-md text-center max-w-[90%] leading-snug tracking-wide transition-colors whitespace-pre-wrap backdrop-blur-md"
                          style={{
                            color: subColor,
                            backgroundColor: subBg,
                            fontSize: `${subSize}px`,
                            textShadow: '0px 1px 2px rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          {activeSub.text}
                        </div>
                      </div>
                    )
                  })}

                {!isPlaying && canPlay && !isGenerating && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 transition-all pointer-events-none group-hover:bg-black/40">
                    <div className="w-20 h-20 bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-transform scale-100 group-hover:scale-110">
                      <Play className="w-10 h-10 ml-2 fill-current" />
                    </div>
                  </div>
                )}

                {hasContent && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 flex flex-col justify-end pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-4 px-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay()
                        }}
                        className="text-white hover:bg-white/20 h-10 w-10 rounded-full shrink-0 transition-transform active:scale-95"
                        disabled={!canPlay}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </Button>
                      <div
                        className="flex-1 relative h-2.5 bg-white/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm transition-all hover:h-3.5 group/slider"
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          const x = e.clientX - rect.left
                          const targetTime =
                            (x / rect.width) * (project.videoDuration || 0)
                          seek(targetTime)
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 bottom-0 bg-primary pointer-events-none transition-all duration-75 relative"
                          style={{
                            width: `${(currentTime / (project.videoDuration || 1)) * 100}%`,
                          }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover/slider:opacity-100 transition-opacity translate-x-1.5" />
                        </div>
                      </div>
                      <span className="text-xs text-white font-mono font-medium shadow-sm shrink-0 bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                        {formatTime(currentTime)} /{' '}
                        {formatTime(project.videoDuration || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              !isGenerating && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900/50 space-y-4 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div>
                    <span className="block text-zinc-200 font-semibold mb-1.5">
                      Processamento Visual HD
                    </span>
                    <span className="block text-xs sm:text-sm text-zinc-400 max-w-[280px]">
                      Gere ou importe seu vídeo. Aplicaremos curadoria de
                      imagens semânticas e narração orgânica.
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
