import { useState } from 'react'
import { Project, BRoll, AiClip, Draft } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Wand2,
  FileText,
  RefreshCcw,
  Mic,
  HelpCircle,
  Hash,
  Film,
  Palette,
  Youtube,
  Upload,
  Type,
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

// AI Semantic Mock Logic
const extractEnglishVisualKeyword = (t: string): string => {
  const lower = t.toLowerCase()
  if (lower.match(/sol|pôr do sol|entardecer|amanhecer|luz/))
    return 'sunset light'
  if (lower.match(/mar|oceano|água|onda|praia|rio/)) return 'ocean water'
  if (lower.match(/montanha|colina|pico|pedra|rocha/)) return 'mountain peak'
  if (lower.match(/cidade|urbano|rua|prédio|metrópole/)) return 'urban city'
  if (lower.match(/floresta|árvore|mato|natureza|selva|folha/))
    return 'forest nature'
  if (lower.match(/céu|nuvem|estrela|espaço|galáxia|universo/))
    return 'night sky stars'
  if (lower.match(/noite|escuro|sombra|trevas/)) return 'dark shadows'
  if (lower.match(/pessoas|homem|mulher|rosto|olhos|multidão|criança/))
    return 'people portrait'
  if (lower.match(/fogo|chama|quente|incêndio|calor/)) return 'fire flames'
  if (lower.match(/chuva|tempestade|frio|neve|gelo/)) return 'rain storm'
  if (lower.match(/livro|ler|história|papel|biblioteca|conhecimento/))
    return 'ancient book'
  if (lower.match(/deus|fé|sagrado|igreja|cruz|divino|salmo|anjo|milagre/))
    return 'holy divine light'
  if (lower.match(/amor|coração|paz|esperança|alegria/))
    return 'peaceful beautiful'
  if (lower.match(/dinheiro|ouro|riqueza|tesouro/)) return 'gold treasure'
  if (lower.match(/carro|esporte|corrida|velocidade/)) return 'sports car'
  if (lower.match(/tecnologia|computador|ia|futuro/))
    return 'futuristic technology'
  if (lower.match(/comida|cozinhar|restaurante|sabor/)) return 'delicious food'

  const themes = [
    'epic landscape',
    'dramatic atmosphere',
    'cinematic view',
    'beautiful scenery',
    'mystical light',
  ]
  return themes[Math.floor(Math.random() * themes.length)]
}

export function AiCreatorPanel({
  project,
  update,
  onNext,
  onStatusChange,
}: Props) {
  const [sourceType, setSourceType] = useState<'text' | 'video'>('text')
  const [prompt, setPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [voice, setVoice] = useState('documentary')
  const [artStyle, setArtStyle] = useState('cinematic')
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
        description:
          'Por favor, descreva o texto ou tema da sua história primeiro.',
        variant: 'destructive',
      })
    }

    if (sourceType === 'video' && !videoUrl.trim()) {
      return toast({
        title: 'Faltando informações',
        description: 'Cole a URL do vídeo ou envie um arquivo primeiro.',
        variant: 'destructive',
      })
    }

    setStatus('generating')
    if (onStatusChange) onStatusChange('generating')
    setProgress(0)

    if (sourceType === 'video') {
      setStatusText('Processando URL do vídeo e extraindo transcrição...')
    } else {
      setStatusText('Extraindo contexto semântico do texto...')
    }

    const steps = [
      { p: 25, t: 'Mapeando emoções e narrativa...' },
      { p: 50, t: 'Buscando recursos visuais semanticamente alinhados...' },
      { p: 75, t: `Aplicando estética visual unificada (${artStyle})...` },
      { p: 100, t: 'Garantindo oratória orgânica e transições fluidas...' },
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
    }, 1200)
  }

  const finishGeneration = () => {
    let rawText = prompt.trim()

    // If it's a video source, we mock the extracted transcript to apply the SAME universal standards
    if (sourceType === 'video') {
      rawText =
        'Este é um trecho extraído do vídeo original. A inteligência artificial detecta os pontos altos da oratória, o tom de voz e os temas centrais abordados. Com base nisso, criamos cortes perfeitos e alinhamos imagens cinematográficas para sobrepor aos momentos onde a mensagem precisa de reforço visual.'
    } else if (!rawText) {
      rawText =
        'A história começa aqui. Novas descobertas nos aguardam em nossa jornada.'
    }

    // Break exact text into continuous sentences for visual transitions
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
    const scenes = clauses.map((text, i) => {
      const duration = Math.max(2.0, text.length * 0.065)
      const start = currentStartTime
      const end = start + duration
      currentStartTime = end

      const semanticKeyword = extractEnglishVisualKeyword(text)
      const query = encodeURIComponent(`${semanticKeyword} ${artStyle}`)

      return {
        id: crypto.randomUUID(),
        text,
        start,
        end,
        imageUrl: `https://img.usecurling.com/p/800/1200?q=${query}&dpr=2&seed=${i + Date.now()}`,
      }
    })

    const totalDuration = currentStartTime

    const bRolls: BRoll[] = scenes.map((s) => ({
      id: crypto.randomUUID(),
      start: s.start,
      end: s.end,
      url: s.imageUrl,
      keyword: 'semantic-alignment',
    }))

    const titleWords = rawText.split(' ').slice(0, 4).join(' ')
    const generatedResult: GeneratedResult = {
      title: `${titleWords}...`,
      description: `Vídeo com narração contínua e semântica visual avançada. Sem distrações de texto.`,
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

    // If source is video, attach a mock underlying video url so B-rolls can fade over it
    const underlyingVideo =
      sourceType === 'video'
        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
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
        captions: {
          tiktok: captionText,
          instagram: captionText,
          facebook: captionText,
        },
        elements: [], // Explicitly clearing any text elements for clean visual output
        cuts: [],
        sfx: [],
        audioTrack: {
          id: crypto.randomUUID(),
          name: 'Cinematic Ambient',
          mood: 'Ambient',
          url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        },
      },
    }

    update({
      ...newDraft.snapshot,
      drafts: [...(project.drafts || []), newDraft],
      activeDraftId: newDraft.id,
    })

    setResult(generatedResult)
    setStatus('success')
    if (onStatusChange) onStatusChange('success')
    toast({ title: 'Análise semântica e oratória concluída!' })
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in text-center px-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
          <Wand2 className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <h3 className="font-bold text-lg">Processamento Universal</h3>
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
            <Wand2 className="w-5 h-5" />
            <span className="font-bold">Mapeamento Visual Concluído</span>
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
          <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">
            {result.hashtags}
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button
            className="w-full font-bold h-12 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:-translate-y-0.5"
            onClick={onNext}
          >
            <Film className="w-5 h-5 mr-2" /> Revisar Sequência Visual Limpa
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-500" /> Processamento Oratório
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nossa engine aplica padrões universais de qualidade: extrai o
          contexto, gera uma voz natural sem pausas artificiais e mapeia imagens
          orgânicas, garantindo um visual limpo sem letreiros.
        </p>

        <Tabs
          value={sourceType}
          onValueChange={(v) => setSourceType(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="text" className="text-xs font-semibold">
              <Type className="w-4 h-4 mr-2" />
              Texto para Vídeo
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs font-semibold">
              <Youtube className="w-4 h-4 mr-2" />
              YouTube / Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-0">
            <Label htmlFor="prompt" className="font-semibold text-sm">
              Texto Completo da Narração
            </Label>
            <Textarea
              id="prompt"
              placeholder="Cole seu texto longo aqui (Ex: reflexões, contos, palestras). O vídeo terá o fluxo natural da oratória."
              className="min-h-[160px] resize-none text-sm bg-background/50 focus-visible:ring-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-0">
            <div className="space-y-3">
              <Label htmlFor="video-url" className="font-semibold text-sm">
                Link do Vídeo
              </Label>
              <Input
                id="video-url"
                placeholder="Cole a URL do YouTube, TikTok ou Instagram..."
                className="bg-background/50 h-11"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-semibold">
                  Ou
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-dashed border-2 hover:bg-muted/50"
            >
              <Upload className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                Fazer upload de arquivo
              </span>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              A IA irá transcrever o vídeo e aplicar a mesma análise semântica
              para gerar transições visuais.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" /> Tom de Oratória
              </Label>
            </div>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue placeholder="Selecione a voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="documentary">Calmo e Reflexivo</SelectItem>
                <SelectItem value="enthusiastic">Voz Entusiasmada</SelectItem>
                <SelectItem value="suspense">Sério / Palestrante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Estética Visual
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Garante um estilo visual coeso em todo o projeto.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={artStyle} onValueChange={setArtStyle}>
              <SelectTrigger className="bg-background/50 h-10">
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cinematic">Cinemático & Realista</SelectItem>
                <SelectItem value="watercolor">Aquarela Suave</SelectItem>
                <SelectItem value="3d animation">Animação 3D</SelectItem>
                <SelectItem value="epic illustration">
                  Ilustração Épica
                </SelectItem>
                <SelectItem value="vintage photography">
                  Fotografia Vintage
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5 mt-6"
        >
          <Wand2 className="w-5 h-5 mr-2" /> Aplicar Processamento Universal
        </Button>
      </div>
    </div>
  )
}
