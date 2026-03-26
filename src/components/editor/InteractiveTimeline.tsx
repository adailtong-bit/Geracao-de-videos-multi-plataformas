import { useState, useEffect } from 'react'
import { Project, TransitionStyle, BRoll } from '@/types'
import { usePlayerState, usePlayerControls } from '@/stores/usePlayerStore'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  Scissors,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function InteractiveTimeline({
  project,
  update,
  isGenerating = false,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
  isGenerating?: boolean
}) {
  const { currentTime, duration, isPlaying, isVideoLoaded } = usePlayerState()
  const { play, pause, seek } = usePlayerControls()

  const [selectedItem, setSelectedItem] = useState<{
    id: string
    type: 'cut' | 'broll'
  } | null>(null)

  const PIXELS_PER_SEC = 40
  const minWidth = Math.max(800, (duration || 10) * PIXELS_PER_SEC + 150)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seek(Math.max(0, currentTime - 0.1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seek(Math.min(duration || 0, currentTime + 0.1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, duration, seek])

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

  const handleDeleteItem = () => {
    if (!selectedItem) return
    if (selectedItem.type === 'cut' && project.cuts) {
      const cutToRemove = project.cuts.find((c) => c.id === selectedItem.id)
      if (!cutToRemove) return

      const cutDur = cutToRemove.end - cutToRemove.start

      const newCuts = project.cuts
        .filter((c) => c.id !== selectedItem.id)
        .map((c) => {
          if (c.start >= cutToRemove.end) {
            return { ...c, start: c.start - cutDur, end: c.end - cutDur }
          }
          return c
        })

      update({
        cuts: newCuts,
        videoDuration: Math.max(0, (project.videoDuration || 0) - cutDur),
      })
      setSelectedItem(null)
    } else if (selectedItem.type === 'broll' && project.bRolls) {
      update({ bRolls: project.bRolls.filter((b) => b.id !== selectedItem.id) })
      setSelectedItem(null)
    }
  }

  const handleAddBRoll = () => {
    const newBRoll: BRoll = {
      id: crypto.randomUUID(),
      start: currentTime,
      end: currentTime + 3,
      url: `https://img.usecurling.com/p/800/1200?q=scene&dpr=2&seed=${Date.now()}`,
      transitionStyle: 'fade',
    }
    update({ bRolls: [...(project.bRolls || []), newBRoll] })
  }

  return (
    <div className="h-48 bg-background border-t flex flex-col shrink-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] relative select-none">
      <div className="h-12 border-b flex items-center px-4 gap-4 bg-card shrink-0">
        <Button
          variant={isPlaying ? 'secondary' : 'default'}
          size="icon"
          className="w-8 h-8 rounded-full shadow-sm transition-transform active:scale-95 shrink-0"
          onClick={isPlaying ? pause : play}
          disabled={isGenerating || (!!project.videoUrl && !isVideoLoaded)}
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
          {isGenerating ? (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-none gap-1 animate-pulse"
            >
              <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin inline-block" />{' '}
              <span className="hidden sm:inline">Criando vídeo...</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />{' '}
              <span className="hidden sm:inline">Tudo Pronto</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seek(Math.max(0, currentTime - 0.1))}
            title="Voltar 1 Frame"
            className="hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => seek(Math.min(duration || 0, currentTime + 0.1))}
            title="Avançar 1 Frame"
            className="hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {!project.cuts?.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBRoll}
              disabled={isGenerating}
              className="hidden sm:flex text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Cena
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteItem}
            disabled={isGenerating || !selectedItem}
          >
            <Trash2 className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Remover Cena</span>
          </Button>
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
              onClick={(e) => {
                handleSeek(e)
                setSelectedItem(null)
              }}
            />

            <div
              className={cn(
                'pt-6 px-4 space-y-3 relative z-20 transition-opacity',
                isGenerating ? 'opacity-50' : '',
              )}
            >
              <div className="relative h-20 bg-black/5 dark:bg-white/5 rounded-md border border-border pointer-events-auto">
                <div className="absolute -left-2 top-0 bottom-0 flex items-center -translate-x-full px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-20 justify-end pointer-events-none">
                  Cenas
                </div>

                {project.cuts && project.cuts.length > 0
                  ? project.cuts.map((cut, i) => (
                      <div
                        key={cut.id}
                        className={cn(
                          'absolute top-1 bottom-1 border rounded flex flex-col px-2 text-[10px] overflow-hidden shadow-sm group transition-colors cursor-pointer justify-center items-center',
                          selectedItem?.id === cut.id
                            ? 'bg-emerald-500/40 border-primary ring-2 ring-primary/50 text-emerald-900 dark:text-emerald-100 z-10'
                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/30',
                        )}
                        style={{
                          left: cut.start * PIXELS_PER_SEC,
                          width: (cut.end - cut.start) * PIXELS_PER_SEC,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem({ id: cut.id, type: 'cut' })
                        }}
                      >
                        <span className="truncate w-full font-bold text-center pointer-events-none text-xs">
                          Corte #{i + 1}
                        </span>
                      </div>
                    ))
                  : project.bRolls?.map((br, i) => {
                      const sub =
                        project.aiClips?.[0]?.subtitles.find(
                          (s) => s.start >= br.start && s.start < br.end,
                        ) ||
                        project.aiClips?.[0]?.subtitles.find(
                          (s) => s.start <= br.start && s.end > br.start,
                        )
                      return (
                        <div key={br.id}>
                          <div
                            className={cn(
                              'absolute top-1 bottom-1 border rounded overflow-hidden group transition-colors shadow-sm cursor-pointer flex flex-col',
                              selectedItem?.id === br.id
                                ? 'bg-indigo-500/40 border-primary ring-2 ring-primary/50 z-10'
                                : 'bg-indigo-500/20 border-indigo-500/50 hover:bg-indigo-500/30',
                            )}
                            style={{
                              left: br.start * PIXELS_PER_SEC,
                              width: (br.end - br.start) * PIXELS_PER_SEC,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem({ id: br.id, type: 'broll' })
                            }}
                          >
                            {br.url && (
                              <img
                                src={br.url}
                                alt=""
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover opacity-60 pointer-events-none absolute inset-0 z-0"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none z-10">
                              <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                            {sub && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 truncate pointer-events-none z-20 font-medium">
                                {sub.text}
                              </div>
                            )}
                          </div>
                          {i < (project.bRolls?.length || 0) - 1 && (
                            <div
                              className="absolute top-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                              style={{ left: br.end * PIXELS_PER_SEC - 12 }}
                            >
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-6 h-6 rounded-full bg-background border-indigo-500 shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
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
                                    Como a imagem vai passar
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
                                          {style === 'none'
                                            ? 'Corte Seco'
                                            : style === 'fade'
                                              ? 'Suave'
                                              : style === 'slide'
                                                ? 'Deslizar'
                                                : 'Aproximar'}
                                        </Button>
                                      ),
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                      )
                    })}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>
    </div>
  )
}
