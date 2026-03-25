import { Project, ApprovalStatus, AspectRatio, Language } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle2,
  Eye,
  Type,
  Settings2,
  Palette,
  Monitor,
  Send,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext?: () => void
}

export function ReviewPanel({ project, update, onNext }: Props) {
  const { toast } = useToast()

  const handleLanguageChange = (
    field: 'sourceLanguage' | 'subtitleLanguage',
    value: Language | 'none',
  ) => {
    update({ [field]: value, approvalStatus: 'revised' })
    toast({
      title: 'Idioma Atualizado',
      description: 'As configurações de idioma foram alteradas.',
    })
  }

  const handleSubtitleChange = (
    clipId: string,
    subId: string,
    newText: string,
  ) => {
    const updatedClips = project.aiClips?.map((clip) => {
      if (clip.id !== clipId) return clip
      return {
        ...clip,
        subtitles: clip.subtitles.map((s) =>
          s.id === subId ? { ...s, text: newText } : s,
        ),
      }
    })
    update({ aiClips: updatedClips, approvalStatus: 'revised' })
  }

  const handleColorChange = (
    key: keyof NonNullable<Project['colorSettings']>,
    value: any,
  ) => {
    const current = project.colorSettings || {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      preset: 'none',
    }
    update({
      colorSettings: { ...current, [key]: value },
      approvalStatus: 'revised',
    })
  }

  const setApproval = (status: ApprovalStatus) => {
    update({ approvalStatus: status })
    if (status === 'approved') {
      toast({
        title: 'Vídeo Aprovado!',
        description: 'O projeto está pronto para publicação.',
      })
    } else {
      toast({
        title: 'Status Alterado',
        description: `O status foi alterado para: ${status === 'review' ? 'Em Revisão' : 'Corrigido'}.`,
      })
    }
  }

  const currentStatus = project.approvalStatus || 'review'
  const colors = project.colorSettings || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    preset: 'none',
  }

  const statusConfig = {
    review: {
      label: 'Em Revisão',
      icon: <Eye className="w-4 h-4" />,
      color: 'text-amber-600 dark:text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    revised: {
      label: 'Corrigido',
      icon: <Settings2 className="w-4 h-4" />,
      color: 'text-blue-600 dark:text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    approved: {
      label: 'Aprovado',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-emerald-600 dark:text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  }

  const conf = statusConfig[currentStatus]

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-500" /> Revisão Final
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verifique textos, proporções e cores. Você precisa aprovar o vídeo
          para liberar a publicação nas redes sociais.
        </p>

        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${conf.bg} ${conf.border} transition-colors gap-4`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full bg-background ${conf.color} shadow-sm`}
            >
              {conf.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Fluxo de Aprovação
              </p>
              <p className={`font-semibold text-sm ${conf.color}`}>
                {conf.label}
              </p>
            </div>
          </div>
          {currentStatus !== 'approved' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
              onClick={() => {
                setApproval('approved')
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar Vídeo
            </Button>
          )}
          {currentStatus === 'approved' && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="bg-background"
                onClick={() => setApproval('revised')}
              >
                Desfazer
              </Button>
              {onNext && (
                <Button size="sm" onClick={onNext} className="font-bold">
                  Publicar <Send className="w-3.5 h-3.5 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="aspect"
        className="w-full space-y-3"
      >
        <AccordionItem
          value="aspect"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Monitor className="w-4 h-4 text-primary" /> Formato & Idioma
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <div className="space-y-3">
              <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Dimensão do Vídeo (Aspect Ratio)
              </Label>
              <Select
                value={project.aspectRatio}
                onValueChange={(v) =>
                  update({
                    aspectRatio: v as AspectRatio,
                    approvalStatus: 'revised',
                  })
                }
              >
                <SelectTrigger className="bg-background h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">
                    Shorts / Reels / TikTok (9:16)
                  </SelectItem>
                  <SelectItem value="16:9">YouTube Longo (16:9)</SelectItem>
                  <SelectItem value="1:1">
                    Square / Instagram Feed (1:1)
                  </SelectItem>
                  <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Idioma Principal</Label>
                <Select
                  value={project.sourceLanguage}
                  onValueChange={(v) =>
                    handleLanguageChange('sourceLanguage', v as Language)
                  }
                >
                  <SelectTrigger className="bg-background h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Legendas (Kill Switch)</Label>
                <Select
                  value={project.subtitleLanguage || 'none'}
                  onValueChange={(v) =>
                    handleLanguageChange('subtitleLanguage', v as any)
                  }
                >
                  <SelectTrigger className="bg-background h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Desativado (Nenhuma)</SelectItem>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="subtitles"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Type className="w-4 h-4 text-primary" /> Editor de Legendas
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            {project.aiClips && project.aiClips.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {project.aiClips[0].subtitles.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/30 border border-border/50 focus-within:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Trecho {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                        {sub.start.toFixed(1)}s - {sub.end.toFixed(1)}s
                      </span>
                    </div>
                    <Input
                      value={sub.text}
                      onChange={(e) =>
                        handleSubtitleChange(
                          project.aiClips![0].id,
                          sub.id,
                          e.target.value,
                        )
                      }
                      className="h-9 text-sm bg-background font-medium"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma legenda disponível para edição.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="colors"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Palette className="w-4 h-4 text-primary" /> Correção de Cor
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Brilho</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {colors.brightness}%
                </span>
              </div>
              <Slider
                value={[colors.brightness]}
                min={50}
                max={150}
                step={1}
                onValueChange={([v]) => handleColorChange('brightness', v)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Contraste</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {colors.contrast}%
                </span>
              </div>
              <Slider
                value={[colors.contrast]}
                min={50}
                max={150}
                step={1}
                onValueChange={([v]) => handleColorChange('contrast', v)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Saturação</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {colors.saturation}%
                </span>
              </div>
              <Slider
                value={[colors.saturation]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => handleColorChange('saturation', v)}
              />
            </div>
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-xs font-semibold">Filtro / Preset</Label>
              <Select
                value={colors.preset}
                onValueChange={(v) => handleColorChange('preset', v)}
              >
                <SelectTrigger className="bg-background h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (Original)</SelectItem>
                  <SelectItem value="grayscale">Preto e Branco</SelectItem>
                  <SelectItem value="sepia">Sépia (Quente)</SelectItem>
                  <SelectItem value="vintage">
                    Vintage (Contraste + Sépia)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
