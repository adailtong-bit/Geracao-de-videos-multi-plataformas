import { Project, CutSegment } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Clock,
  Film,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  Video,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import { VIDEO_FORMATS } from '@/lib/video-formats'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  onNext: () => void
  update?: (updates: Partial<Project>) => void
}

const ASSET_CATEGORIES: Record<string, string[]> = {
  Sombrio: [
    'dark,spooky,night',
    'creepy,forest',
    'abandoned,house',
    'fog,dark',
  ],
  Floresta: [
    'forest,nature,trees',
    'jungle,green',
    'woods,sunlight',
    'river,forest',
  ],
  Urbano: [
    'city,street,neon',
    'cyberpunk,city',
    'urban,alley',
    'skyscraper,night',
  ],
}

export function TimelinePanel({ project, onNext, update }: Props) {
  const { toast } = useToast()

  const [assetLibOpenFor, setAssetLibOpenFor] = useState<{
    start: number
    end: number
  } | null>(null)
  const [assetCategory, setAssetCategory] = useState('Floresta')

  const bRolls = project.bRolls || []
  const subtitles = project.aiClips?.[0]?.subtitles || []

  const isVideoSource =
    project.cuts && project.cuts.some((c) => c.sourceStart !== undefined)

  const format = VIDEO_FORMATS.find((f) => f.id === project.targetFormat)
  const totalDuration =
    project.cuts?.reduce((sum, c) => sum + (c.end - c.start), 0) ||
    project.videoDuration ||
    0

  const segments = isVideoSource
    ? project.cuts!.map((c) => {
        const sub =
          subtitles.find((s) => s.start >= c.start && s.start < c.end) ||
          subtitles.find((s) => s.start >= c.start)
        return {
          id: c.id,
          text: sub?.text || 'Trecho de fala extraído',
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

  const handleImageSelect = (url: string) => {
    if (!assetLibOpenFor || !update || !project.bRolls) return
    const newBRolls = [...project.bRolls]
    const existingIndex = newBRolls.findIndex(
      (br) =>
        br.start <= assetLibOpenFor.start + 0.1 &&
        br.end >= assetLibOpenFor.end - 0.1,
    )

    if (existingIndex >= 0) {
      newBRolls[existingIndex] = { ...newBRolls[existingIndex], url }
    } else {
      newBRolls.push({
        id: crypto.randomUUID(),
        start: assetLibOpenFor.start,
        end: assetLibOpenFor.end,
        url,
        transitionStyle: 'fade',
      })
    }

    update({ bRolls: newBRolls })
    setAssetLibOpenFor(null)
  }

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAdjustIdealDuration = () => {
    if (!project.aiClips?.[0]?.subtitles || !project.bRolls) return

    let currentStart = 0
    const newSubtitles = project.aiClips[0].subtitles.map((sub) => {
      const idealDuration = Math.max(2.0, sub.text.length * 0.065)
      const start = currentStart
      const end = start + idealDuration
      currentStart = end
      return { ...sub, start, end }
    })

    let currentBRollStart = 0
    const newBRolls = project.bRolls.map((br, i) => {
      const sub = newSubtitles[i]
      if (sub) {
        return { ...br, start: sub.start, end: sub.end }
      }
      const dur = br.end - br.start
      const start = currentBRollStart
      const end = start + dur
      currentBRollStart = end
      return { ...br, start, end }
    })

    if (update) {
      update({
        aiClips: [{ ...project.aiClips[0], subtitles: newSubtitles }],
        bRolls: newBRolls,
        videoDuration: currentStart,
      })
      toast({
        title: 'Tempo Ajustado',
        description:
          'Os tempos das cenas foram arrumados para combinar certinho com a fala.',
      })
    }
  }

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 text-center">
        <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-semibold text-foreground">
          Nenhuma cena criada
        </p>
        <p className="text-xs mt-1 max-w-[200px] leading-relaxed">
          Volte na aba "Criar" para gerar a primeira versão do seu vídeo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-indigo-500" /> Cenas do Vídeo
        </h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-500/10 p-2 rounded-md border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {isVideoSource
              ? 'Vídeo cortado com base nas falas importantes.'
              : 'As imagens e os textos foram colocados em ordem para você.'}
          </div>

          {!isVideoSource && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAdjustIdealDuration}
              className="w-full sm:w-max mt-2 font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              Arrumar Tempo das Imagens
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((seg, idx) => {
          const isTooShort =
            seg.end - seg.start > 0 &&
            seg.text.length / 18 > seg.end - seg.start

          return (
            <div
              key={seg.id}
              className="flex flex-col bg-card border rounded-xl shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors z-10" />

              <div className="flex gap-4 p-3">
                <div
                  className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-muted relative border border-border/50 flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    !seg.isCut &&
                    update &&
                    setAssetLibOpenFor({ start: seg.start, end: seg.end })
                  }
                >
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
                    </div>
                  )}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                    {formatTime(seg.start)}
                  </div>
                  {!seg.isCut && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-1 rounded">
                        Trocar Imagem
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-start gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      Cena {idx + 1}
                    </p>

                    <div className="flex items-center gap-2">
                      {isTooShort && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-4 h-4 text-red-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-destructive text-destructive-foreground"
                          >
                            <p>
                              A imagem some rápido demais para a pessoa ler o
                              texto.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                        Duração: {(seg.end - seg.start).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-foreground text-pretty border-l-2 border-muted pl-2">
                    "{seg.text}"
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!assetLibOpenFor}
        onOpenChange={(o) => !o && setAssetLibOpenFor(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Escolher Nova Imagem
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <Tabs value={assetCategory} onValueChange={setAssetCategory}>
              <TabsList className="grid w-full grid-cols-3">
                {Object.keys(ASSET_CATEGORIES).map((cat) => (
                  <TabsTrigger value={cat} key={cat} className="font-semibold">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {ASSET_CATEGORIES[assetCategory].map((query, index) => (
                  <div
                    key={index}
                    className="relative aspect-[9/16] group rounded-xl overflow-hidden shadow-sm border"
                  >
                    <img
                      src={`https://img.usecurling.com/p/400/600?q=${query}&seed=${query.length + index}`}
                      onClick={() =>
                        handleImageSelect(
                          `https://img.usecurling.com/p/800/1200?q=${query}&seed=${query.length + index}`,
                        )
                      }
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                      alt={query}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="pointer-events-auto h-8 text-xs font-bold"
                        onClick={() =>
                          handleImageSelect(
                            `https://img.usecurling.com/p/800/1200?q=${query}&seed=${query.length + index}`,
                          )
                        }
                      >
                        Usar Imagem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <div className="pt-4 border-t">
        <Button
          className="w-full font-bold h-12 shadow-md transition-all relative overflow-hidden"
          onClick={onNext}
        >
          <Eye className="w-4 h-4 mr-2" /> Avançar para Efeitos e Avatar
        </Button>
      </div>
    </div>
  )
}
