import { Project } from '@/types'
import { cn } from '@/lib/utils'
import {
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  Play,
  Pause,
  Wand2,
} from 'lucide-react'
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

  const animClass =
    project.globalCaptionStyle === 'pop-up'
      ? 'animate-caption-pop-up'
      : project.globalCaptionStyle === 'highlight'
        ? 'animate-caption-highlight'
        : ''

  return (
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-40 text-center w-[90%] pointer-events-none transition-all duration-75">
      <span
        key={currentSubtitle.id}
        className={cn(
          'text-white px-3 py-1 text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight inline-block transform scale-110',
          animClass,
        )}
        style={{
          color:
            project.globalCaptionStyle === 'highlight' ? '#ffffff' : '#facc15',
          WebkitTextStroke: '1.5px black',
          textShadow: '3px 4px 8px rgba(0,0,0,0.8), 0px 0px 4px rgba(0,0,0,1)',
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
  showSafeZones = false,
  isGenerating = false,
}: {
  project: Project
  showSafeZones?: boolean
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
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/95 text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-transform scale-95 group-hover:scale-100">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 sm:ml-2 fill-current drop-shadow-md" />
                </div>
              </div>
            )}

            {isPlaying && (
              <div className="absolute inset-0 z-40 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/60 text-white/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm transition-transform scale-95 group-hover:scale-100 border border-white/10">
                  <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current drop-shadow-md" />
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
                  Start creating with AI Storyteller
                </span>
                <span className="block text-xs sm:text-sm max-w-[250px] text-zinc-400 leading-relaxed mx-auto">
                  Vá para a aba <strong>Criar c/ IA</strong> para gerar sua
                  primeira história e carregá-la dinamicamente.
                </span>
              </div>
            </div>
          )
        )}

        <SubtitleOverlay project={project} />

        {project.elements.map((el) => {
          const isAnimated =
            el.type === 'caption' &&
            el.animationStyle &&
            el.animationStyle !== 'none'
          const animClass =
            el.animationStyle === 'pop-up'
              ? 'animate-caption-pop-up'
              : el.animationStyle === 'highlight'
                ? 'animate-caption-highlight'
                : ''

          return (
            <div
              key={el.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out z-50 cursor-default"
              style={{ left: `${el.x}%`, top: `${el.y}%` }}
              onClick={(e) => e.stopPropagation()}
            >
              {el.type === 'text' || el.type === 'caption' ? (
                <span
                  key={isPlaying ? el.id : `static-${el.id}`}
                  className={cn(
                    'font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-nowrap text-xl sm:text-2xl md:text-3xl',
                    el.type === 'caption' &&
                      'bg-black/60 px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-black border border-white/10',
                    isAnimated && animClass,
                  )}
                  style={{
                    color:
                      el.animationStyle === 'highlight'
                        ? '#ffffff'
                        : el.color || '#ffffff',
                  }}
                >
                  {el.content || 'Texto'}
                </span>
              ) : (
                <div
                  className="text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-xl whitespace-nowrap shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-white/20"
                  style={{ backgroundColor: el.bgColor || '#e11d48' }}
                >
                  {el.content || 'Banner'}
                </div>
              )}
            </div>
          )
        })}

        {showSafeZones && project.videoUrl && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end text-white p-4 pb-6 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center opacity-80">
              <span className="text-sm font-bold drop-shadow">
                Following | For You
              </span>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm" />
            </div>

            <div className="flex items-end justify-between w-full opacity-90">
              <div className="space-y-3 w-2/3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 overflow-hidden">
                    <img
                      src="https://img.usecurling.com/ppl/thumbnail?seed=1"
                      alt="User"
                    />
                  </div>
                  <span className="font-bold text-sm drop-shadow">
                    @creator
                  </span>
                </div>
                <div className="h-4 w-3/4 bg-white/20 backdrop-blur-sm rounded drop-shadow" />
                <div className="h-4 w-1/2 bg-white/20 backdrop-blur-sm rounded drop-shadow" />
                <div className="flex items-center gap-2 text-xs font-semibold drop-shadow mt-1">
                  <Music className="w-3 h-3" /> Original Sound
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 pb-2">
                <div className="flex flex-col items-center gap-1">
                  <Heart className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">1.2M</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageCircle className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">10K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bookmark className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">50K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Share2 className="w-7 h-7 drop-shadow-md" />
                  <span className="text-[10px] font-medium">Share</span>
                </div>
                <div className="w-9 h-9 mt-2 rounded-full bg-black/50 border-2 border-white/80 p-1 animate-[spin_4s_linear_infinite]">
                  <div className="w-full h-full rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/20 shadow-lg">
              Safe Zone Preview
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
