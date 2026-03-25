import { Project, TransitionStyle } from '@/types'
import { usePlayerState, usePlayerControls } from '@/stores/usePlayerStore'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  Scissors,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { VIDEO_FORMATS } from '@/lib/video-formats'

export function InteractiveTimeline({
  project,
  update,
  isGenerating = false,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
  isGenerating?: boolean
}) {
  const { currentTime, duration, isPlaying, videoError, isVideoLoaded } =
    usePlayerState()
  const { play, pause, seek } = usePlayerControls()

  const PIXELS_PER_SEC = 40
  const format = VIDEO_FORMATS.find((f) => f.id === project.targetFormat)

  const maxFormatTime = Math.max(
    duration || 10,
    format?.max || 0,
    format?.min || 0,
  )
  const minWidth = Math.max(800, maxFormatTime * PIXELS_PER_SEC + 150)

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGenerating) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = Math.max(0, Math.min(x / PIXELS_PER_SEC, duration || 10))
    seek(time)
  }

  const setTransition = (id: string, style: TransitionStyle) => {
    const updated = project.bRolls?.map((b) =>
      b.id === id ? { ...b, transitionStyle: style } : b,
    )
    update({ bRolls: updated })
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalDuration =
    project.cuts?.reduce((sum, c) => sum + (c.end - c.start), 0) ||
    project.videoDuration ||
    0
  const isExceedingMax = format?.max !== undefined && totalDuration > format.max
  const isBelowMin = format?.min !== undefined && totalDuration < format.min
  const isCompliant =
    !isExceedingMax && !isBelowMin && !videoError && isVideoLoaded

  return (
    <div className="h-64 bg-background border-t flex flex-col shrink-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] relative select-none">
      <div className="h-12 border-b flex items-center px-4 gap-4 bg-card shrink-0">
        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="icon"
          className="w-8 h-8 rounded-full shadow-sm transition-transform active:scale-95 shrink-0"
          onClick={isPlaying ? pause : play}
          disabled={isGenerating || !isVideoLoaded || videoError}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          )}
        </Button>
        <span className="text-sm font-mono font-medium text-muted-foreground w-24 text-center shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex items-center gap-3 px-4 border-l h-full ml-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Status:
          </span>
          {videoError ? (
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-600 border-red-500/20 shadow-none gap-1"
            >
              <AlertTriangle className="w-3 h-3" />{' '}
              <span className="hidden sm:inline">Erro de Mídia</span>
            </Badge>
          ) : !isVideoLoaded || isGenerating ? (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-none gap-1 animate-pulse"
            >
              <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin inline-block" />{' '}
              <span className="hidden sm:inline">Processando</span>
            </Badge>
          ) : isCompliant ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />{' '}
              <span className="hidden sm:inline">Válido</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none gap-1"
            >
              <AlertTriangle className="w-3 h-3" />{' '}
              <span className="hidden sm:inline">Aviso (Duração)</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-muted/5 overflow-hidden">
        <ScrollArea className="absolute inset-0">
          <div
            className="relative h-full pb-4 pr-8"
            style={{ width: minWidth }}
          >
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-50 pointer-events-none transition-all duration-75"
              style={{ left: currentTime * PIXELS_PER_SEC }}
            >
              <div className="w-3 h-3 bg-red-500 absolute -top-1.5 -left-1.5 rotate-45 rounded-sm shadow-sm" />
            </div>

            {/* Clickable Seek Area */}
            <div
              className={cn(
                'absolute inset-0 z-0',
                isGenerating ? 'cursor-not-allowed' : 'cursor-text',
              )}
              onClick={handleSeek}
            />

            {/* Monetization Safety Zone */}
            {format?.min && (
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/10 border-l-2 border-emerald-500/50 z-10 pointer-events-none transition-all"
                style={{
                  left: format.min * PIXELS_PER_SEC,
                  width: Math.max(
                    0,
                    (maxFormatTime - format.min) * PIXELS_PER_SEC,
                  ),
                }}
              >
                <div className="absolute top-1 left-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap shadow-sm border border-emerald-500/20">
                  Zona Segura ({format.label})
                </div>
              </div>
            )}

            {/* Hard Limit Marker */}
            {format?.max && (
              <div
                className="absolute top-0 bottom-0 border-r-2 border-red-500/80 border-dashed z-40 pointer-events-none transition-all bg-red-500/5"
                style={{
                  left: format.max * PIXELS_PER_SEC,
                  width: Math.max(
                    0,
                    (maxFormatTime - format.max) * PIXELS_PER_SEC,
                  ),
                }}
              >
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Limite Máx ({format.label})
                </div>
              </div>
            )}

            <div
              className={cn(
                'pt-6 px-4 space-y-3 relative z-20 transition-opacity',
                isGenerating
                  ? 'opacity-50 pointer-events-none'
                  : 'pointer-events-none',
              )}
            >
              {/* Visuals Track */}
              {project.bRolls && project.bRolls.length > 0 && (
                <div className="relative h-16 bg-black/5 dark:bg-white/5 rounded-md border border-border pointer-events-auto">
                  <div className="absolute -left-2 top-0 bottom-0 flex items-center -translate-x-full px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-20 justify-end">
                    Visuais
                  </div>
                  {project.bRolls?.map((br, i) => (
                    <div key={br.id}>
                      <div
                        className="absolute top-1 bottom-1 bg-indigo-500/20 border border-indigo-500/50 rounded overflow-hidden group hover:bg-indigo-500/30 transition-colors shadow-sm"
                        style={{
                          left: br.start * PIXELS_PER_SEC,
                          width: (br.end - br.start) * PIXELS_PER_SEC,
                        }}
                      >
                        {br.url && (
                          <img
                            src={br.url}
                            alt=""
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover opacity-60 pointer-events-none"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      {i < (project.bRolls?.length || 0) - 1 && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                          style={{ left: br.end * PIXELS_PER_SEC - 12 }}
                        >
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-6 h-6 rounded-full bg-background border-indigo-500 shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors z-30"
                              >
                                <Scissors className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-40 p-2"
                              side="top"
                              align="center"
                            >
                              <div className="text-xs font-bold mb-2 text-center border-b pb-1 text-foreground">
                                Estilo de Transição
                              </div>
                              <div className="flex flex-col gap-1">
                                {['none', 'fade', 'slide', 'zoom'].map(
                                  (style) => (
                                    <Button
                                      key={style}
                                      variant={
                                        br.transitionStyle === style ||
                                        (!br.transitionStyle &&
                                          style === 'fade')
                                          ? 'default'
                                          : 'ghost'
                                      }
                                      size="sm"
                                      className="h-8 text-xs justify-start capitalize font-medium"
                                      onClick={() =>
                                        setTransition(
                                          br.id,
                                          style as TransitionStyle,
                                        )
                                      }
                                    >
                                      {style}
                                    </Button>
                                  ),
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Track */}
              <div className="relative h-10 bg-black/5 dark:bg-white/5 rounded-md border border-border pointer-events-auto">
                <div className="absolute -left-2 top-0 bottom-0 flex items-center -translate-x-full px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-20 justify-end">
                  Narração
                </div>
                {project.aiClips?.map((clip) =>
                  clip.subtitles.map((sub) => (
                    <div
                      key={sub.id}
                      className="absolute top-1 bottom-1 bg-blue-500/20 border border-blue-500/50 rounded flex items-center px-2 text-[10px] whitespace-nowrap text-blue-800 dark:text-blue-200 font-medium overflow-hidden shadow-sm"
                      style={{
                        left: sub.start * PIXELS_PER_SEC,
                        width: (sub.end - sub.start) * PIXELS_PER_SEC,
                      }}
                    >
                      <span className="truncate w-full">{sub.text}</span>
                    </div>
                  )),
                )}
              </div>

              {/* Cuts Track */}
              {project.cuts && project.cuts.length > 0 && (
                <div className="relative h-10 bg-black/5 dark:bg-white/5 rounded-md border border-border pointer-events-auto mt-3">
                  <div className="absolute -left-2 top-0 bottom-0 flex items-center -translate-x-full px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-20 justify-end text-right leading-tight">
                    Smart Cuts
                  </div>
                  {project.cuts.map((cut, i) => (
                    <div
                      key={cut.id}
                      className="absolute top-1 bottom-1 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center px-2 text-[10px] whitespace-nowrap text-emerald-800 dark:text-emerald-200 font-medium overflow-hidden shadow-sm group hover:bg-emerald-500/30 transition-colors"
                      style={{
                        left: cut.start * PIXELS_PER_SEC,
                        width: (cut.end - cut.start) * PIXELS_PER_SEC,
                      }}
                      title={
                        cut.sourceStart !== undefined
                          ? `Source: ${cut.sourceStart.toFixed(1)}s - ${cut.sourceEnd?.toFixed(1)}s`
                          : `Corte ${i + 1}`
                      }
                    >
                      <span className="truncate w-full font-bold px-1">
                        Corte #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>
    </div>
  )
}
