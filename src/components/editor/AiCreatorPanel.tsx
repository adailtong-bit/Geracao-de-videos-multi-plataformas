import { useState, useEffect } from 'react'
import {
  Project,
  BRoll,
  AiClip,
  Draft,
  Language,
  VisualStyle,
  Mood,
  CutSegment,
  MediaType,
} from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import {
  Wand2,
  FileText,
  RefreshCcw,
  Mic,
  Hash,
  Film,
  Palette,
  Youtube,
  Upload,
  Type,
  Activity,
  Globe,
  Clock,
  Scissors,
  MonitorPlay,
  ShieldAlert,
  AlertCircle,
  Play,
  Image as ImageIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { VIDEO_FORMATS } from '@/lib/video-formats'
import { VOICES, getGroupedVoices } from '@/lib/voices'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext: () => void
  onStatusChange?: (status: 'idle' | 'generating' | 'success') => void
}

interface GeneratedResult {
  title: string
  description: string
  hashtags: string
}

const extractEnglishVisualKeyword = (t: string, style: string): string => {
  const lower = t.toLowerCase()
  let base = 'epic landscape'
  if (lower.match(/sol|pôr do sol|entardecer|amanhecer|luz|sun|light|sunset/))
    base = 'sunset light'
  else if (lower.match(/mar|oceano|água|onda|praia|rio|ocean|water|sea|beach/))
    base = 'ocean water'
  else if (lower.match(/montanha|colina|pico|pedra|rocha|mountain|rock/))
    base = 'mountain peak'
  else if (lower.match(/cidade|urbano|rua|prédio|metrópole|city|urban|street/))
    base = 'urban city'
  else if (
    lower.match(/floresta|árvore|mato|natureza|selva|folha|forest|nature|tree/)
  )
    base = 'forest nature'
  else if (
    lower.match(/céu|nuvem|estrela|espaço|galáxia|universo|sky|star|space/)
  )
    base = 'night sky stars'
  else if (
    lower.match(
      /pessoas|homem|mulher|rosto|olhos|multidão|criança|people|man|woman|face/,
    )
  )
    base = 'people portrait'
  else if (lower.match(/tecnologia|computador|ia|futuro|tech|future/))
    base = 'futuristic technology'

  return `${base} ${style}`
}

const defaultShortTexts: Record<Language, string> = {
  'pt-BR': 'A história começa aqui. Novas descobertas nos aguardam.',
  'en-US': 'The story begins here. New discoveries await us.',
  'es-ES': 'La historia comienza aquí. Nuevos descubrimientos nos esperan.',
  'fr-FR': "L'histoire commence ici. De nouvelles découvertes nous attendent.",
  'de-DE': 'Die Geschichte beginnt hier. Neue Entdeckungen erwarten uns.',
  'it-IT': 'La storia inizia qui. Nuove scoperte ci attendono.',
}

export function AiCreatorPanel({
  project,
  update,
  onNext,
  onStatusChange,
}: Props) {
  const [sourceType, setSourceType] = useState<'text' | 'video' | 'upload'>(
    'text',
  )
  const [prompt, setPrompt] = useState(project.draftPrompt || '')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadedDataUrl, setUploadedDataUrl] = useState('')

  const [targetFormat, setTargetFormat] = useState<string>(
    project.targetFormat || 'yt_shorts',
  )
  const [targetDuration, setTargetDuration] = useState<number>(
    project.videoDuration || 55,
  )

  const [mediaType, setMediaType] = useState<MediaType>(
    project.mediaType || 'context-video',
  )

  const [sourceLanguage, setSourceLanguage] = useState<Language>(
    project.sourceLanguage || project.language || 'pt-BR',
  )
  const [subtitleLanguage, setSubtitleLanguage] = useState<Language | 'none'>(
    project.subtitleLanguage || 'none',
  )

  const [voiceProfile, setVoiceProfile] = useState<string>(
    project.voiceProfile || 'deep',
  )
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('realistic')
  const [mood, setMood] = useState<Mood>('inspirational')

  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>(
    'idle',
  )
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (
      project.draftPrompt &&
      project.draftPrompt !== prompt &&
      status === 'idle'
    ) {
      setPrompt(project.draftPrompt)
    }
  }, [project.draftPrompt])

  const handleFormatChange = (v: string) => {
    setTargetFormat(v)
    const f = VIDEO_FORMATS.find((x) => x.id === v)
    if (f) {
      if (f.max) setTargetDuration(Math.min(f.max - 2, 60))
      else if (f.min) setTargetDuration(f.min + 60)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedDataUrl(reader.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const playSample = (url: string) => {
    const audio = new Audio(url)
    audio.play().catch(() => {})
  }

  const selectedFormatObj = VIDEO_FORMATS.find((f) => f.id === targetFormat)
  const isExceedingMax =
    selectedFormatObj?.max !== undefined &&
    targetDuration > selectedFormatObj.max
  const isBelowMin =
    selectedFormatObj?.min !== undefined &&
    targetDuration < selectedFormatObj.min

  const handleGenerate = () => {
    if (sourceType === 'text' && !prompt.trim()) {
      return toast({
        title: 'Faltando informações',
        description: 'Descreva o texto ou tema da sua história primeiro.',
        variant: 'destructive',
      })
    }

    if (sourceType === 'video' && !videoUrl.trim()) {
      return toast({
        title: 'Faltando informações',
        description: 'Cole a URL do vídeo completo primeiro.',
        variant: 'destructive',
      })
    }

    if (sourceType === 'upload' && !uploadedDataUrl) {
      return toast({
        title: 'Faltando informações',
        description: 'Faça upload do seu arquivo primeiro.',
        variant: 'destructive',
      })
    }

    if (!targetDuration || targetDuration < 10) {
      return toast({
        title: 'Duração inválida',
        description: 'A duração desejada deve ser de pelo menos 10 segundos.',
        variant: 'destructive',
      })
    }

    let finalDuration = targetDuration
    if (isExceedingMax && selectedFormatObj?.max) {
      finalDuration = selectedFormatObj.max
      setTargetDuration(finalDuration)
      toast({
        title: 'Duração Ajustada',
        description: `Duração reduzida para o máximo permitido pelo ${selectedFormatObj.label} (${finalDuration}s).`,
      })
    }

    if (sourceType === 'text' && prompt.toLowerCase().includes('erro')) {
      setStatus('generating')
      if (onStatusChange) onStatusChange('generating')
      setStatusText('Processando semântica e analisando falhas de rede...')

      setTimeout(() => {
        setStatus('idle')
        if (onStatusChange) onStatusChange('idle')
        toast({
          title: 'Erro na Geração',
          description:
            'A conexão de rede falhou, mas seu texto foi preservado no rascunho com segurança.',
          variant: 'destructive',
        })
      }, 2000)
      return
    }

    setStatus('generating')
    if (onStatusChange) onStatusChange('generating')
    setProgress(0)

    const initialText =
      sourceType === 'video' || sourceType === 'upload'
        ? 'Acessando arquivo e aplicando Hard Reset no editor...'
        : 'Extraindo contexto semântico...'
    setStatusText(initialText)

    const steps =
      sourceType === 'video' || sourceType === 'upload'
        ? [
            { p: 20, t: `Ingerindo mídia original (Modo Edição Pura)...` },
            { p: 40, t: `IA detectando ângulos e alternância de locutores...` },
            { p: 60, t: `Extraindo cortes focados no diálogo...` },
            { p: 80, t: `Sincronizando avatares e audiência reativa...` },
            { p: 100, t: 'Limpando estado anterior e aplicando sequência...' },
          ]
        : [
            { p: 25, t: `Ajustando emoção para modo ${mood}...` },
            { p: 50, t: `Aplicando estilo visual ${visualStyle}...` },
            { p: 75, t: `Sincronizando áudio e expressões faciais...` },
            { p: 100, t: 'Garantindo transições orgânicas e cenários...' },
          ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p)
        setStatusText(steps[currentStep].t)
        currentStep++
      } else {
        clearInterval(interval)
        finishGeneration(finalDuration)
      }
    }, 1000)
  }

  const finishGeneration = (targetDur: number) => {
    let totalDuration = 0
    let cuts: CutSegment[] = []
    let bRolls: BRoll[] = []
    let scenes: any[] = []
    let rawText = prompt.trim()

    if (sourceType === 'video' || sourceType === 'upload') {
      totalDuration = targetDur
      const numSegments = Math.max(3, Math.floor(targetDur / 10))
      const segmentDuration = targetDur / numSegments

      const interviewTexts =
        sourceLanguage === 'pt-BR'
          ? [
              'Para mim, a grande virada de chave foi focar no que realmente importa.',
              'Quando começamos, não tínhamos os recursos, mas tínhamos a visão.',
              'O mercado estava saturado, então criamos nossa própria categoria.',
              'Muitos duvidaram da viabilidade desse modelo no início.',
              'Hoje, os resultados mostram que tomamos a decisão certa.',
            ]
          : [
              'For me, the big turning point was focusing on what really matters.',
              "When we started, we didn't have the resources, but we had the vision.",
              'The market was saturated, so we created our own category.',
              'Many doubted the viability of this model at first.',
              'Today, the results show that we made the right decision.',
            ]

      let currentStartTime = 0

      scenes = Array.from({ length: numSegments }).map((_, i) => {
        const text = interviewTexts[i % interviewTexts.length]
        const start = currentStartTime
        const end = start + segmentDuration
        currentStartTime = end

        let cutSourceStart = i % 2 === 0 ? 50 + i * 20 : 150 + i * 20
        const cutSourceEnd = cutSourceStart + segmentDuration

        return {
          id: crypto.randomUUID(),
          text,
          start,
          end,
          sourceStart: cutSourceStart,
          sourceEnd: cutSourceEnd,
          imageUrl: '',
        }
      })

      cuts = scenes.map((s) => ({
        id: crypto.randomUUID(),
        start: s.start,
        end: s.end,
        sourceStart: s.sourceStart,
        sourceEnd: s.sourceEnd,
      }))

      rawText = interviewTexts.slice(0, numSegments).join(' ')
    } else {
      if (!rawText) rawText = defaultShortTexts[sourceLanguage]

      const clauses = rawText
        .replace(/[\n\r]+/g, ' ')
        .split(/([.?!]+)/)
        .reduce((acc, curr, i, arr) => {
          if (i % 2 === 0) {
            const clause = curr + (arr[i + 1] || '')
            if (clause.trim().length > 3) acc.push(clause.trim())
          }
          return acc
        }, [] as string[])

      if (clauses.length === 0) clauses.push(rawText)

      let currentStartTime = 0
      scenes = clauses.map((text, i) => {
        const duration = Math.max(2.0, text.length * 0.065)
        const start = currentStartTime
        const end = start + duration
        currentStartTime = end
        const query = encodeURIComponent(
          extractEnglishVisualKeyword(text, visualStyle),
        )
        return {
          id: crypto.randomUUID(),
          text,
          start,
          end,
          imageUrl: `https://img.usecurling.com/p/800/1200?q=${query}&dpr=2&seed=${i + Date.now()}`,
        }
      })

      const sumDuration = scenes.reduce((sum, s) => sum + (s.end - s.start), 0)
      const scale = targetDur / sumDuration
      let currentStartScaled = 0
      scenes = scenes.map((s) => {
        const dur = (s.end - s.start) * scale
        const nStart = currentStartScaled
        const nEnd = currentStartScaled + dur
        currentStartScaled = nEnd
        return { ...s, start: nStart, end: nEnd }
      })

      totalDuration = targetDur
      bRolls = scenes.map((s) => ({
        id: crypto.randomUUID(),
        start: s.start,
        end: s.end,
        url: s.imageUrl,
        keyword: 'semantic-alignment',
        transitionStyle: 'fade',
      }))
    }

    const titleWords = rawText.split(' ').slice(0, 4).join(' ')
    const generatedResult: GeneratedResult = {
      title: `${titleWords}...`,
      description:
        sourceType === 'video' || sourceType === 'upload'
          ? `Cortes extraídos e formatados da fonte original em ${sourceLanguage}.`
          : `Vídeo dinâmico processado com IA em ${sourceLanguage}.`,
      hashtags: `#historia #ia #cinematic`,
    }

    const aiClips: AiClip[] = [
      {
        id: crypto.randomUUID(),
        start: 0,
        end: totalDuration,
        title: generatedResult.title,
        description: generatedResult.description,
        keywords: ['ia', 'narracao'],
        subtitles: scenes.map((s) => ({
          id: s.id,
          start: s.start,
          end: s.end,
          text: s.text,
        })),
      },
    ]

    const captionText = `${generatedResult.title}\n\n${generatedResult.description}\n\n${generatedResult.hashtags}`

    let underlyingVideo = null
    if (sourceType === 'video') {
      underlyingVideo = videoUrl.endsWith('.mp4')
        ? videoUrl
        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    } else if (sourceType === 'upload') {
      underlyingVideo = uploadedDataUrl
    }

    const newDraft: Draft = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      name: generatedResult.title,
      snapshot: {
        videoUrl: underlyingVideo,
        videoDuration: totalDuration,
        targetFormat,
        bRolls,
        aiClips,
        cuts,
        elements: [],
        globalCaptionStyle: 'none',
        captions: {
          tiktok: captionText,
          instagram: captionText,
          facebook: captionText,
        },
        sfx: [],
        audioTrack:
          sourceType === 'video' || sourceType === 'upload'
            ? null
            : {
                id: crypto.randomUUID(),
                name: 'Cinematic Ambient',
                mood: 'Ambient',
                url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
              },
        sourceLanguage,
        subtitleLanguage,
        voiceProfile,
        visualStyle,
        mood,
        mediaType,
        avatar: project.avatar || {
          enabled: false,
          mode: 'preset',
          position: 'custom',
          positionX: 50,
          positionY: 80,
          scale: 1,
          tone: mood === 'dramatic' ? 'suspense' : 'neutral',
          atmosphere: 'none',
          listeners: [],
        },
        subtitleStyle: project.subtitleStyle || {
          color: '#ffffff',
          backgroundColor: 'rgba(0,0,0,0.75)',
          fontSize: 14,
        },
        glossary: project.glossary || [],
      },
    }

    update({
      videoUrl: newDraft.snapshot.videoUrl,
      videoDuration: newDraft.snapshot.videoDuration,
      targetFormat: newDraft.snapshot.targetFormat,
      bRolls: newDraft.snapshot.bRolls || [],
      aiClips: newDraft.snapshot.aiClips,
      cuts: newDraft.snapshot.cuts || [],
      elements: [],
      globalCaptionStyle: 'none',
      captions: newDraft.snapshot.captions,
      sfx: [],
      audioTrack: newDraft.snapshot.audioTrack || null,
      sourceLanguage: newDraft.snapshot.sourceLanguage,
      subtitleLanguage: newDraft.snapshot.subtitleLanguage,
      voiceProfile: newDraft.snapshot.voiceProfile,
      visualStyle: newDraft.snapshot.visualStyle,
      mood: newDraft.snapshot.mood,
      mediaType: newDraft.snapshot.mediaType,
      avatar: newDraft.snapshot.avatar,
      subtitleStyle: newDraft.snapshot.subtitleStyle,
      drafts: [...(project.drafts || []), newDraft],
      activeDraftId: newDraft.id,
      glossary: newDraft.snapshot.glossary,
    })

    setResult(generatedResult)
    setStatus('success')
    if (onStatusChange) onStatusChange('success')
    toast({ title: 'Processamento de Mídia Concluído!' })
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in text-center px-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
          {sourceType === 'video' || sourceType === 'upload' ? (
            <Scissors className="w-8 h-8 text-blue-500" />
          ) : (
            <Wand2 className="w-8 h-8 text-blue-500" />
          )}
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <h3 className="font-bold text-lg">
            {sourceType === 'video' || sourceType === 'upload'
              ? 'Cortes Inteligentes'
              : 'Processamento Inteligente'}
          </h3>
          <p className="text-sm text-muted-foreground">{statusText}</p>
          <Progress value={progress} className="h-2 w-full mt-4" />
        </div>
      </div>
    )
  }

  if (status === 'success' && result) {
    return (
      <div className="space-y-6 animate-fade-in-up pb-8">
        <div className="flex items-center justify-between bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-500/20">
          <div className="flex items-center gap-2">
            {sourceType === 'video' || sourceType === 'upload' ? (
              <Scissors className="w-5 h-5" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span className="font-bold">Mídia Processada</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatus('idle')
              if (onStatusChange) onStatusChange('idle')
            }}
            className="h-8 hover:bg-green-500/20 text-green-800 dark:text-green-300"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Novo Projeto
          </Button>
        </div>

        <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
          <h4 className="font-bold flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" /> Título Semântico
          </h4>
          <p className="font-medium text-foreground text-sm">{result.title}</p>
          <h4 className="font-bold flex items-center gap-2 text-sm mt-4">
            <Hash className="w-4 h-4 text-primary" /> Hashtags
          </h4>
          <p className="text-sm text-blue-500 font-medium">{result.hashtags}</p>
        </div>

        <Button
          className="w-full font-bold h-12 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:-translate-y-0.5"
          onClick={onNext}
        >
          <Film className="w-5 h-5 mr-2" /> Revisar Sequência
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-500" /> Pipeline de Mídia
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gere conteúdo a partir de texto ou importe uma URL. Para adicionar e
          animar avatares, acesse a aba <strong>Studio</strong> (Revisão) após a
          geração.
        </p>

        <Tabs
          value={sourceType}
          onValueChange={(v) => setSourceType(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto p-1">
            <TabsTrigger value="text" className="text-xs font-semibold py-2">
              <Type className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Texto</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs font-semibold py-2">
              <Youtube className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs font-semibold py-2">
              <Upload className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-0">
            <Label className="font-semibold text-sm">Texto da Narração</Label>
            <Textarea
              placeholder="Cole seu texto longo aqui..."
              className="min-h-[120px] resize-none text-sm bg-background/50"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                update({ draftPrompt: e.target.value })
              }}
            />
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">
                Link do Vídeo Completo
              </Label>
              <Input
                placeholder="Ex: Link do YouTube, Podcast longo..."
                className="bg-background/50 h-11"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Modo Edição Pura: O motor ingerirá o vídeo aplicando Hard Reset.
                Cortes multicâmera serão gerados baseados em diálogo.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 mt-0">
            <Label className="font-semibold text-sm">
              Arquivo Local (Vídeo)
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="bg-background/50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-11 cursor-pointer"
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Estilo de Mídia
              Visual
            </Label>
            <RadioGroup
              value={mediaType}
              onValueChange={(v) => setMediaType(v as MediaType)}
              className="flex flex-col space-y-2 mt-2 ml-1"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="image-sequence" id="media-image" />
                <Label
                  htmlFor="media-image"
                  className="cursor-pointer font-medium text-sm text-foreground"
                >
                  Sequência de Imagens
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="context-video" id="media-video" />
                <Label
                  htmlFor="media-video"
                  className="cursor-pointer font-medium text-sm text-foreground"
                >
                  Vídeo com Imagens Relacionadas
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-3">
                <Label className="font-semibold text-sm flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-primary" /> Destino
                  (Plataforma)
                </Label>
                <Select value={targetFormat} onValueChange={handleFormatChange}>
                  <SelectTrigger className="bg-background/50 h-10">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {['YouTube', 'TikTok', 'Instagram', 'Outros'].map(
                      (groupName) => (
                        <SelectGroup key={groupName}>
                          <SelectLabel>{groupName}</SelectLabel>
                          {VIDEO_FORMATS.filter(
                            (f) => f.group === groupName,
                          ).map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-32 space-y-3 shrink-0">
                <Label className="font-semibold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Duração (s)
                </Label>
                <Input
                  type="number"
                  min={10}
                  max={3600}
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="bg-background/50 h-10"
                />
              </div>
            </div>

            {isExceedingMax && selectedFormatObj && (
              <Alert
                variant="destructive"
                className="py-2 px-3 animate-in slide-in-from-top-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <AlertDescription className="text-xs ml-2">
                  O formato <strong>{selectedFormatObj.label}</strong> exige
                  duração máxima de {selectedFormatObj.max}s. O sistema irá
                  ajustar automaticamente.
                </AlertDescription>
              </Alert>
            )}
            {isBelowMin && selectedFormatObj && (
              <Alert className="py-2 px-3 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-xs ml-2 font-medium">
                  Para monetização no <strong>{selectedFormatObj.label}</strong>
                  , a duração ideal deve ultrapassar {selectedFormatObj.min}s.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> Voz Global / Regional
            </Label>
            <div className="flex gap-2">
              <Select
                value={voiceProfile}
                onValueChange={(v) => setVoiceProfile(v)}
                disabled={sourceType === 'video' || sourceType === 'upload'}
              >
                <SelectTrigger className="bg-background/50 h-10 flex-1">
                  <SelectValue placeholder="Selecione a Voz" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(getGroupedVoices()).map(([group, voices]) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="font-bold text-primary">
                        {group}
                      </SelectLabel>
                      {voices.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
                disabled={
                  !voiceProfile ||
                  sourceType === 'video' ||
                  sourceType === 'upload'
                }
                onClick={() => {
                  const v = VOICES.find((x) => x.id === voiceProfile)
                  if (v && v.sampleUrl) playSample(v.sampleUrl)
                }}
                title="Ouvir Amostra"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Biblioteca expandida com sotaques regionais e idiomas globais.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Idioma Original
            </Label>
            <Select
              value={sourceLanguage}
              onValueChange={(v) => setSourceLanguage(v as Language)}
            >
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
                <SelectItem value="fr-FR">Français</SelectItem>
                <SelectItem value="de-DE">Deutsch</SelectItem>
                <SelectItem value="it-IT">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" /> Idioma da Legenda
            </Label>
            <Select
              value={subtitleLanguage}
              onValueChange={(v) => setSubtitleLanguage(v as Language | 'none')}
            >
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Legenda (Padrão)</SelectItem>
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
                <SelectItem value="fr-FR">Français</SelectItem>
                <SelectItem value="de-DE">Deutsch</SelectItem>
                <SelectItem value="it-IT">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" /> Estilo Visual
            </Label>
            <Select
              value={visualStyle}
              onValueChange={(v) => setVisualStyle(v as VisualStyle)}
              disabled={sourceType === 'video' || sourceType === 'upload'}
            >
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realista</SelectItem>
                <SelectItem value="cinematic-dark">Cinemático Dark</SelectItem>
                <SelectItem value="artistic">Pintura Artística</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Clima Emocional
            </Label>
            <Select value={mood} onValueChange={(v) => setMood(v as Mood)}>
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspirational">Inspirador</SelectItem>
                <SelectItem value="dramatic">Dramático / Suspense</SelectItem>
                <SelectItem value="calm">Calmo / Relaxante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5 mt-6"
        >
          {sourceType === 'video' || sourceType === 'upload' ? (
            <Scissors className="w-5 h-5 mr-2" />
          ) : (
            <Wand2 className="w-5 h-5 mr-2" />
          )}
          {sourceType === 'video' || sourceType === 'upload'
            ? 'Processar Cortes Originais'
            : 'Gerar Sequência HD'}
        </Button>
      </div>
    </div>
  )
}
