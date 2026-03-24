import { Project, AudioTrack } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Music,
  Wand2,
  PlayCircle,
  CheckCircle2,
  Scissors,
  HelpCircle,
  Loader2,
  Plus,
  Volume2,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { usePlayerState } from '@/stores/usePlayerStore'

const MUSIC_LIBRARY: AudioTrack[] = [
  { id: 'm1', name: 'Summer Vibes', mood: 'Energetic' },
  { id: 'm2', name: 'Neon Nights', mood: 'Energetic' },
  { id: 'm3', name: 'Chill Beats', mood: 'Lo-fi' },
  { id: 'm4', name: 'Late Night Study', mood: 'Lo-fi' },
  { id: 'm5', name: 'Dark Mystery', mood: 'Suspense' },
]

const SFX_LIBRARY = [
  { id: 'sfx1', name: 'Swoosh Rápido', category: 'Transição' },
  { id: 'sfx2', name: 'Glitch Digital', category: 'Transição' },
  { id: 'sfx3', name: 'Impacto Cinemático', category: 'Impacto' },
  { id: 'sfx4', name: 'Bass Drop', category: 'Impacto' },
  { id: 'sfx5', name: 'Pop Bolha', category: 'UI Sounds' },
  { id: 'sfx6', name: 'Notificação', category: 'UI Sounds' },
]

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function AudioPanel({ project, update }: Props) {
  const { toast } = useToast()
  const { currentTime } = usePlayerState()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRemovingSilences, setIsRemovingSilences] = useState(false)

  const handleSuggestSoundtrack = () => {
    setIsAnalyzing(true)
    toast({
      title: 'Analisando a vibe do vídeo...',
      description: 'A IA está escolhendo a melhor trilha sonora.',
    })

    setTimeout(() => {
      setIsAnalyzing(false)
      const suggested = MUSIC_LIBRARY[0]
      update({ audioTrack: suggested })
      toast({
        title: 'Trilha sugerida aplicada!',
        description: `Selecionado: ${suggested.name} (${suggested.mood})`,
      })
    }, 2000)
  }

  const handleSelectTrack = (track: AudioTrack) => {
    update({ audioTrack: track })
  }

  const handleRemoveSilences = () => {
    setIsRemovingSilences(true)
    toast({
      title: 'Analisando áudio...',
      description: 'Buscando espaços vazios e silêncios na narração...',
    })

    setTimeout(() => {
      setIsRemovingSilences(false)
      toast({
        title: 'Silêncios removidos!',
        description: 'Seu vídeo ficou mais dinâmico e focado.',
      })
    }, 2000)
  }

  const handleAddSfx = (track: {
    id: string
    name: string
    category: string
  }) => {
    if (!project.videoUrl) return
    update({
      sfx: [
        ...(project.sfx || []),
        {
          id: crypto.randomUUID(),
          sfxId: track.id,
          name: track.name,
          category: track.category,
          start: currentTime,
        },
      ],
    })
    toast({
      title: 'Efeito sonoro adicionado',
      description: `Inserido em ${currentTime.toFixed(1)}s`,
    })
  }

  const handleRemoveSfx = (id: string) => {
    update({
      sfx: project.sfx?.filter((s) => s.id !== id),
    })
  }

  const moods = Array.from(new Set(MUSIC_LIBRARY.map((t) => t.mood)))
  const sfxCategories = Array.from(new Set(SFX_LIBRARY.map((s) => s.category)))

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="bg-background p-5 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" /> Edição de Áudio
            Inteligente
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">
                  A IA detecta e remove automaticamente partes sem fala ou
                  longas pausas para reter a atenção da sua audiência.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="secondary"
          className="w-full font-semibold border border-primary/20 hover:border-primary/50 transition-all h-11"
          onClick={handleRemoveSilences}
          disabled={isRemovingSilences || !project.videoUrl}
        >
          {isRemovingSilences ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Scissors className="w-4 h-4 mr-2" />
          )}
          {isRemovingSilences
            ? 'Processando áudio...'
            : 'Remover Silêncios Inteligente'}
        </Button>
      </div>

      <Tabs defaultValue="music" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6 h-12 bg-muted/50 p-1">
          <TabsTrigger value="music" className="font-semibold">
            <Music className="w-4 h-4 mr-2" /> Músicas
          </TabsTrigger>
          <TabsTrigger value="sfx" className="font-semibold">
            <Volume2 className="w-4 h-4 mr-2" /> Efeitos (SFX)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="space-y-6 mt-0 outline-none">
          <div className="bg-background p-5 rounded-xl border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Sua Trilha Atual
              </Label>
              {project.audioTrack ? (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {project.audioTrack.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vibe: {project.audioTrack.mood}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => update({ audioTrack: null })}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic py-2">
                  Nenhuma trilha selecionada.
                </div>
              )}
            </div>

            <Button
              className="w-full h-12 shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold transition-all hover:scale-[1.02]"
              onClick={handleSuggestSoundtrack}
              disabled={isAnalyzing || !project.videoUrl}
            >
              {isAnalyzing ? (
                <Wand2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5 mr-2" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Sugerir Trilha com IA'}
            </Button>
          </div>

          <div className="space-y-4">
            <Label className="font-semibold text-lg">Biblioteca de Áudio</Label>
            <div className="space-y-4">
              {moods.map((mood) => (
                <div key={mood} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {mood}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {MUSIC_LIBRARY.filter((t) => t.mood === mood).map(
                      (track) => {
                        const isSelected = project.audioTrack?.id === track.id
                        return (
                          <Card
                            key={track.id}
                            className={cn(
                              'cursor-pointer transition-all hover:border-primary',
                              isSelected
                                ? 'border-primary ring-1 ring-primary'
                                : '',
                            )}
                            onClick={() => handleSelectTrack(track)}
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                                <span className="font-medium text-sm">
                                  {track.name}
                                </span>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                            </CardContent>
                          </Card>
                        )
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sfx" className="space-y-6 mt-0 outline-none">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="font-semibold text-lg">Efeitos Sonoros</Label>
              <span className="text-xs text-muted-foreground">
                Adiciona na posição atual do player
              </span>
            </div>
            <div className="space-y-4">
              {sfxCategories.map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {SFX_LIBRARY.filter((s) => s.category === category).map(
                      (sfx) => (
                        <Card
                          key={sfx.id}
                          className="transition-all hover:border-yellow-400 group"
                        >
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full"
                              >
                                <PlayCircle className="w-5 h-5 text-muted-foreground" />
                              </Button>
                              <span className="font-medium text-sm">
                                {sfx.name}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                              onClick={() => handleAddSfx(sfx)}
                              disabled={!project.videoUrl}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {project.sfx && project.sfx.length > 0 && (
            <div className="mt-8 pt-6 border-t space-y-4">
              <Label className="font-semibold text-sm">
                SFX no Projeto ({project.sfx.length})
              </Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {project.sfx.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-muted/50 p-2.5 rounded-lg border text-sm"
                  >
                    <div>
                      <span className="font-bold block">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Em {s.start.toFixed(1)}s • {s.category}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSfx(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
