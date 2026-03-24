import { Project, AudioTrack } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const MUSIC_LIBRARY: AudioTrack[] = [
  { id: 'm1', name: 'Summer Vibes', mood: 'Energetic' },
  { id: 'm2', name: 'Neon Nights', mood: 'Energetic' },
  { id: 'm3', name: 'Chill Beats', mood: 'Lo-fi' },
  { id: 'm4', name: 'Late Night Study', mood: 'Lo-fi' },
  { id: 'm5', name: 'Dark Mystery', mood: 'Suspense' },
]

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function AudioPanel({ project, update }: Props) {
  const { toast } = useToast()
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
      const suggested = MUSIC_LIBRARY[0] // just pick the first one for demo
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

  const moods = Array.from(new Set(MUSIC_LIBRARY.map((t) => t.mood)))

  return (
    <div className="space-y-6 animate-fade-in-up pb-4">
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

      <div className="flex items-center justify-between mt-8">
        <h3 className="font-semibold flex items-center gap-2 text-lg">
          <Music className="w-5 h-5 text-primary" /> Trilha Sonora (IA)
        </h3>
      </div>

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
                  <p className="font-bold text-sm">{project.audioTrack.name}</p>
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
        <Label className="font-semibold">Biblioteca de Áudio</Label>
        <div className="space-y-4">
          {moods.map((mood) => (
            <div key={mood} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {mood}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {MUSIC_LIBRARY.filter((t) => t.mood === mood).map((track) => {
                  const isSelected = project.audioTrack?.id === track.id
                  return (
                    <Card
                      key={track.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary',
                        isSelected ? 'border-primary ring-1 ring-primary' : '',
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
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
