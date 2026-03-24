import { useState, useEffect } from 'react'
import { Project, CutSegment } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  Film,
  Scissors,
  Crop,
  Instagram,
  Facebook,
  PlayCircle,
  Link as LinkIcon,
  CloudDownload,
  Loader2,
  Trash2,
  ArrowRight,
  Search,
  Video,
  Wand2,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { isValidVideoUrl } from '@/lib/utils'
import { usePlayerControls, usePlayerState } from '@/stores/usePlayerStore'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext?: () => void
}

export function MediaPanel({ project, update, onNext }: Props) {
  const { toast } = useToast()
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [stockQuery, setStockQuery] = useState('')
  const [stockResults, setStockResults] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const { seek, play } = usePlayerControls()
  const { currentTime } = usePlayerState()

  const generateEnergyData = (duration: number) => {
    const data = []
    for (let i = 0; i <= duration; i += 0.5) {
      data.push({
        time: i,
        value:
          Math.random() > 0.8 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.4,
      })
    }
    return data
  }

  const handleImportUrl = () => {
    if (!importUrl.trim()) return

    if (!isValidVideoUrl(importUrl)) {
      toast({
        title: 'Link não suportado',
        description:
          'Não foi possível carregar este vídeo. Verifique o link e tente novamente.',
        variant: 'destructive',
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    const interval = setInterval(() => {
      setImportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 20
      })
    }, 300)

    setTimeout(() => {
      clearInterval(interval)
      setIsImporting(false)
      const duration = 15 // Mock duration
      update({
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        videoDuration: duration,
        cuts: [],
        energyData: generateEnergyData(duration),
      })
      setImportUrl('')
      toast({ title: 'Mídia puxada com sucesso!' })
    }, 2000)
  }

  useEffect(() => {
    if (
      importUrl.trim() &&
      isValidVideoUrl(importUrl) &&
      !isImporting &&
      !project.videoUrl
    ) {
      handleImportUrl()
    }
  }, [importUrl, isImporting, project.videoUrl])

  const handleFakeUpload = () => {
    const duration = 15
    update({
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoDuration: duration,
      cuts: [],
      energyData: generateEnergyData(duration),
    })
    toast({ title: 'Arquivo carregado com sucesso!' })
  }

  const handleSearchStock = () => {
    if (!stockQuery) return
    const results = Array.from({ length: 4 }).map(
      (_, i) =>
        `https://img.usecurling.com/p/200/300?q=${encodeURIComponent(stockQuery)}&seed=${i}`,
    )
    setStockResults(results)
  }

  const handleAddBRoll = (url: string) => {
    if (!project.videoUrl) return
    const start = currentTime
    const end = Math.min(start + 3, project.videoDuration || 100)
    update({
      bRolls: [
        ...(project.bRolls || []),
        {
          id: crypto.randomUUID(),
          start,
          end,
          url,
          keyword: stockQuery || 'stock',
        },
      ],
    })
    toast({ title: 'B-Roll adicionado na linha do tempo!' })
  }

  const handleAutoSuggestBRolls = () => {
    setIsSuggesting(true)
    toast({
      title: 'Analisando pausas...',
      description: 'Procurando momentos de baixa energia...',
    })
    setTimeout(() => {
      setIsSuggesting(false)
      const bRolls = [...(project.bRolls || [])]
      const start = project.videoDuration ? project.videoDuration * 0.3 : 2
      bRolls.push({
        id: crypto.randomUUID(),
        start,
        end: start + 3,
        url: 'https://img.usecurling.com/p/200/300?q=nature&seed=99',
        keyword: 'nature',
      })
      update({ bRolls })
      toast({ title: 'B-Rolls sugeridos adicionados com sucesso!' })
    }, 2000)
  }

  const handleUpdateCut = (id: string, updates: Partial<CutSegment>) => {
    const newCuts = (project.cuts || []).map((c) =>
      c.id === id ? { ...c, ...updates } : c,
    )
    update({ cuts: newCuts })
  }

  const handleDeleteCut = (id: string) => {
    update({ cuts: (project.cuts || []).filter((c) => c.id !== id) })
  }

  const handleDeleteBRoll = (id: string) => {
    update({ bRolls: (project.bRolls || []).filter((c) => c.id !== id) })
  }

  const previewCut = (start: number) => {
    seek(start)
    play()
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" /> Fonte da Mídia
        </h3>

        {!project.videoUrl ? (
          <div className="space-y-6">
            {isImporting ? (
              <div className="bg-card border-2 border-primary/20 rounded-xl p-8 shadow-sm text-center space-y-4 animate-fade-in">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <h3 className="font-bold text-lg">Puxando vídeo...</h3>
                <Progress
                  value={importProgress}
                  className="h-2 w-full max-w-[200px] mx-auto bg-muted/50"
                />
                <p className="text-sm text-muted-foreground">
                  Isso pode levar alguns segundos dependendo do tamanho.
                </p>
              </div>
            ) : (
              <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all focus-within:border-primary/50">
                <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
                  <LinkIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-base flex items-center gap-2 mb-2">
                    <CloudDownload className="w-5 h-5 text-primary" /> Importar
                    via Link
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Cole a URL do Instagram, TikTok ou YouTube para puxar o
                    vídeo diretamente, sem precisar baixar o arquivo.
                  </p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Cole o link do vídeo aqui"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                      className="h-11 text-sm bg-background/50 focus-visible:ring-1"
                    />
                    <Button
                      className="w-full h-11 font-semibold transition-all"
                      onClick={handleImportUrl}
                      disabled={!importUrl.trim()}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Puxar Vídeo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isImporting && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-muted/5 px-2 text-muted-foreground">
                      Ou Upload Manual
                    </span>
                  </div>
                </div>

                <div
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={handleFakeUpload}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-sm font-medium">
                    Selecionar do computador
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV até 500MB
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 bg-background rounded-xl border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                  {project.name.toLowerCase().replace(' ', '_')}.mp4
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  1080p • {project.videoDuration}s de duração
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ videoUrl: null })}
              className="text-xs h-8 px-3"
            >
              Remover
            </Button>
          </div>
        )}
      </div>

      <div
        className={
          !project.videoUrl
            ? 'opacity-50 pointer-events-none grayscale-[0.5]'
            : ''
        }
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" /> B-Rolls / Stock Video
            </h3>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              onClick={handleAutoSuggestBRolls}
              disabled={isSuggesting}
            >
              {isSuggesting ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Sugerir B-Rolls
            </Button>
          </div>

          <div className="space-y-3 bg-background p-4 rounded-xl border shadow-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar stock videos..."
                  className="pl-9 h-9 text-sm"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                />
              </div>
              <Button
                size="sm"
                className="h-9 px-4"
                onClick={handleSearchStock}
              >
                Buscar
              </Button>
            </div>

            {stockResults.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stockResults.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-video bg-muted rounded-md overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt="Stock result"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => handleAddBRoll(url)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {project.bRolls && project.bRolls.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Adicionados
                </Label>
                {project.bRolls.map((br) => (
                  <div
                    key={br.id}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded overflow-hidden">
                        <img
                          src={br.url}
                          alt="B-Roll"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-xs block">
                          {br.keyword || 'Stock Video'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {br.start.toFixed(1)}s - {br.end.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteBRoll(br.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 mt-8">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" /> Segmentos Cortados
          </h3>
          <div className="space-y-3 bg-background p-4 rounded-xl border shadow-sm max-h-[300px] overflow-y-auto">
            {!project.cuts || project.cuts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum corte marcado. Use a linha do tempo abaixo para marcar.
              </p>
            ) : (
              project.cuts.map((cut) => (
                <div
                  key={cut.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Início</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={cut.start}
                        onChange={(e) =>
                          handleUpdateCut(cut.id, {
                            start: Number(e.target.value),
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Fim</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={cut.end}
                        onChange={(e) =>
                          handleUpdateCut(cut.id, {
                            end: Number(e.target.value),
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => previewCut(cut.start)}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteCut(cut.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5 mt-8">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Crop className="w-5 h-5 text-primary" /> Adaptador de Formato
          </h3>
          <div className="space-y-4 bg-background p-5 rounded-xl border shadow-sm">
            <Label>Predefinições</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={project.aspectRatio === '9:16' ? 'default' : 'outline'}
                className="flex flex-col h-auto py-3 gap-1 px-1"
                onClick={() => update({ aspectRatio: '9:16' })}
                disabled={!project.videoUrl}
              >
                <Instagram className="w-5 h-5" />
                <span className="text-xs">Reel</span>
              </Button>
              <Button
                variant={project.aspectRatio === '9:16' ? 'default' : 'outline'}
                className="flex flex-col h-auto py-3 gap-1 px-1"
                onClick={() => update({ aspectRatio: '9:16' })}
                disabled={!project.videoUrl}
              >
                <div className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-current text-background rounded-sm">
                  t
                </div>
                <span className="text-xs">TikTok</span>
              </Button>
              <Button
                variant={project.aspectRatio === '4:5' ? 'default' : 'outline'}
                className="flex flex-col h-auto py-3 gap-1 px-1"
                onClick={() => update({ aspectRatio: '4:5' })}
                disabled={!project.videoUrl}
              >
                <Facebook className="w-5 h-5" />
                <span className="text-xs">FB Feed</span>
              </Button>
            </div>
          </div>
        </div>

        {project.videoUrl && onNext && (
          <div className="pt-8 border-t mt-8">
            <Button
              className="w-full font-bold shadow-md h-12"
              size="lg"
              onClick={onNext}
            >
              Próximo Passo: IA Engine <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
