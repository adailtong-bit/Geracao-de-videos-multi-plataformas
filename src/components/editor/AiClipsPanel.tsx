import { useState } from 'react'
import { Project, AiClip } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Play,
  Sparkles,
  Wand2,
  Scissors,
  Settings2,
  Hash,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  usePlayerControls,
  setPlayerState,
  usePlayerState,
} from '@/stores/usePlayerStore'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function AiClipsPanel({ project, update }: Props) {
  const [duration, setDuration] = useState('30')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const { seek, play } = usePlayerControls()
  const { activeClipId } = usePlayerState()

  const generate = () => {
    if (!project.videoUrl) {
      return toast({
        title: 'Adicione um vídeo primeiro',
        variant: 'destructive',
      })
    }
    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(
      () => setProgress((p) => (p >= 100 ? 100 : p + 15)),
      400,
    )

    setTimeout(() => {
      clearInterval(interval)
      setIsGenerating(false)
      const d = Number(duration)
      const maxD = project.videoDuration || d * 2

      update({
        aiClips: [
          {
            id: crypto.randomUUID(),
            start: 0,
            end: Math.min(d, maxD),
            title: 'Momento Viral: O Segredo Revelado!',
            description:
              'Descubra esse truque incrível que vai mudar a sua forma de ver as coisas. #viral #dica',
            keywords: ['viral', 'dica', 'segredo'],
            subtitles: [
              {
                id: crypto.randomUUID(),
                start: 0,
                end: d / 2,
                text: 'Você não vai acreditar nisso!',
              },
              {
                id: crypto.randomUUID(),
                start: d / 2,
                end: d,
                text: 'Olha só o que aconteceu.',
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            start: Math.min(d, maxD),
            end: Math.min(d * 2, maxD),
            title: 'Parte 2: A Continuação Chocante',
            description:
              'Acompanhe o que aconteceu logo em seguida. #parte2 #chocante',
            keywords: ['parte2', 'curiosidade', 'historia'],
            subtitles: [
              {
                id: crypto.randomUUID(),
                start: d,
                end: d * 1.5,
                text: 'E não parou por aí...',
              },
              {
                id: crypto.randomUUID(),
                start: d * 1.5,
                end: d * 2,
                text: 'Deixe seu like para mais.',
              },
            ],
          },
        ],
      })
      toast({ title: 'Clipes gerados com sucesso!' })
    }, 3000)
  }

  const handlePreview = (clip: AiClip) => {
    setPlayerState({ activeClipId: clip.id })
    seek(clip.start)
    play()
  }

  const updateClip = (id: string, updates: Partial<AiClip>) => {
    update({
      aiClips: project.aiClips?.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })
  }

  const removeClip = (id: string) => {
    update({ aiClips: project.aiClips?.filter((c) => c.id !== id) })
    if (activeClipId === id) setPlayerState({ activeClipId: null })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4 bg-background p-5 rounded-xl border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" /> Motor de Cortes com
          IA
        </h3>
        <p className="text-sm text-muted-foreground">
          Nossa IA extrai os momentos mais virais e gera legendas
          automaticamente para você publicar.
        </p>
        <div className="space-y-3 pt-2">
          <Label>Duração Máxima</Label>
          <Select
            value={duration}
            onValueChange={setDuration}
            disabled={isGenerating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15s (Shorts rápidos)</SelectItem>
              <SelectItem value="30">30s (Reels/TikTok ideais)</SelectItem>
              <SelectItem value="60">60s (Conteúdo Profundo)</SelectItem>
              <SelectItem value="90">90s (Histórias longas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isGenerating ? (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm text-purple-600 font-medium animate-pulse">
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> Analisando vídeo...
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-purple-100" />
          </div>
        ) : (
          <Button
            className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
            onClick={generate}
          >
            <Wand2 className="w-5 h-5 mr-2" /> Gerar Clipes com IA
          </Button>
        )}
      </div>

      {project.aiClips?.length ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" /> Clipes Gerados
          </h3>
          <div className="space-y-4">
            {project.aiClips.map((clip, i) => (
              <Card
                key={clip.id}
                className={`transition-all ${activeClipId === clip.id ? 'ring-2 ring-purple-500 shadow-md' : 'shadow-sm'}`}
              >
                <div className="bg-muted/30 px-4 py-3 border-b flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">
                      Clipe {i + 1}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreview(clip)}
                    >
                      <Play className="w-4 h-4 mr-1" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeClip(clip.id)}
                      className="text-destructive"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Settings2 className="w-3.5 h-3.5" /> Início (s)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={clip.start}
                        onChange={(e) =>
                          updateClip(clip.id, { start: Number(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Settings2 className="w-3.5 h-3.5" /> Fim (s)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={clip.end}
                        onChange={(e) =>
                          updateClip(clip.id, { end: Number(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 bg-muted/10 p-3 rounded-lg border">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />{' '}
                      Otimização SEO
                    </h4>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Título Sugerido
                      </Label>
                      <Input
                        value={clip.title}
                        onChange={(e) =>
                          updateClip(clip.id, { title: e.target.value })
                        }
                        className="h-8 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Descrição Otimizada
                      </Label>
                      <Textarea
                        value={clip.description}
                        onChange={(e) =>
                          updateClip(clip.id, { description: e.target.value })
                        }
                        className="min-h-[60px] resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" /> Tags (separadas por
                        vírgula)
                      </Label>
                      <Input
                        value={clip.keywords.join(', ')}
                        onChange={(e) =>
                          updateClip(clip.id, {
                            keywords: e.target.value
                              .split(',')
                              .map((k) => k.trim()),
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
