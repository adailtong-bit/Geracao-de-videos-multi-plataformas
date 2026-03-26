import { useState } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Upload,
  Play,
  CheckCircle2,
  Music,
  Pause,
  Mic,
  Wand2,
  Scissors,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import { useAudioStore } from '@/stores/useAudioStore'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AudioPanel({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const { library, uploadAudio } = useAudioStore()
  const [playingId, setPlayingId] = useState<string | null>(null)

  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAudio(e.target.files[0])
    }
  }

  const applyToProject = (track: any) => {
    update({
      audioTrack: {
        id: track.id,
        name: track.name,
        mood: 'Custom',
        url: track.url,
        adaptiveLeveling: true,
      },
    })
  }

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return
    setIsGeneratingAi(true)
    setTimeout(() => {
      setIsGeneratingAi(false)
      const track = {
        id: crypto.randomUUID(),
        name: `Música IA: ${aiPrompt.slice(0, 15)}...`,
        duration: 120,
        url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      }
      applyToProject(track)
      setAiPrompt('')
    }, 3000)
  }

  const audioSettings = project.audioSettings || {
    organicProsody: true,
    removeArtifacts: true,
    tailSilenceEnforcement: true,
    clearAudioBuffer: true,
  }

  const updateSettings = (key: keyof typeof audioSettings, val: boolean) => {
    update({
      audioSettings: {
        ...audioSettings,
        [key]: val,
      },
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 flex flex-col h-full">
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-6 pb-6 pt-2">
          <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-secondary/30">
            <div className="flex flex-col gap-1 mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Mic className="w-4 h-4" /> Qualidade da Voz (Narração)
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Ajustes automáticos para deixar a voz com qualidade de estúdio
                profissional.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                <div className="space-y-0.5 pr-4">
                  <Label
                    className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    htmlFor="organic-prosody"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-fuchsia-500" /> Voz
                    Natural Humana
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Deixa a narração com emoção, evitando que pareça a voz de um
                    robô.
                  </p>
                </div>
                <Switch
                  id="organic-prosody"
                  checked={audioSettings.organicProsody !== false}
                  onCheckedChange={(v) => updateSettings('organicProsody', v)}
                />
              </div>

              <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                <div className="space-y-0.5 pr-4">
                  <Label
                    className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    htmlFor="tail-silence"
                  >
                    <Scissors className="w-3.5 h-3.5 text-blue-500" /> Corte de
                    Silêncio
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Remove pausas muito longas ou silêncio no final do vídeo.
                  </p>
                </div>
                <Switch
                  id="tail-silence"
                  checked={audioSettings.tailSilenceEnforcement !== false}
                  onCheckedChange={(v) =>
                    updateSettings('tailSilenceEnforcement', v)
                  }
                />
              </div>

              <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                <div className="space-y-0.5 pr-4">
                  <Label
                    className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                    htmlFor="remove-artifacts"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />{' '}
                    Limpar Ruídos
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Remove chiados e barulhos indesejados da gravação.
                  </p>
                </div>
                <Switch
                  id="remove-artifacts"
                  checked={audioSettings.removeArtifacts !== false}
                  onCheckedChange={(v) => updateSettings('removeArtifacts', v)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Music className="w-5 h-5 text-green-500" /> Trilha Sonora de
              Fundo
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O sistema ajustará o volume da música automaticamente enquanto a
              narração estiver tocando.
            </p>

            {project.audioTrack && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Music className="w-4 h-4" /> Tocando Agora:{' '}
                  {project.audioTrack.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <Label
                      className="text-sm font-semibold cursor-pointer"
                      htmlFor="adaptive-audio"
                    >
                      Mixagem Inteligente (Auto-Ducking)
                    </Label>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Abaixa o volume da música sozinho quando o narrador fala.
                    </p>
                  </div>
                  <Switch
                    id="adaptive-audio"
                    checked={project.audioTrack.adaptiveLeveling !== false}
                    onCheckedChange={(v) =>
                      update({
                        audioTrack: {
                          ...project.audioTrack!,
                          adaptiveLeveling: v,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            <Tabs defaultValue="library" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="library" className="font-semibold text-sm">
                  Biblioteca
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="font-semibold text-sm text-purple-600 data-[state=active]:text-purple-700"
                >
                  <Wand2 className="w-4 h-4 mr-1.5" /> Gerar com IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="space-y-4 mt-0">
                <Label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-background">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-semibold">
                    Enviar meu próprio Áudio
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/mp3,audio/wav"
                    onChange={handleUpload}
                  />
                </Label>

                <div className="space-y-3">
                  {library.map((track) => {
                    const isApplied = project.audioTrack?.id === track.id
                    return (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-10 h-10 shrink-0 rounded-full"
                            onClick={() =>
                              setPlayingId(
                                playingId === track.id ? null : track.id,
                              )
                            }
                          >
                            {playingId === track.id ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5 fill-current" />
                            )}
                          </Button>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {track.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {Math.floor(track.duration / 60)}:
                              {(track.duration % 60)
                                .toString()
                                .padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-4">
                          {isApplied ? (
                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Usando
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => applyToProject(track)}
                            >
                              Usar Música
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent
                value="ai"
                className="space-y-4 mt-0 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-900"
              >
                <div className="space-y-3">
                  <Label className="font-semibold text-purple-800 dark:text-purple-300">
                    Descreva a Música de Fundo
                  </Label>
                  <Textarea
                    placeholder="Ex: Batida lo-fi suave, clima corporativo otimista, sem vocais, estilo relaxante..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="resize-none h-24 bg-background text-sm shadow-inner"
                  />
                  <Button
                    onClick={handleGenerateAI}
                    disabled={!aiPrompt.trim() || isGeneratingAi}
                    className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingAi
                      ? 'Compondo Faixa...'
                      : 'Gerar Trilha Sonora'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
