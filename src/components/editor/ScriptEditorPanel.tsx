import { Project } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText } from 'lucide-react'

export function ScriptEditorPanel({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const handleSubtitleChange = (
    clipId: string,
    subId: string,
    newText: string,
  ) => {
    const updatedClips = project.aiClips?.map((clip) => {
      if (clip.id !== clipId) return clip
      return {
        ...clip,
        subtitles: clip.subtitles.map((s) =>
          s.id === subId ? { ...s, text: newText } : s,
        ),
      }
    })
    update({ aiClips: updatedClips, approvalStatus: 'revised' })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-in fade-in slide-in-from-left-4">
      <div className="h-14 border-b flex items-center px-4 bg-card shrink-0 shadow-sm">
        <h2 className="font-bold text-sm flex items-center gap-2 text-primary">
          <FileText className="w-4 h-4" /> Script / Legendas
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <Label className="text-base font-bold">Roteiro Principal</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Edite a base da sua história. Alterações feitas no roteiro
              principal exigirão uma nova geração na aba "Criar" para recalcular
              tempos.
            </p>
            <Textarea
              className="min-h-[150px] resize-y text-sm bg-muted/30 focus:bg-background"
              value={project.draftPrompt || ''}
              onChange={(e) => update({ draftPrompt: e.target.value })}
              placeholder="Escreva a base da sua história aqui..."
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-base font-bold">
                Ajuste Fino de Legendas
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As alterações feitas nos trechos de legenda refletem
                imediatamente no visualizador ao lado. Use para corrigir erros
                ou melhorar a quebra.
              </p>
            </div>

            <div className="space-y-3">
              {project.aiClips?.map((clip) =>
                clip.subtitles.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex gap-3 items-start p-3 bg-card rounded-lg border focus-within:border-primary/50 focus-within:ring-1 ring-primary/20 transition-all shadow-sm"
                  >
                    <div className="w-14 shrink-0 mt-2 text-[10px] font-mono font-bold text-muted-foreground text-right bg-muted px-1.5 py-0.5 rounded">
                      {sub.start.toFixed(1)}s
                    </div>
                    <Textarea
                      className="min-h-[50px] resize-y text-sm font-medium border-none shadow-none focus-visible:ring-0 p-1"
                      value={sub.text}
                      onChange={(e) =>
                        handleSubtitleChange(clip.id, sub.id, e.target.value)
                      }
                    />
                  </div>
                )),
              )}
              {(!project.aiClips || project.aiClips.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">
                    Nenhuma legenda encontrada.
                  </p>
                  <p className="text-xs mt-1">
                    Gere o vídeo primeiro para ver as legendas sincronizadas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
