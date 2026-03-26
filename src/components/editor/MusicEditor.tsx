import { Project } from '@/types'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Music,
  Wand2,
  Play,
  Pause,
  Loader2,
  Download,
  Save,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Slider } from '@/components/ui/slider'

export function MusicEditor({
  project,
  update,
}: {
  project: Project
  update: (p: Partial<Project>) => void
}) {
  const [prompt, setPrompt] = useState(project.musicPrompt || '')
  const [lyrics, setLyrics] = useState(project.draftPrompt || '') // Using draftPrompt to store lyrics for standalone music
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const handleGenerate = () => {
    setIsGenerating(true)
    setProgress(0)
    let p = 0
    const int = setInterval(() => {
      p += 15
      setProgress(p)
      if (p >= 100) {
        clearInterval(int)
        update({
          musicPrompt: prompt,
          draftPrompt: lyrics,
          audioTrack: {
            id: crypto.randomUUID(),
            name: prompt
              ? `Faixa IA: ${prompt.slice(0, 15)}...`
              : 'Música Original',
            mood: 'custom',
            url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
            adaptiveLeveling: false,
          },
        })
        setIsGenerating(false)
        toast({ title: 'Composição Finalizada com Sucesso!' })
      }
    }, 500)
  }

  const handleTimeUpdate = () => {
    // Allows updating a slider or progress visual if desired
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-secondary"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">Voltar aos Projetos</span>
            </Link>
          </Button>
          <div className="flex flex-col border-l pl-4 justify-center">
            <h1 className="font-semibold text-sm leading-tight max-w-[200px] truncate">
              {project.name}
            </h1>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
              <Music className="w-3 h-3" /> Studio Musical
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: 'Projeto Salvo' })}
          >
            <Save className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Salvar</span>
          </Button>
          <Button
            size="sm"
            disabled={!project.audioTrack}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Exportar MP3</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Prompt & Lyrics Setup */}
        <div className="w-[400px] border-r flex flex-col bg-muted/5 z-10 shadow-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <Wand2 className="w-5 h-5" /> Motor de Composição
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Descreva o que você quer ouvir e a Inteligência Artificial fará
                toda a produção musical.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold text-sm">
                Estilo Musical (Prompt)
              </Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none h-24 bg-background text-sm shadow-inner"
                placeholder="Ex: Synthwave relaxante com batida lo-fi e melodia nostálgica, instrumental suave..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">
                  Letra (Opcional)
                </Label>
                <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                  Vocais IA
                </span>
              </div>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="resize-none h-48 bg-background text-sm shadow-inner"
                placeholder="Deixe em branco para uma faixa instrumental, ou digite os versos detalhados para a IA cantar..."
              />
              <p className="text-[10px] text-muted-foreground text-right">
                Dica: Separe os versos por quebras de linha.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md font-bold transition-all hover:-translate-y-0.5 mt-4"
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt && !lyrics)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" /> Processando{' '}
                  {progress}%
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" /> Gerar Nova Faixa
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel: Player */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 relative min-w-0">
          <div className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border p-8 relative overflow-hidden group min-h-[400px] flex items-center justify-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

            {project.audioTrack ? (
              <div className="relative z-10 flex flex-col items-center text-center space-y-8 w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="w-48 h-48 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl ring-8 ring-purple-500/20 relative group-hover:scale-105 transition-transform duration-700">
                  <div
                    className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"
                    style={{ animationDuration: '3s' }}
                  />
                  <Music className="w-20 h-20 text-white drop-shadow-lg" />
                </div>

                <div className="space-y-3 w-full">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground truncate px-4">
                    {project.audioTrack.name}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto line-clamp-2">
                    {project.musicPrompt || 'Faixa instrumental gerada por IA.'}
                  </p>
                </div>

                <audio
                  ref={audioRef}
                  src={project.audioTrack.url}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  className="hidden"
                />

                <div className="flex items-center gap-6 w-full max-w-md mx-auto">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    0:00
                  </span>
                  <Slider value={[0]} max={100} className="flex-1" />
                  <span className="text-xs font-mono text-muted-foreground w-12">
                    2:00
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-14 h-14 rounded-full border-muted-foreground/30 hover:bg-muted transition-colors"
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime -= 10
                    }}
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    size="icon"
                    className="w-20 h-20 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-transform hover:scale-105 active:scale-95"
                    onClick={() => {
                      if (isPlaying) audioRef.current?.pause()
                      else audioRef.current?.play()
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 ml-1.5 fill-current" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-14 h-14 rounded-full border-muted-foreground/30 hover:bg-muted transition-colors"
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime += 10
                    }}
                  >
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground relative z-10 animate-in fade-in">
                <div className="w-28 h-28 rounded-full bg-muted/50 border flex items-center justify-center mb-6 shadow-inner">
                  <Music className="w-12 h-12 opacity-30" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Sua Música Vai Tocar Aqui
                </h3>
                <p className="text-sm text-center max-w-sm leading-relaxed">
                  Use o painel lateral para definir o estilo e a letra. O motor
                  de IA vai compor, mixar e renderizar uma faixa completa para
                  você.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
