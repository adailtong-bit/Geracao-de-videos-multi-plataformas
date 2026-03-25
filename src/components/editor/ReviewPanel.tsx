import { useState } from 'react'
import {
  Project,
  ApprovalStatus,
  Language,
  AvatarSettings,
  ListenerPersona,
} from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn, CHECKERBOARD_BG } from '@/lib/utils'
import {
  CheckCircle2,
  Eye,
  Type,
  Settings2,
  Palette,
  Globe,
  Send,
  User,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import useAvatarStore from '@/stores/useAvatarStore'
import { Link } from 'react-router-dom'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext?: () => void
}

export function ReviewPanel({ project, update, onNext }: Props) {
  const { toast } = useToast()
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false)
  const [avatarPrompt, setAvatarPrompt] = useState('')

  const {
    avatars,
    addAvatar,
    updateAvatar: updateStoreAvatar,
  } = useAvatarStore()
  const presets = avatars.filter(
    (a) => a.type === 'preset' && a.status === 'ready',
  )
  const customs = avatars.filter((a) => a.type === 'custom')

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

  const updateSubStyle = (key: string, value: any) => {
    const current = project.subtitleStyle || {
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.75)',
      fontSize: 14,
    }
    update({
      subtitleStyle: { ...current, [key]: value },
      approvalStatus: 'revised',
    })
  }

  const updateAvatarSettings = (key: keyof AvatarSettings, value: any) => {
    const current = project.avatar || {
      enabled: false,
      mode: 'preset',
      position: 'custom',
      positionX: 50,
      positionY: 80,
      scale: 1,
      zIndex: 20,
    }
    update({ avatar: { ...current, [key]: value }, approvalStatus: 'revised' })
  }

  const addListener = () => {
    const current = project.avatar || {
      enabled: false,
      mode: 'preset',
      position: 'custom',
      positionX: 50,
      positionY: 80,
      scale: 1,
    }
    const defaultImages = [
      'https://img.usecurling.com/ppl/medium?gender=female&seed=11',
      'https://img.usecurling.com/ppl/medium?gender=male&seed=22',
      'https://img.usecurling.com/ppl/medium?gender=female&seed=33',
    ]
    const newListener: ListenerPersona = {
      id: crypto.randomUUID(),
      imageUrl: defaultImages[Math.floor(Math.random() * defaultImages.length)],
      positionX: 20 + Math.random() * 60,
      positionY: 60 + Math.random() * 20,
      scale: 0.5 + Math.random() * 0.3,
      reactionTime: 5,
      reactionType: 'gasp',
    }
    update({
      avatar: {
        ...current,
        listeners: [...(current.listeners || []), newListener],
      } as any,
      approvalStatus: 'revised',
    })
  }

  const updateListener = (id: string, updates: Partial<ListenerPersona>) => {
    const listeners = project.avatar?.listeners?.map((l) =>
      l.id === id ? { ...l, ...updates } : l,
    )
    update({
      avatar: { ...project.avatar, listeners } as any,
      approvalStatus: 'revised',
    })
  }

  const removeListener = (id: string) => {
    const listeners = project.avatar?.listeners?.filter((l) => l.id !== id)
    update({
      avatar: { ...project.avatar, listeners } as any,
      approvalStatus: 'revised',
    })
  }

  const simulateProcessing = (
    avatarId: string,
    url: string,
    isGen: boolean,
  ) => {
    setIsProcessingAvatar(true)
    setTimeout(() => {
      updateStoreAvatar(avatarId, { status: 'training_motion' })
      setTimeout(() => {
        updateStoreAvatar(avatarId, { status: 'ready' })
        const current = project.avatar || {
          enabled: false,
          mode: 'preset',
          position: 'custom',
          positionX: 50,
          positionY: 80,
          scale: 1,
        }
        update({
          avatar: {
            ...current,
            enabled: true,
            mode: isGen ? 'generate' : 'upload',
            imageUrl: url,
          } as any,
          approvalStatus: 'revised',
        })
        setIsProcessingAvatar(false)
        setAvatarPrompt('')
        toast({
          title: 'Persona Aplicada',
          description:
            'Corpo reconstruído e motor neural conectado com sucesso.',
        })
      }, 2000)
    }, 1500)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const url = reader.result as string
        const newAv = addAvatar({
          name: 'Clone Rápido (Editor)',
          imageUrl: url,
          status: 'processing_bg',
        })
        simulateProcessing(newAv.id, url, false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarGenerate = () => {
    const url = `https://img.usecurling.com/p/400/400?q=portrait,${encodeURIComponent(avatarPrompt.slice(0, 20))}&dpr=2&seed=${Date.now()}`
    const newAv = addAvatar({
      name: `Gerado: ${avatarPrompt.slice(0, 10)}`,
      imageUrl: url,
      status: 'processing_bg',
    })
    simulateProcessing(newAv.id, url, true)
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
  const subColor = project.subtitleStyle?.color || '#ffffff'
  const subBg = project.subtitleStyle?.backgroundColor || 'rgba(0,0,0,0.75)'
  const subSize = project.subtitleStyle?.fontSize || 14

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
          <Settings2 className="w-5 h-5 text-amber-500" /> Studio de Edição
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verifique textos, adicione avatares e ouvintes reativos, e configure a
          atmosfera.
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
              onClick={() => setApproval('approved')}
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
        defaultValue="cores"
        className="w-full space-y-3"
      >
        {/* Cores e Efeitos */}
        <AccordionItem
          value="cores"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Palette className="w-4 h-4 text-primary" /> Visual Effects &
              Filtros
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-6">
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold">
                Galeria de Filtros
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Nenhum' },
                  { id: 'grayscale', label: 'P&B Clássico' },
                  { id: 'sepia', label: 'Sépia Quente' },
                  { id: 'vintage', label: 'Vintage' },
                  { id: 'film-grain', label: 'Film Grain' },
                  { id: 'candle-light', label: 'Candle Light' },
                  { id: 'noir', label: 'Noir' },
                ].map((f) => (
                  <Button
                    key={f.id}
                    variant={colors.preset === f.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 justify-center text-xs w-full"
                    onClick={() => handleColorChange('preset', f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
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
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Idiomas */}
        <AccordionItem
          value="idiomas"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Globe className="w-4 h-4 text-primary" /> Idiomas
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Idioma Principal (Narração)</Label>
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
              <Label className="text-xs">
                Idioma da Legenda (Tradução Simultânea)
              </Label>
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
          </AccordionContent>
        </AccordionItem>

        {/* Legendas */}
        <AccordionItem
          value="legendas"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Type className="w-4 h-4 text-primary" /> Legendas (Estilo e
              Textos)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Cor do Texto</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={subColor}
                    onChange={(e) => updateSubStyle('color', e.target.value)}
                    className="p-1 h-8 w-8 rounded cursor-pointer border-none"
                  />
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    {subColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cor de Fundo</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={subBg}
                    onChange={(e) =>
                      updateSubStyle('backgroundColor', e.target.value)
                    }
                    className="p-1 h-8 w-8 rounded cursor-pointer border-none"
                  />
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    {subBg}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Tamanho da Fonte</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {subSize}px
                </span>
              </div>
              <Slider
                value={[subSize]}
                min={10}
                max={40}
                step={1}
                onValueChange={([v]) => updateSubStyle('fontSize', v)}
              />
            </div>

            <div className="pt-4 border-t mt-4 space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {project.aiClips?.[0]?.subtitles.map((sub, idx) => (
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
          </AccordionContent>
        </AccordionItem>

        {/* Avatar */}
        <AccordionItem
          value="avatar"
          className="border rounded-xl px-4 bg-card shadow-sm"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-2 font-semibold text-sm">
              <User className="w-4 h-4 text-primary" /> Persona, Narrativa &
              Ambiente
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-4">
            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="flex flex-col">
                <Label className="font-semibold text-sm text-primary">
                  Ativar Persona em Cena
                </Label>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Top layer com canal alfa livre de molduras
                </span>
              </div>
              <Switch
                checked={project.avatar?.enabled}
                onCheckedChange={(v) => updateAvatarSettings('enabled', v)}
              />
            </div>

            {project.avatar?.enabled && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Tabs defaultValue="main" className="w-full pt-2">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="main" className="text-xs">
                      Principal
                    </TabsTrigger>
                    <TabsTrigger value="ambiente" className="text-xs">
                      Ambiente
                    </TabsTrigger>
                    <TabsTrigger value="ouvintes" className="text-xs">
                      Ouvintes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="main" className="space-y-4 pt-4">
                    <Tabs defaultValue="presets" className="w-full">
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="presets">AI Presets</TabsTrigger>
                        <TabsTrigger value="custom">Meus Avatares</TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="presets"
                        className="grid grid-cols-4 gap-2 mt-3"
                      >
                        {presets.map((p) => (
                          <div
                            key={p.id}
                            className="relative group aspect-[4/5] rounded-md border-2 transition-all overflow-hidden p-2"
                            style={{
                              backgroundImage: CHECKERBOARD_BG,
                              backgroundSize: '10px 10px',
                            }}
                          >
                            <img
                              src={p.imageUrl}
                              crossOrigin="anonymous"
                              title={p.name}
                              onClick={() =>
                                updateAvatarSettings('imageUrl', p.imageUrl)
                              }
                              className={cn(
                                'w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md',
                                project.avatar?.imageUrl === p.imageUrl
                                  ? 'opacity-100 scale-105'
                                  : 'opacity-80 hover:opacity-100',
                              )}
                              alt={p.name}
                            />
                            {project.avatar?.imageUrl === p.imageUrl && (
                              <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
                            )}
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent
                        value="custom"
                        className="space-y-4 mt-3 bg-muted/20 p-3 rounded-lg border border-border/50"
                      >
                        <div className="grid grid-cols-4 gap-2">
                          {customs.length > 0 ? (
                            customs.map((p) => {
                              const isProcessing =
                                p.status === 'processing_bg' ||
                                p.status === 'training_motion'
                              return (
                                <div
                                  key={p.id}
                                  className="relative group aspect-[4/5] rounded-md border-2 transition-all overflow-hidden p-2"
                                  style={{
                                    backgroundImage: CHECKERBOARD_BG,
                                    backgroundSize: '10px 10px',
                                  }}
                                >
                                  <img
                                    src={p.imageUrl}
                                    crossOrigin="anonymous"
                                    title={p.name}
                                    onClick={() =>
                                      p.status === 'ready' &&
                                      updateAvatarSettings(
                                        'imageUrl',
                                        p.imageUrl,
                                      )
                                    }
                                    className={cn(
                                      'w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform drop-shadow-md',
                                      project.avatar?.imageUrl === p.imageUrl
                                        ? 'opacity-100 scale-105'
                                        : 'opacity-80 hover:opacity-100',
                                      p.status !== 'ready' &&
                                        'opacity-50 grayscale cursor-not-allowed',
                                    )}
                                    alt={p.name}
                                  />
                                  {isProcessing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                                      <Loader2 className="w-4 h-4 animate-spin text-primary mb-1" />
                                      <span className="text-[8px] font-bold text-white uppercase text-center leading-tight">
                                        {p.status === 'processing_bg'
                                          ? 'Alpha'
                                          : 'Rigging'}
                                      </span>
                                    </div>
                                  )}
                                  {project.avatar?.imageUrl === p.imageUrl &&
                                    p.status === 'ready' && (
                                      <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
                                    )}
                                </div>
                              )
                            })
                          ) : (
                            <div className="col-span-4 text-center p-4 text-sm text-muted-foreground">
                              Nenhum clone encontrado.
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-background"
                            asChild
                          >
                            <Link to="/avatars">Gerenciar na Biblioteca</Link>
                          </Button>
                        </div>

                        <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-border"></div>
                          <span className="flex-shrink-0 mx-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            Ou Criar Rápido
                          </span>
                          <div className="flex-grow border-t border-border"></div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">
                            Fazer Upload de Foto
                          </Label>
                          <p className="text-[10px] text-muted-foreground">
                            Extração Alpha Perfect livre de frames.
                          </p>
                          <div className="flex items-center gap-2 pb-1">
                            <Switch id="recon-rev" defaultChecked />
                            <Label htmlFor="recon-rev" className="text-[10px]">
                              Ativar Inpainting de Corpo
                            </Label>
                          </div>
                          {isProcessingAvatar ? (
                            <div className="p-3 text-center text-[10px] font-medium border rounded-md border-dashed border-primary bg-primary/5 text-primary animate-pulse flex flex-col gap-1 items-center">
                              <Loader2 className="w-4 h-4 animate-spin mb-1" />
                              <span>Segmentação Alpha de Alta Precisão...</span>
                              <span>
                                Reconstruindo Tronco e Ombros (Inpainting
                                Generativo)...
                              </span>
                            </div>
                          ) : (
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="text-xs h-9 bg-background file:text-xs file:font-medium"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">
                            Gerar com Descrição (Prompt)
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ex: Personagem 3D cartoon..."
                              className="text-xs h-9 bg-background"
                              value={avatarPrompt}
                              onChange={(e) => setAvatarPrompt(e.target.value)}
                            />
                            <Button
                              size="sm"
                              className="h-9 shrink-0"
                              onClick={handleAvatarGenerate}
                              disabled={isProcessingAvatar || !avatarPrompt}
                            >
                              Gerar
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-4 pt-5 mt-4 border-t border-border/50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs">
                            Redimensionar Camada
                          </Label>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {project.avatar?.scale?.toFixed(1) || '1.0'}x
                          </span>
                        </div>
                        <Slider
                          value={[project.avatar?.scale || 1]}
                          min={0.5}
                          max={3.0}
                          step={0.1}
                          onValueChange={([v]) =>
                            updateAvatarSettings('scale', v)
                          }
                        />
                        <p className="text-[10px] text-muted-foreground pt-1">
                          Dica: Você pode reposicionar o avatar arrastando-o
                          diretamente no canvas ao lado.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                          Ordem da Camada (Z-Index)
                        </Label>
                        <Select
                          value={project.avatar?.zIndex?.toString() || '20'}
                          onValueChange={(v) =>
                            updateAvatarSettings('zIndex', parseInt(v))
                          }
                        >
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">
                              Atrás do B-Roll (Fundo)
                            </SelectItem>
                            <SelectItem value="15">
                              Atrás dos Ouvintes
                            </SelectItem>
                            <SelectItem value="20">
                              Padrão (Frente dos Ouvintes)
                            </SelectItem>
                            <SelectItem value="50">
                              Acima de Tudo (Sobre Legendas)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ambiente" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        Tom Emocional (Sentiment-Sync)
                      </Label>
                      <Select
                        value={project.avatar?.tone || 'neutral'}
                        onValueChange={(v) => updateAvatarSettings('tone', v)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">
                            Neutro (Documentário)
                          </SelectItem>
                          <SelectItem value="suspense">
                            Suspense / Mistério
                          </SelectItem>
                          <SelectItem value="joy">
                            Alegria / Empolgação
                          </SelectItem>
                          <SelectItem value="fear">Medo / Tensão</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground">
                        A IA ajusta as micro-expressões, velocidade de
                        gesticulação e tensão corporal com base no tom.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        Cenário Atmosférico
                      </Label>
                      <Select
                        value={project.avatar?.atmosphere || 'none'}
                        onValueChange={(v) =>
                          updateAvatarSettings('atmosphere', v)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Sem Ambiente (Limpo)
                          </SelectItem>
                          <SelectItem value="campfire">
                            Noite na Fogueira
                          </SelectItem>
                          <SelectItem value="neon">Cyberpunk Neon</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground">
                        Aplica projeção realista de luzes e sombras diretamente
                        no corpo independente do avatar.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="ouvintes" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold">
                          Audiência Reativa
                        </Label>
                        <p className="text-[10px] text-muted-foreground">
                          Adicione ouvintes secundários que reagem à história.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={addListener}
                      >
                        + Adicionar
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto">
                      {project.avatar?.listeners?.map((l) => (
                        <div
                          key={l.id}
                          className="p-3 bg-muted/20 border rounded-lg space-y-4 relative"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 text-destructive"
                            onClick={() => removeListener(l.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <div className="flex gap-3">
                            <img
                              src={l.imageUrl}
                              className="w-12 h-12 object-cover rounded-md bg-muted"
                              alt="listener"
                            />
                            <div className="flex-1 space-y-2">
                              <Label className="text-[10px] font-semibold">
                                Gatilho (Segundos)
                              </Label>
                              <Slider
                                value={[l.reactionTime]}
                                min={0}
                                max={project.videoDuration || 60}
                                step={1}
                                onValueChange={([v]) =>
                                  updateListener(l.id, { reactionTime: v })
                                }
                              />
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {l.reactionTime}s
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[10px]">Posição X</Label>
                              <Slider
                                value={[l.positionX]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]) =>
                                  updateListener(l.id, { positionX: v })
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px]">Posição Y</Label>
                              <Slider
                                value={[l.positionY]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={([v]) =>
                                  updateListener(l.id, { positionY: v })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-semibold">
                              Tipo de Reação
                            </Label>
                            <Select
                              value={l.reactionType}
                              onValueChange={(v) =>
                                updateListener(l.id, {
                                  reactionType: v as any,
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gasp">
                                  Susto / Surpresa
                                </SelectItem>
                                <SelectItem value="nod">Concordar</SelectItem>
                                <SelectItem value="fear">
                                  Tremer / Medo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      {!project.avatar?.listeners?.length && (
                        <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground text-xs">
                          Nenhum ouvinte adicionado.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
