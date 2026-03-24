import { useState } from 'react'
import { Project, BRoll, AiClip } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Image as ImageIcon,
  Send,
  Play,
  Hash,
  FileText,
  Loader2,
  RefreshCcw,
  Mic,
  LayoutTemplate,
  HelpCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext: () => void
  onPreview: () => void
}

interface Scene {
  imageUrl: string
  text: string
}

interface GeneratedResult {
  title: string
  description: string
  hashtags: string
  scenes: Scene[]
}

export function AiCreatorPanel({ project, update, onNext, onPreview }: Props) {
  const [prompt, setPrompt] = useState('')
  const [voice, setVoice] = useState('documentary')
  const [template, setTemplate] = useState('mystery')
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>(
    'idle',
  )
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const { toast } = useToast()

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return toast({
        title: 'Faltando informações',
        description: 'Por favor, descreva sua ideia de vídeo primeiro.',
        variant: 'destructive',
      })
    }

    setStatus('generating')
    setProgress(0)
    setStatusText('Analisando seu prompt...')

    const steps = [
      { p: 25, t: 'Escrevendo roteiro viral...' },
      { p: 50, t: 'Gerando imagens fotorealistas...' },
      { p: 75, t: 'Ajustando tom de voz e ritmo...' },
      { p: 100, t: 'Finalizando vídeo...' },
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
    const words = prompt.split(' ').filter((w) => w.length > 3)
    const keyword = words.length > 0 ? encodeURIComponent(words[0]) : 'epic'

    const templateThemes: Record<
      string,
      { title: string; text1: string; text2: string }
    > = {
      mystery: {
        title: 'O Segredo Oculto:',
        text1: 'Tudo começou quando descobrimos algo incrível.',
        text2: 'Durante anos, isso foi escondido de todos nós.',
      },
      curiosities: {
        title: 'Você Sabia disso?',
        text1: 'Fatos incríveis que vão explodir sua mente!',
        text2: 'Muitas pessoas passam a vida inteira sem saber disso.',
      },
      motivational: {
        title: 'Sua Dose de Inspiração',
        text1: 'O sucesso é construído dia após dia.',
        text2: 'Não desista quando a estrada ficar difícil.',
      },
    }

    const t = templateThemes[template] || templateThemes.mystery

    setResult({
      title: `${t.title} ${prompt.slice(0, 15)}...`,
      description: `Vídeo gerado com IA usando estilo "${template}" e tom de voz de ${voice}.`,
      hashtags: `#viral #${template} #ia`,
      scenes: [
        {
          imageUrl: `https://img.usecurling.com/p/400/700?q=${keyword}&seed=1`,
          text: t.text1,
        },
        {
          imageUrl: `https://img.usecurling.com/p/400/700?q=${keyword}&seed=2`,
          text: t.text2,
        },
        {
          imageUrl: `https://img.usecurling.com/p/400/700?q=cinematic&seed=3`,
          text: 'Mas agora, a verdade finalmente apareceu.',
        },
        {
          imageUrl: `https://img.usecurling.com/p/400/700?q=shocked&seed=4`,
          text: 'Curta e siga para descobrir mais!',
        },
      ],
    })
    setStatus('success')
    toast({ title: 'Vídeo gerado com sucesso!' })
  }

  const handleSendToTimeline = (destination: 'editor' | 'preview') => {
    if (!result) return

    const sceneDuration = 3
    const totalDuration = result.scenes.length * sceneDuration

    const bRolls: BRoll[] = result.scenes.map((s, i) => ({
      id: crypto.randomUUID(),
      start: i * sceneDuration,
      end: (i + 1) * sceneDuration,
      url: s.imageUrl,
      keyword: 'ai-generated',
    }))

    const aiClips: AiClip[] = [
      {
        id: crypto.randomUUID(),
        start: 0,
        end: totalDuration,
        title: result.title,
        description: result.description,
        keywords: result.hashtags.split(' ').map((h) => h.replace('#', '')),
        subtitles: result.scenes.map((s, i) => ({
          id: crypto.randomUUID(),
          start: i * sceneDuration,
          end: (i + 1) * sceneDuration,
          text: s.text,
        })),
      },
    ]

    const captionText = `${result.title}\n\n${result.description}\n\n${result.hashtags}`

    update({
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoDuration: totalDuration,
      bRolls,
      aiClips,
      captions: {
        tiktok: captionText,
        instagram: captionText,
        facebook: captionText,
      },
    })

    toast({ title: 'Projeto atualizado com IA!' })
    if (destination === 'editor') onNext()
    if (destination === 'preview') onPreview()
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in text-center px-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
          <Wand2 className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <h3 className="font-bold text-lg">Criando sua obra-prima</h3>
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
            <span className="font-bold">Geração Concluída</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatus('idle')}
            className="h-8"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refazer
          </Button>
        </div>

        <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
          <h4 className="font-bold flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" /> Título Sugerido
          </h4>
          <p className="font-medium text-foreground text-sm">{result.title}</p>

          <h4 className="font-bold flex items-center gap-2 text-sm mt-4">
            <Hash className="w-4 h-4 text-primary" /> Hashtags Otimizadas
          </h4>
          <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">
            {result.hashtags}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="font-bold">Storyboard (Cenas Geradas)</Label>
          <ScrollArea className="h-48 rounded-xl border bg-background">
            <div className="p-3 space-y-3">
              {result.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 bg-muted/50 p-2 rounded-lg items-center"
                >
                  <div className="w-12 h-20 shrink-0 rounded overflow-hidden bg-black relative">
                    <img
                      src={scene.imageUrl}
                      alt={`Cena ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium leading-tight">
                    {scene.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            className="w-full font-bold h-12"
            onClick={() => handleSendToTimeline('preview')}
          >
            <Play className="w-4 h-4 mr-2" /> Preview Story
          </Button>
          <Button
            className="w-full font-bold h-12 shadow-md"
            onClick={() => handleSendToTimeline('editor')}
          >
            <Send className="w-4 h-4 mr-2" /> Enviar p/ Editor
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-500" /> AI Story Generator
        </h3>
        <p className="text-sm text-muted-foreground">
          Crie um vídeo viral completo a partir de uma simples ideia. A IA
          cuidará do roteiro, imagens, áudio e metadados.
        </p>

        <div className="space-y-3">
          <Label htmlFor="prompt" className="font-semibold text-sm">
            Sobre o que é o seu vídeo?
          </Label>
          <Textarea
            id="prompt"
            placeholder="Ex: Conte uma história sobre o mistério das pirâmides..."
            className="min-h-[100px] resize-none text-sm bg-background/50 focus-visible:ring-blue-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" /> Narrador (Voz)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A voz da IA que irá narrar seu vídeo.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger className="w-full bg-background/50 h-10">
                <SelectValue placeholder="Selecione a voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="documentary">
                  Locutor de Documentário
                </SelectItem>
                <SelectItem value="enthusiastic">Voz Entusiasmada</SelectItem>
                <SelectItem value="suspense">Tom de Suspense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-primary" /> Template
                Pronto
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A estrutura de conteúdo do seu formato de vídeo.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-full bg-background/50 h-10">
                <SelectValue placeholder="Selecione o template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mystery">Mistério</SelectItem>
                <SelectItem value="curiosities">Curiosidades</SelectItem>
                <SelectItem value="motivational">Motivacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-semibold text-sm">Estilo Visual</Label>
          <div className="p-3 bg-muted rounded-md border flex items-center justify-between cursor-not-allowed opacity-80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="w-4 h-4 text-muted-foreground" /> Realista /
              Cinemático
            </div>
            <Badge variant="outline" className="text-[10px] bg-background">
              Bloqueado (Melhor Engajamento)
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5 mt-4"
        >
          <Wand2 className="w-5 h-5 mr-2" /> Gerar Vídeo Viral
        </Button>
      </div>
    </div>
  )
}
