import { useState } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { isValidVideoUrl } from '@/lib/utils'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function MediaPanel({ project, update }: Props) {
  const { toast } = useToast()
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)

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
    // Simulate automated URL processing and fetching
    setTimeout(() => {
      setIsImporting(false)
      update({
        videoUrl:
          'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
        videoDuration: 120,
        trimStart: 0,
        trimEnd: 120,
      })
      setImportUrl('')
      toast({ title: 'Mídia puxada com sucesso!' })
    }, 1500)
  }

  const handleFakeUpload = () => {
    update({
      videoUrl:
        'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
      videoDuration: 120,
      trimStart: 0,
      trimEnd: 120,
    })
    toast({ title: 'Arquivo carregado com sucesso!' })
  }

  const duration = project.trimEnd - project.trimStart

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" /> Fonte da Mídia
        </h3>

        {!project.videoUrl ? (
          <div className="space-y-6">
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
                  Cole a URL do Instagram, TikTok ou YouTube para puxar o vídeo
                  diretamente, sem precisar baixar o arquivo.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="https://..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                    className="h-11 text-sm bg-background/50 focus-visible:ring-1"
                    disabled={isImporting}
                  />
                  <Button
                    className="w-full h-11 font-semibold transition-all"
                    onClick={handleImportUrl}
                    disabled={isImporting || !importUrl.trim()}
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4 mr-2" />
                    )}
                    {isImporting ? 'Extraindo vídeo...' : 'Puxar Vídeo'}
                  </Button>
                </div>
              </div>
            </div>

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
              <p className="text-sm font-medium">Selecionar do computador</p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, MOV até 500MB
              </p>
            </div>
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
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" /> Ferramenta de Corte
          </h3>
          <div className="space-y-6 bg-background p-5 rounded-xl border shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Início (s)</Label>
                <Input
                  type="number"
                  value={project.trimStart}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0 && val < project.trimEnd)
                      update({ trimStart: val })
                  }}
                  disabled={!project.videoUrl}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fim (s)</Label>
                <Input
                  type="number"
                  value={project.trimEnd}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (
                      val > project.trimStart &&
                      val <= (project.videoDuration || 100)
                    )
                      update({ trimEnd: val })
                  }}
                  disabled={!project.videoUrl}
                />
              </div>
            </div>

            <div className="px-2">
              <Slider
                value={[project.trimStart, project.trimEnd]}
                max={project.videoDuration || 100}
                step={1}
                disabled={!project.videoUrl}
                onValueChange={([start, end]) => {
                  if (end - start >= 1) {
                    update({ trimStart: start, trimEnd: end })
                  }
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium text-primary">
                Duração: {duration}s
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!project.videoUrl}
                onClick={() =>
                  toast({
                    title: 'Visualizando corte...',
                    description: `Tocando segmento de ${project.trimStart}s a ${project.trimEnd}s`,
                  })
                }
              >
                <PlayCircle className="w-4 h-4 mr-2" /> Prévia
              </Button>
            </div>
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
      </div>
    </div>
  )
}
