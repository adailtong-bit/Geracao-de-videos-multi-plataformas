import { useState } from 'react'
import {
  Project,
  BRoll,
  AiClip,
  Draft,
  Language,
  VoiceProfile,
  VisualStyle,
  Mood,
  CutSegment,
} from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  EyeOff,
  Globe,
  Clock,
  Scissors,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

const defaultTexts: Record<Language, string> = {
  'pt-BR':
    'A inteligência artificial detecta os pontos altos da oratória, o tom de voz e os temas centrais abordados. Com base nisso, criamos cortes perfeitos e alinhamos imagens cinematográficas.',
  'en-US':
    'Artificial intelligence detects the high points of the speech, the tone of voice, and the central themes covered. Based on this, we create perfect cuts and align cinematic images.',
  'es-ES':
    'La inteligencia artificial detecta los puntos altos de la oratoria, el tono de voz y los temas centrales abordados. En base a esto, creamos cortes perfectos y alineamos imágenes cinematográficas.',
  'fr-FR':
    "L'intelligence artificielle détecte les points forts du discours, le ton de la voix et les thèmes centraux abordés. Sur cette base, nous créons des coupes parfaites et alignons des images cinématiques.",
  'de-DE':
    'Künstliche Intelligenz erkennt die Höhepunkte der Rede, den Tonfall und die zentralen behandelten Themen. Darauf basierend erstellen wir perfekte Schnitte und richten kinoreife Bilder aus.',
  'it-IT':
    "L'intelligenza artificiale rileva i punti salienti del discorso, il tono di voce e i temi centrali trattati. Sulla base di questo, creiamo tagli perfetti e allineiamo immagini cinematografiche.",
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
  const [prompt, setPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [targetDuration, setTargetDuration] = useState<number>(60)
  const [language, setLanguage] = useState<Language>(
    project.language || 'pt-BR',
  )
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>('deep')
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('realistic')
  const [mood, setMood] = useState<Mood>('inspirational')
  const [noTextMode, setNoTextMode] = useState(project.noTextMode ?? false)

  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>(
    'idle',
  )
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const { toast } = useToast()

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

    if (!targetDuration || targetDuration < 10) {
      return toast({
        title: 'Duração inválida',
        description: 'A duração desejada deve ser de pelo menos 10 segundos.',
        variant: 'destructive',
      })
    }

    setStatus('generating')
    if (onStatusChange) onStatusChange('generating')
    setProgress(0)

    const initialText =
      sourceType === 'video'
        ? 'Acessando link e aplicando Hard Reset no editor...'
        : 'Extraindo contexto semântico...'
    setStatusText(initialText)

    const steps =
      sourceType === 'video'
        ? [
            {
              p: 20,
              t: `Ingerindo vídeo completo da URL (Modo Edição Pura)...`,
            },
            {
              p: 40,
              t: `IA detectando ângulos e alternância de locutores...`,
            },
            {
              p: 60,
              t: `Extraindo cortes (Smart Highlights) focados no diálogo original...`,
            },
            {
              p: 80,
              t: `Desativando mídia externa e fixando legendas minimalistas...`,
            },
            {
              p: 100,
              t: 'Limpando estado anterior e aplicando sequência limpa...',
            },
          ]
        : [
            { p: 25, t: `Ajustando emoção para modo ${mood}...` },
            { p: 50, t: `Aplicando estilo visual ${visualStyle}...` },
            { p: 75, t: `Sincronizando áudio e texto em ${language}...` },
            { p: 100, t: 'Garantindo transições orgânicas...' },
          ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p)
        setStatusText(steps[currentStep].t)
        currentStep++
      } else {
        clearInterval(interval)
        finishGeneration()
      }
    }, 1000)
  }

  const finishGeneration = () => {
    let totalDuration = 0
    let cuts: CutSegment[] = []
    let bRolls: BRoll[] = []
    let scenes: any[] = []
    let rawText = prompt.trim()

    if (sourceType === 'video') {
      totalDuration = targetDuration

      const numSegments = Math.max(3, Math.floor(targetDuration / 10))
      const segmentDuration = targetDuration / numSegments

      const interviewTexts =
        language === 'pt-BR'
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

      // Dynamic Multicam Detection logic based solely on original video source
      scenes = Array.from({ length: numSegments }).map((_, i) => {
        const text = interviewTexts[i % interviewTexts.length]
        const start = currentStartTime
        const end = start + segmentDuration
        currentStartTime = end

        // AI logic identifies and alternates between speakers (mocked via source offsets)
        let cutSourceStart = 0
        if (i % 2 === 0) {
          cutSourceStart = 50 + i * 20 // Speaker 1 focus
        } else {
          cutSourceStart = 150 + i * 20 // Speaker 2 focus
        }

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

      // Pure Editing Mode: Ensure zero external B-rolls are added
      bRolls = []
      rawText = interviewTexts.slice(0, numSegments).join(' ')
    } else {
      if (sourceType === 'upload') rawText = defaultTexts[language]
      else if (!rawText) rawText = defaultShortTexts[language]

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
      const scale = targetDuration / sumDuration
      let currentStartScaled = 0
      scenes = scenes.map((s) => {
        const dur = (s.end - s.start) * scale
        const nStart = currentStartScaled
        const nEnd = currentStartScaled + dur
        currentStartScaled = nEnd
        return { ...s, start: nStart, end: nEnd }
      })

      totalDuration = targetDuration
      bRolls = scenes.map((s) => ({
        id: crypto.randomUUID(),
        start: s.start,
        end: s.end,
        url: s.imageUrl,
        keyword: 'semantic-alignment',
      }))
    }

    const titleWords = rawText.split(' ').slice(0, 4).join(' ')
    const generatedResult: GeneratedResult = {
      title: `${titleWords}...`,
      description:
        sourceType === 'video'
          ? `Cortes extraídos e formatados da fonte original em ${language}.`
          : `Vídeo dinâmico processado com IA em ${language}.`,
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
    const underlyingVideo =
      sourceType === 'video'
        ? videoUrl.endsWith('.mp4')
          ? videoUrl
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
        : null

    const newDraft: Draft = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      name: generatedResult.title,
      snapshot: {
        videoUrl: underlyingVideo,
        videoDuration: totalDuration,
        bRolls,
        aiClips,
        cuts,
        elements: [], // UI Reset: Clear elements from previous sessions
        globalCaptionStyle: 'none',
        captions: {
          tiktok: captionText,
          instagram: captionText,
          facebook: captionText,
        },
        sfx: [], // UI Reset: clear SFX
        audioTrack:
          sourceType === 'video'
            ? null
            : {
                id: crypto.randomUUID(),
                name: 'Cinematic Ambient',
                mood: 'Ambient',
                url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
              },
        language,
        voiceProfile,
        visualStyle,
        mood,
        noTextMode,
      },
    }

    // State & Cache Management: Hard Reset
    // Passing the complete clean snapshot to completely overwrite old state/styles
    update({
      videoUrl: newDraft.snapshot.videoUrl,
      videoDuration: newDraft.snapshot.videoDuration,
      bRolls: newDraft.snapshot.bRolls || [],
      aiClips: newDraft.snapshot.aiClips,
      cuts: newDraft.snapshot.cuts || [],
      elements: [],
      globalCaptionStyle: 'none',
      captions: newDraft.snapshot.captions,
      sfx: [],
      audioTrack: newDraft.snapshot.audioTrack || null,
      language: newDraft.snapshot.language,
      voiceProfile: newDraft.snapshot.voiceProfile,
      visualStyle: newDraft.snapshot.visualStyle,
      mood: newDraft.snapshot.mood,
      noTextMode: newDraft.snapshot.noTextMode,

      drafts: [...(project.drafts || []), newDraft],
      activeDraftId: newDraft.id,
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
          {sourceType === 'video' ? (
            <Scissors className="w-8 h-8 text-blue-500" />
          ) : (
            <Wand2 className="w-8 h-8 text-blue-500" />
          )}
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <h3 className="font-bold text-lg">
            {sourceType === 'video'
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
            {sourceType === 'video' ? (
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
          Gere conteúdo a partir de qualquer fonte. O sistema aplicará um Hard
          Reset isolando o projeto, garantindo uso exclusivo do material
          original (Modo Edição Pura) se uma URL for fornecida.
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
              onChange={(e) => setPrompt(e.target.value)}
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
                Mídias externas são desativadas e cortes multicâmera baseados em
                diálogo serão gerados automaticamente.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 mt-0">
            <Label className="font-semibold text-sm">
              Arquivo Local (Áudio/Vídeo)
            </Label>
            <Input
              type="file"
              accept="video/*,audio/*"
              className="bg-background/50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-11 cursor-pointer"
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Idioma
            </Label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
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
              <Clock className="w-4 h-4 text-primary" /> Duração Desejada (s)
            </Label>
            <Input
              type="number"
              min={10}
              max={300}
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="bg-background/50 h-10"
              placeholder="Ex: 60"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> Perfil de Voz
            </Label>
            <Select
              value={voiceProfile}
              onValueChange={(v) => setVoiceProfile(v as VoiceProfile)}
              disabled={sourceType === 'video'}
            >
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">Profunda / Solene</SelectItem>
                <SelectItem value="soft">Suave / Meditação</SelectItem>
                <SelectItem value="announcer">Comercial / Locutor</SelectItem>
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
              disabled={sourceType === 'video'}
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
                <SelectItem value="dramatic">Dramático</SelectItem>
                <SelectItem value="calm">Calmo / Relaxante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 flex flex-col justify-center">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-muted/50 transition-colors h-10 mt-6">
              <Label
                htmlFor="no-text-mode"
                className="flex items-center gap-2 cursor-pointer font-semibold text-sm"
              >
                <EyeOff className="w-4 h-4 text-primary" /> Modo Sem Texto
              </Label>
              <Switch
                id="no-text-mode"
                checked={noTextMode}
                onCheckedChange={setNoTextMode}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5 mt-6"
        >
          {sourceType === 'video' ? (
            <Scissors className="w-5 h-5 mr-2" />
          ) : (
            <Wand2 className="w-5 h-5 mr-2" />
          )}
          {sourceType === 'video'
            ? 'Processar Cortes Originais'
            : 'Gerar Sequência HD'}
        </Button>
      </div>
    </div>
  )
}
