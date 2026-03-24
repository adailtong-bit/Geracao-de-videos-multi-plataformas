import { Platform } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Eye, ArrowRight, Smartphone } from 'lucide-react'

interface Props {
  platform: Platform
  setPlatform: (p: Platform) => void
  showSafeZones: boolean
  setShowSafeZones: (show: boolean) => void
  onNext: () => void
}

export function PreviewPanel({
  platform,
  setPlatform,
  showSafeZones,
  setShowSafeZones,
  onNext,
}: Props) {
  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" /> Simulador de Redes
        </h3>
        <p className="text-sm text-muted-foreground">
          Veja como seu conteúdo ficará em diferentes plataformas antes de
          publicar.
        </p>

        <div className="space-y-3 pt-2">
          <Label className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">
            Plataforma
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {(['tiktok', 'instagram', 'facebook'] as Platform[]).map((p) => (
              <Button
                key={p}
                variant={platform === p ? 'default' : 'outline'}
                className="justify-start capitalize font-medium"
                onClick={() => setPlatform(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-background p-5 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="safe-zones-panel"
            className="flex items-center gap-2 cursor-pointer font-semibold"
          >
            <Eye className="w-4 h-4 text-primary" /> Zonas Seguras (Máscara)
          </Label>
          <Switch
            id="safe-zones-panel"
            checked={showSafeZones}
            onCheckedChange={setShowSafeZones}
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ative para exibir máscaras transparentes que representam os elementos
          de interface nativos (como botões de curtir, comentários e descrição).
          Isso garante que suas legendas e elementos não sejam cobertos.
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <Button
          className="w-full font-bold shadow-md h-12"
          size="lg"
          onClick={onNext}
        >
          Próximo Passo: Publicar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
