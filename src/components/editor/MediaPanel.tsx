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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function MediaPanel({ project, update }: Props) {
  const { toast } = useToast()

  const handleFakeUpload = () => {
    update({
      videoUrl:
        'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
      videoDuration: 120,
      trimStart: 0,
      trimEnd: 120,
    })
  }

  const duration = project.trimEnd - project.trimStart

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" /> Importar Mídia
        </h3>
        {!project.videoUrl ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/30 transition-colors hover:bg-muted/50 shadow-sm">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
              <p className="mb-1 font-medium">Faça upload de um vídeo</p>
              <p className="mb-4 text-xs text-muted-foreground">
                MP4, MOV até 500MB
              </p>
              <Button onClick={handleFakeUpload} size="sm">
                Selecionar Arquivo
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-medium">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-muted/50 shadow-sm">
              <Label className="text-xs">Importar via URL</Label>
              <div className="flex gap-2">
                <Input placeholder="https://..." className="h-9 text-xs" />
                <Button size="sm" onClick={handleFakeUpload}>
                  Importar
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={handleFakeUpload}
              >
                Carregar Exemplo
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-background rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[160px] md:max-w-[200px]">
                {project.name.toLowerCase().replace(' ', '_')}.mp4
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1080p • {project.videoDuration}s de duração
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleFakeUpload}>
              Substituir
            </Button>
          </div>
        )}
      </div>

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
              />
            </div>
          </div>

          <div className="px-2">
            <Slider
              value={[project.trimStart, project.trimEnd]}
              max={project.videoDuration || 100}
              step={1}
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
              onClick={() =>
                toast({
                  title: 'Visualizando corte...',
                  description: `Tocando segmento de ${project.trimStart}s a ${project.trimEnd}s`,
                })
              }
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Prévia do Corte
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
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
            >
              <Instagram className="w-5 h-5" />
              <span className="text-xs">Reel</span>
            </Button>
            <Button
              variant={project.aspectRatio === '9:16' ? 'default' : 'outline'}
              className="flex flex-col h-auto py-3 gap-1 px-1"
              onClick={() => update({ aspectRatio: '9:16' })}
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
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs">FB Feed</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
