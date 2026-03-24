import { Project, TransitionStyle } from '@/types'
import { usePlayerState, usePlayerControls } from '@/stores/usePlayerStore'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Play, Pause, Scissors, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

export function InteractiveTimeline({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const { currentTime, duration, isPlaying } = usePlayerState()
  const { play, pause, seek } = usePlayerControls()

  const PIXELS_PER_SEC = 40
  const minWidth = Math.max(800, (duration || 10) * PIXELS_PER_SEC)

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
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
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-64 bg-background border-t flex flex-col shrink-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] relative select-none">
      <div className="h-12 border-b flex items-center px-4 gap-4 bg-card shrink-0">
        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="icon"
          className="w-8 h-8 rounded-full shadow-sm transition-transform active:scale-95 shrink-0"
          onClick={isPlaying ? pause : play}
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
              className="absolute inset-0 z-0 cursor-text"
              onClick={handleSeek}
            />

            <div className="pt-6 px-4 space-y-3 pointer-events-none">
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
                        <img
                          src={br.url}
                          alt=""
                          className="w-full h-full object-cover opacity-60 pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        {/* Drag Handle Mock */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-500/50" />
                      </div>
                      {/* Transition Hover Button */}
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
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/50" />
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
                      className="absolute top-1 bottom-1 bg-green-500/20 border border-green-500/50 rounded flex items-center px-2 text-[10px] whitespace-nowrap text-green-800 dark:text-green-200 font-medium overflow-hidden shadow-sm group hover:bg-green-500/30 transition-colors"
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
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-green-500/50" />
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
