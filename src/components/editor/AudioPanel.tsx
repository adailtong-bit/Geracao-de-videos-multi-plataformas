import { useState } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Upload, Play, CheckCircle2, Music, Pause } from 'lucide-react'
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

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 flex flex-col h-full">
      <div className="space-y-4 shrink-0">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Music className="w-5 h-5 text-green-500" /> Biblioteca de Áudio
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Faça upload de suas próprias trilhas. O sistema pode aplicar ducking
          inteligente para equilibrar o volume com a narração de forma
          automática.
        </p>

        <Label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-background">
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-sm font-semibold">Upload MP3/WAV</span>
          <input
            type="file"
            className="hidden"
            accept="audio/mp3,audio/wav"
            onChange={handleUpload}
          />
        </Label>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-4 pb-6">
          {project.audioTrack && (
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Music className="w-4 h-4" /> Trilha Ativa:{' '}
                {project.audioTrack.name}
              </h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label
                    className="text-sm font-semibold cursor-pointer"
                    htmlFor="adaptive-audio"
                  >
                    Adaptive Leveling
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Abaixa automaticamente o volume da música de fundo durante a
                    narração.
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
                        setPlayingId(playingId === track.id ? null : track.id)
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
                        {(track.duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                    {isApplied ? (
                      <span className="flex items-center text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aplicado
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => applyToProject(track)}
                      >
                        Usar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
