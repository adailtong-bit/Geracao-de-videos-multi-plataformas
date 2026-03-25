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
  const rawVideoRef = useRef<HTMLVideoElement>(null)
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isSplitView, setIsSplitView] = useState(false)

  const hasContent =
    !!project.videoUrl || (project.bRolls && project.bRolls.length > 0)
  const hasSourceAudio = project.cuts?.some((c) => c.sourceStart !== undefined)
  const isPureEdition = project.cuts?.some((c) => c.sourceStart !== undefined)

  const shouldShowSubtitles =
    project.sourceLanguage &&
    project.subtitleLanguage &&
    project.subtitleLanguage !== 'none'

  useEffect(() => {
    setVideoError(false)
    setIsVideoLoaded(false)
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
    setIsVideoLoaded(true)
  }

  const handleCanPlay = () => {
    setIsVideoLoaded(true)
  }

  const handleEnded = () => {
    setPlayerState({ isPlaying: false })
  }

  const togglePlay = () => {
    if (!hasContent || videoError || !isVideoLoaded) return
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

      if (isPlaying && !videoError && isVideoLoaded) {
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

    if (isPlaying && !videoError && isVideoLoaded) {
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
  }, [
    isPlaying,
    project.videoDuration,
    project.cuts,
    videoError,
    isVideoLoaded,
  ])

  useEffect(() => {
    if (!isPlaying && videoRef.current && !videoError && isVideoLoaded) {
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
  }, [currentTime, isPlaying, project.cuts, videoError, isVideoLoaded])

  useEffect(() => {
    if (rawVideoRef.current && isSplitView && !videoError && isVideoLoaded) {
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
  }, [currentTime, project.cuts, videoError, isVideoLoaded, isSplitView])

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
    return { filter: filters, transition: 'filter 0.3s ease-in-out' }
  }

  const isTalking =
    (isTtsSpeaking || (hasSourceAudio && isPlaying)) && !videoError

  const subColor = project.subtitleStyle?.color || '#ffffff'
  const subBg = project.subtitleStyle?.backgroundColor || 'rgba(0,0,0,0.75)'
  const subSize = project.subtitleStyle?.fontSize || 14

  const avatarScale = project.avatar?.scale ?? 1
  const avatarX = project.avatar?.positionX ?? 50
  const avatarY = project.avatar?.positionY ?? 80

  const handleReturnToCorrection = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('set_tab', { detail: 'ai-creator' }))
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      <style>{`
        @keyframes avatar-talking {
          0%, 100% { transform: translate(-50%, -50%) scale(var(--scale, 1)) rotate(0deg); }
          25% { transform: translate(-50%, -50%) scale(calc(var(--scale, 1) * 1.02)) rotate(-1deg); }
          50% { transform: translate(-50%, -50%) scale(calc(var(--scale, 1) * 1.04)) rotate(1deg); }
          75% { transform: translate(-50%, -50%) scale(calc(var(--scale, 1) * 1.02)) rotate(-0.5deg); }
        }
        .animate-avatar-talking {
          animation: avatar-talking 2s ease-in-out infinite;
        }
      `}</style>
      <PlaybackController project={project} />

      {/* Voltar para Correção Button (Correction Workflow) */}
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

      {/* Toggle Split View */}
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
        {/* RAW Stream */}
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

        {/* Pure Editing Stream */}
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
            className={cn(
              'relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0 group cursor-pointer w-full',
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
                    Processando mídias para visual em HD.
                  </p>
                </div>
              </div>
            )}

            {hasContent ? (
              <>
                {videoError && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/95 text-white p-6 text-center animate-in fade-in">
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

                {project.videoUrl &&
                  !isVideoLoaded &&
                  !videoError &&
                  !isGenerating && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 text-white p-6 text-center">
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

                {project.videoUrl && !videoError && (
                  <video
                    ref={videoRef}
                    src={project.videoUrl}
                    className={cn(
                      'w-full h-full object-cover opacity-90 relative z-0 transition-opacity duration-300',
                      !isVideoLoaded && 'opacity-0',
                    )}
                    style={getFilterStyle()}
                    onLoadedMetadata={handleLoadedMetadata}
                    onCanPlay={handleCanPlay}
                    onEnded={handleEnded}
                    onError={() => setVideoError(true)}
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

                {/* Avatar Overlay with dynamic scaling, positioning and lip-sync */}
                {project.avatar?.enabled && project.avatar.imageUrl && (
                  <div
                    className={cn(
                      'absolute z-20 pointer-events-none rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl bg-black/50 backdrop-blur-md',
                      isTalking ? 'animate-avatar-talking' : '',
                    )}
                    style={
                      {
                        left: `${avatarX}%`,
                        top: `${avatarY}%`,
                        '--scale': avatarScale,
                        transform: !isTalking
                          ? `translate(-50%, -50%) scale(${avatarScale})`
                          : undefined,
                        width: '120px',
                        height: '120px',
                        transition:
                          'left 0.3s ease-out, top 0.3s ease-out, transform 0.3s ease-out',
                      } as any
                    }
                  >
                    <img
                      src={project.avatar.imageUrl}
                      alt="Avatar"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                    {isTalking && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-500/90 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-md font-bold uppercase whitespace-nowrap shadow-sm border border-blue-400/50">
                        Lip-Sync Ativo
                      </div>
                    )}
                  </div>
                )}

                {shouldShowSubtitles &&
                  project.aiClips?.map((clip) => {
                    const activeSub = clip.subtitles.find(
                      (s) => currentTime >= s.start && currentTime < s.end,
                    )
                    if (!activeSub) return null
                    return (
                      <div
                        key={clip.id}
                        className="absolute left-0 right-0 z-30 flex justify-center pointer-events-none animate-in fade-in duration-150 bottom-6"
                      >
                        <div
                          className="px-3 py-1.5 rounded-sm font-medium shadow-sm text-center max-w-[80%] leading-snug tracking-wide border border-white/10 transition-colors"
                          style={{
                            color: subColor,
                            backgroundColor: subBg,
                            fontSize: `${subSize}px`,
                            textShadow: '0px 1px 2px rgba(0,0,0,0.8)',
                          }}
                        >
                          {activeSub.text}
                        </div>
                      </div>
                    )
                  })}

                {!isPlaying && !videoError && isVideoLoaded && (
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
