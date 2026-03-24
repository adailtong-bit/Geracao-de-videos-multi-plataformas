import { useState } from 'react'
import { Project, BRoll, AiClip, Draft } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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
  Play,
  Hash,
  FileText,
  RefreshCcw,
  Mic,
  HelpCircle,
  Send,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onNext: () => void
  onStatusChange?: (status: 'idle' | 'generating' | 'success') => void
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

export function AiCreatorPanel({
  project,
  update,
  onNext,
  onStatusChange,
}: Props) {
  const [prompt, setPrompt] = useState('')
  const [voice, setVoice] = useState('documentary')
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
        description:
          'Por favor, descreva o texto ou tema da sua história primeiro.',
        variant: 'destructive',
      })
    }

    setStatus('generating')
    if (onStatusChange) onStatusChange('generating')
    setProgress(0)
    setStatusText('Analisando seu texto...')

    const steps = [
      { p: 25, t: 'Gerando narrativa...' },
      { p: 50, t: 'Buscando imagens e referências visuais...' },
      { p: 75, t: 'Sincronizando áudio e texto...' },
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
    const textLower = prompt.toLowerCase()
    const isBiblical =
      textLower.includes('salmo') ||
      textLower.includes('psalm') ||
      textLower.includes('deus')

    let generatedResult: GeneratedResult

    if (isBiblical) {
      generatedResult = {
        title: 'Salmo 21 - A Força e Alegria',
        description:
          'Uma leitura inspiradora do Salmo 21, refletindo sobre vitória e fé. #salmo21 #fe #biblia #deus',
        hashtags: '#salmo21 #fe #biblia #vitoria',
        scenes: [
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=ancient%20king%20praying&seed=1`,
            text: 'O rei se alegra na tua força, ó Senhor!',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=glowing%20gold%20crown&seed=2`,
            text: 'Puseste em sua cabeça uma coroa de ouro puro.',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=sunlight%20breaking%20clouds&seed=3`,
            text: 'A vida ele te pediu, e tu lha deste.',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=majestic%20sky%20glory&seed=4`,
            text: 'Grande é a sua glória pelo teu socorro.',
          },
        ],
      }
    } else {
      const words = prompt.split(' ').filter((w) => w.length > 3)
      const keyword =
        words.length > 0 ? encodeURIComponent(words[0]) : 'educational'

      generatedResult = {
        title: `História: ${prompt.slice(0, 15)}...`,
        description: `Vídeo narrado gerado com IA. Tema: ${prompt.slice(0, 20)}.`,
        hashtags: `#educacao #historia #ia`,
        scenes: [
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=${keyword}&seed=1`,
            text: 'O início de tudo é marcado por grandes descobertas.',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=${keyword}&seed=2`,
            text: 'Pequenos detalhes muitas vezes passam despercebidos.',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=learning&seed=3`,
            text: 'Mas a verdade se revela para quem procura.',
          },
          {
            imageUrl: `https://img.usecurling.com/p/400/700?q=success&seed=4`,
            text: 'Compartilhe esse conhecimento com outras pessoas.',
          },
        ],
      }
    }

    const sceneDuration = 4
    const totalDuration = generatedResult.scenes.length * sceneDuration

    const bRolls: BRoll[] = generatedResult.scenes.map((s, i) => ({
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
        title: generatedResult.title,
        description: generatedResult.description,
        keywords: generatedResult.hashtags
          .split(' ')
          .map((h) => h.replace('#', '')),
        subtitles: generatedResult.scenes.map((s, i) => ({
          id: crypto.randomUUID(),
          start: i * sceneDuration,
          end: (i + 1) * sceneDuration,
          text: s.text,
        })),
      },
    ]

    const captionText = `${generatedResult.title}\n\n${generatedResult.description}\n\n${generatedResult.hashtags}`

    const newDraft: Draft = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      name: generatedResult.title,
      snapshot: {
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        videoDuration: totalDuration,
        bRolls,
        aiClips,
        captions: {
          tiktok: captionText,
          instagram: captionText,
          facebook: captionText,
        },
        elements: [], // Ensure clean elements
        cuts: [],
        sfx: [],
        audioTrack: null,
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
    toast({ title: 'História gerada e carregada no player!' })
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in text-center px-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
          <Wand2 className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          <h3 className="font-bold text-lg">Criando sua história</h3>
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
            onClick={() => {
              setStatus('idle')
              if (onStatusChange) onStatusChange('idle')
            }}
            className="h-8"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Nova Ideia
          </Button>
        </div>

        <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
          <h4 className="font-bold flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" /> Título Gerado
          </h4>
          <p className="font-medium text-foreground text-sm">{result.title}</p>

          <h4 className="font-bold flex items-center gap-2 text-sm mt-4">
            <Hash className="w-4 h-4 text-primary" /> Hashtags
          </h4>
          <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">
            {result.hashtags}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="font-bold">Cenas & Legendas</Label>
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
                    "{scene.text}"
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="pt-4 border-t">
          <Button className="w-full font-bold h-12 shadow-md" onClick={onNext}>
            <Send className="w-4 h-4 mr-2" /> Publicar Vídeo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-blue-500" /> Criador de Histórias (IA)
        </h3>
        <p className="text-sm text-muted-foreground">
          Crie um vídeo completo a partir de uma referência de texto. A IA gera
          a narração e busca as imagens de fundo que combinam com o assunto.
        </p>

        <div className="space-y-3">
          <Label htmlFor="prompt" className="font-semibold text-sm">
            Referência de Texto ou Tema
          </Label>
          <Textarea
            id="prompt"
            placeholder="Ex: 'Salmo 21' ou 'A história das estrelas cadentes'"
            className="min-h-[100px] resize-none text-sm bg-background/50 focus-visible:ring-blue-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> Estilo da Narração
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>A voz e o tom que a IA utilizará para ler o texto.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className="w-full bg-background/50 h-10">
              <SelectValue placeholder="Selecione a voz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="documentary">Calmo e Reflexivo</SelectItem>
              <SelectItem value="enthusiastic">Voz Entusiasmada</SelectItem>
              <SelectItem value="suspense">Sério / Documentário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5 mt-4"
        >
          <Wand2 className="w-5 h-5 mr-2" /> Gerar Vídeo
        </Button>
      </div>
    </div>
  )
}
