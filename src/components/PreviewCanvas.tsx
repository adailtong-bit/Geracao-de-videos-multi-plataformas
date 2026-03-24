import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Wand2, Play, Pause } from 'lucide-react'
import { useEffect, useRef, useMemo } from 'react'
import {
  usePlayerControls,
  setPlayerState,
  usePlayerState,
} from '@/stores/usePlayerStore'
import { Skeleton } from '@/components/ui/skeleton'

function SubtitleOverlay({ project }: { project: Project }) {
  const { currentTime, activeClipId } = usePlayerState()

  let currentSubtitle = null

  if (activeClipId) {
    const activeClip = project.aiClips?.find((c) => c.id === activeClipId)
    currentSubtitle = activeClip?.subtitles.find(
      (s) => currentTime >= s.start && currentTime <= s.end,
    )
  } else if (project.aiClips) {
    const clip = project.aiClips.find(
      (c) => currentTime >= c.start && currentTime <= c.end,
    )
    if (clip) {
      currentSubtitle = clip.subtitles.find(
        (s) => currentTime >= s.start && currentTime <= s.end,
      )
    }
  }

  if (!currentSubtitle) return null

  return (
    <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 text-center w-[90%] sm:w-[85%] pointer-events-none transition-all duration-150 flex flex-col justify-end items-center">
      <span
        key={currentSubtitle.id}
        className="text-white px-5 py-2.5 text-lg sm:text-2xl font-bold tracking-wide leading-snug inline-block transform shadow-xl animate-fade-in-up"
        style={{
          backgroundColor: 'rgba(0,0,0,0.75)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(8px)',
          textShadow: '0px 2px 4px rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {currentSubtitle.text}
      </span>
    </div>
  )
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
}: {
  project: Project
  isGenerating?: boolean
}) {
  const { setVideoElement, play, pause } = usePlayerControls()
  const { isPlaying, currentTime } = usePlayerState()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setVideoElement(videoRef.current)
    return () => setVideoElement(null)
  }, [setVideoElement, project.videoUrl])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setPlayerState({ currentTime: videoRef.current.currentTime })
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setPlayerState({ duration: videoRef.current.duration })
    }
  }

  const handleEnded = () => {
    setPlayerState({ isPlaying: false })
  }

  const handlePlay = () => setPlayerState({ isPlaying: true })
  const handlePause = () => setPlayerState({ isPlaying: false })

  const togglePlay = () => {
    if (!project.videoUrl) return
    if (isPlaying) pause()
    else play()
  }

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

  const activeBRoll = useMemo(() => {
    return project.bRolls?.find(
      (br) => currentTime >= br.start && currentTime <= br.end,
    )
  }, [project.bRolls, currentTime])

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
                Gerando Rascunho...
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 text-center max-w-[250px]">
                A inteligência artificial está processando sua nova história.
              </p>
            </div>

            <div className="mt-auto space-y-3 opacity-40 pb-4">
              <Skeleton className="h-4 sm:h-5 w-full bg-white/20" />
              <Skeleton className="h-4 sm:h-5 w-5/6 bg-white/20" />
              <Skeleton className="h-4 sm:h-5 w-4/6 bg-white/20" />
            </div>
          </div>
        )}

        {project.videoUrl ? (
          <>
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

            {activeBRoll && (
              <div className="absolute inset-0 z-10 bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activeBRoll.url}
                  alt="B-Roll"
                  className="w-full h-full object-cover opacity-90 animate-fade-in"
                />
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
                  Comece a criar com IA
                </span>
                <span className="block text-xs sm:text-sm max-w-[250px] text-zinc-400 leading-relaxed mx-auto">
                  Gere sua primeira história na barra lateral para carregar o
                  vídeo.
                </span>
              </div>
            </div>
          )
        )}

        <SubtitleOverlay project={project} />
      </div>
    </div>
  )
}
