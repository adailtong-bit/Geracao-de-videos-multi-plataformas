import { Project, CutSegment } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock,
  Film,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  Scissors,
  Video,
  Settings2,
  AlertTriangle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { VIDEO_FORMATS } from '@/lib/video-formats'

interface Props {
  project: Project
  onNext: () => void
  update?: (updates: Partial<Project>) => void
}

function formatTimecode(seconds: number) {
  if (isNaN(seconds)) return '00:00:00.000'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`
}

function parseTimecode(str: string) {
  const parts = str.split(':')
  if (parts.length === 3) {
    return (
      parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
    )
  }
  return parseFloat(str)
}

function ManualTrimEditor({
  cut,
  updateCut,
}: {
  cut: CutSegment
  updateCut: (id: string, start: number, end: number) => void
}) {
  const [localStartStr, setLocalStartStr] = useState(formatTimecode(cut.start))
  const [localEndStr, setLocalEndStr] = useState(formatTimecode(cut.end))

  useEffect(() => {
    setLocalStartStr(formatTimecode(cut.start))
    setLocalEndStr(formatTimecode(cut.end))
  }, [cut.start, cut.end])

  const handleStartChange = (val: string) => {
    setLocalStartStr(val)
  }

  const handleStartBlur = () => {
    const s = parseTimecode(localStartStr)
    const e = parseTimecode(localEndStr)
    if (!isNaN(s) && !isNaN(e) && e > s) {
      updateCut(cut.id, s, e)
    } else {
      setLocalStartStr(formatTimecode(cut.start))
    }
  }

  const handleEndChange = (val: string) => {
    setLocalEndStr(val)
  }

  const handleEndBlur = () => {
    const s = parseTimecode(localStartStr)
    const e = parseTimecode(localEndStr)
    if (!isNaN(e) && !isNaN(s) && e > s) {
      updateCut(cut.id, s, e)
    } else {
      setLocalEndStr(formatTimecode(cut.end))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Início (HH:MM:SS.mmm)
        </Label>
        <Input
          className="h-8 text-xs bg-muted/50 font-mono focus-visible:ring-indigo-500"
          value={localStartStr}
          onChange={(e) => handleStartChange(e.target.value)}
          onBlur={handleStartBlur}
          placeholder="00:00:00.000"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Fim (HH:MM:SS.mmm)
        </Label>
        <Input
          className="h-8 text-xs bg-muted/50 font-mono focus-visible:ring-indigo-500"
          value={localEndStr}
          onChange={(e) => handleEndChange(e.target.value)}
          onBlur={handleEndBlur}
          placeholder="00:00:00.000"
        />
      </div>
    </div>
  )
}

export function TimelinePanel({ project, onNext, update }: Props) {
  const [editingCutId, setEditingCutId] = useState<string | null>(null)

  const bRolls = project.bRolls || []
  const subtitles = project.aiClips?.[0]?.subtitles || []

  const isVideoSource =
    project.cuts && project.cuts.some((c) => c.sourceStart !== undefined)

  const format = VIDEO_FORMATS.find((f) => f.id === project.targetFormat)
  const totalDuration =
    project.cuts?.reduce((sum, c) => sum + (c.end - c.start), 0) ||
    project.videoDuration ||
    0

  const isExceedingMax = format?.max !== undefined && totalDuration > format.max
  const isBelowMin = format?.min !== undefined && totalDuration < format.min

  // Pure Editing Mode: Map cuts directly to UI if source is video, ignoring B-rolls
  const segments = isVideoSource
    ? project.cuts!.map((c) => {
        const sub =
          subtitles.find((s) => s.start >= c.start && s.start < c.end) ||
          subtitles.find((s) => s.start >= c.start)
        return {
          id: c.id,
          text: sub?.text || 'Trecho de entrevista capturado',
          start: c.start,
          end: c.end,
          imageUrl: '',
          isCut: true,
          originalCut: c,
        }
      })
    : subtitles.map((sub) => {
        const bRoll = bRolls.find(
          (br) => br.start <= sub.start + 0.1 && br.end >= sub.end - 0.1,
        )
        return {
          id: sub.id,
          text: sub.text,
          start: sub.start,
          end: sub.end,
          imageUrl: bRoll?.url || '',
          isCut: false,
        }
      })

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 text-center">
        <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-semibold text-foreground">
          Nenhuma sequência visual gerada
        </p>
        <p className="text-xs mt-1 max-w-[200px] leading-relaxed">
          Crie ou importe sua história na aba anterior para ver a correlação
          visual limpa.
        </p>
      </div>
    )
  }

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleUpdateCut = (id: string, start: number, end: number) => {
    if (!update || !project.cuts) return
    const updatedCuts = project.cuts.map((c) =>
      c.id === id
        ? { ...c, start, end, sourceStart: start, sourceEnd: end }
        : c,
    )
    update({
      cuts: updatedCuts,
      videoDuration: updatedCuts.reduce((sum, c) => sum + (c.end - c.start), 0),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {isVideoSource ? (
            <Scissors className="w-5 h-5 text-indigo-500" />
          ) : (
            <Film className="w-5 h-5 text-indigo-500" />
          )}
          {isVideoSource ? 'Cortes Multicâmera' : 'Sequência Visual'}
        </h3>

        {/* Compliance Notifications */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-500/10 p-2 rounded-md border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {isVideoSource
              ? 'Apenas cortes originais baseados no fluxo de diálogo.'
              : 'Textos removidos do centro da tela. Transições orgânicas aplicadas.'}
          </div>

          {isExceedingMax && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-500/10 p-2 rounded-md border border-red-500/20 animate-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Limite do {format?.label} ({format?.max}s) excedido. Ajuste a
              duração.
            </div>
          )}

          {isBelowMin && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-500/10 p-2 rounded-md border border-amber-500/20 animate-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Aviso: Para monetização no {format?.label}, o mínimo é{' '}
              {format?.min}s.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((seg, idx) => (
          <div
            key={seg.id}
            className="flex flex-col bg-card border rounded-xl shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors z-10" />

            <div className="flex gap-4 p-3">
              <div className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-muted relative border border-border/50 flex items-center justify-center">
                {seg.imageUrl ? (
                  <img
                    src={seg.imageUrl}
                    alt={`Cena ${idx}`}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-muted-foreground/50 gap-1">
                    {seg.isCut ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    {seg.isCut && (
                      <span className="text-[9px] font-bold">Corte Fonte</span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3" />
                  {formatTime(seg.start)}
                </div>
              </div>
              <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    {seg.isCut ? (
                      <Scissors className="w-3 h-3" />
                    ) : (
                      <Film className="w-3 h-3" />
                    )}
                    {seg.isCut
                      ? `Corte Inteligente ${idx + 1}`
                      : `Cena Visual ${idx + 1}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                      {(seg.end - seg.start).toFixed(2)}s
                    </span>
                    {seg.isCut && update && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-md ${editingCutId === seg.id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() =>
                          setEditingCutId(
                            editingCutId === seg.id ? null : seg.id,
                          )
                        }
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground text-pretty italic border-l-2 border-muted pl-2 line-clamp-3">
                  Áudio capturado: "{seg.text}"
                </p>
              </div>
            </div>

            {/* Manual Duration Override Panel */}
            {editingCutId === seg.id && seg.isCut && seg.originalCut && (
              <div className="px-3 pb-3 pt-1 bg-muted/10">
                <ManualTrimEditor
                  cut={seg.originalCut}
                  updateCut={handleUpdateCut}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button
          className="w-full font-bold h-12 shadow-md transition-all relative overflow-hidden"
          onClick={onNext}
          disabled={isExceedingMax}
          variant={isExceedingMax ? 'secondary' : 'default'}
        >
          {isExceedingMax ? (
            <span className="text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> Bloqueado: Excede{' '}
              {format?.max}s
            </span>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" /> Avançar para Revisão
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
