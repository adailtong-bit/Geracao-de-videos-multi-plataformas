import { Project, Platform } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Eye } from 'lucide-react'
import { SimulatorDisplay } from './SimulatorDisplay'

interface Props {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewSimulatorModal({ project, open, onOpenChange }: Props) {
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [showSafeZones, setShowSafeZones] = useState(false)

  const totalCutsDuration =
    project.cuts?.reduce((acc, cut) => acc + (cut.end - cut.start), 0) || 0
  const duration =
    totalCutsDuration > 0 ? totalCutsDuration : project.videoDuration || 0
  const durationFormatted = Math.round(duration * 10) / 10

  const is916 = project.aspectRatio === '9:16'
  const is45 = project.aspectRatio === '4:5'

  const validations = {
    tiktok: {
      duration: duration <= 600,
      aspect: is916,
      durationText: `${durationFormatted}s / 600s máx`,
      aspectText: is916 ? '9:16 Otimizado' : '9:16 Recomendado',
    },
    instagram: {
      duration: duration <= 90,
      aspect: is916,
      durationText: `${durationFormatted}s / 90s máx`,
      aspectText: is916 ? '9:16 Otimizado' : '9:16 Recomendado',
    },
    facebook: {
      duration: duration <= 240,
      aspect: is45 || is916,
      durationText: `${durationFormatted}s / 240s máx`,
      aspectText: is45 || is916 ? 'Otimizado' : '4:5 ou 9:16 Recomendado',
    },
  }

  const currentValidation = validations[platform]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col md:flex-row gap-0 p-0 overflow-hidden">
        <div className="w-full md:w-[320px] bg-muted/10 border-b md:border-b-0 md:border-r flex flex-col p-6 overflow-y-auto shrink-0">
          <DialogHeader className="mb-6">
            <DialogTitle>Pré-visualizar & Analisar</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Simulador de Plataforma
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {(['tiktok', 'instagram', 'facebook'] as Platform[]).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={platform === p ? 'default' : 'outline'}
                      className="justify-start capitalize"
                      onClick={() => setPlatform(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Análise Pré-Publicação
              </Label>
              <div className="bg-background border rounded-lg p-4 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {currentValidation.duration ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Duração</p>
                    <p className="text-xs text-muted-foreground">
                      {currentValidation.durationText}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {currentValidation.aspect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      Proporção (Aspect Ratio)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentValidation.aspectText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="safe-zones"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Mostrar Zonas Seguras
                </Label>
                <Switch
                  id="safe-zones"
                  checked={showSafeZones}
                  onCheckedChange={setShowSafeZones}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Destaca áreas cobertas pela interface nativa do app para evitar
                posicionar elementos importantes nessas regiões.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Voltar ao Editor
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-black/5 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-0">
          <SimulatorDisplay
            project={project}
            platform={platform}
            showSafeZones={showSafeZones}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
