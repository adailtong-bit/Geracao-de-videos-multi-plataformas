import { Project, GlossaryTerm } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function HighlightedTextarea({
  value,
  onChange,
  glossary,
  placeholder,
  className,
}: {
  value: string
  onChange: (val: string) => void
  glossary: GlossaryTerm[]
  placeholder?: string
  className?: string
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const getHighlightedText = () => {
    let text = value || ''
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (glossary && glossary.length > 0) {
      glossary.forEach((term) => {
        if (!term.source) return
        const regex = new RegExp(`\\b(${term.source})\\b`, 'gi')
        text = text.replace(
          regex,
          '<mark class="bg-fuchsia-500/40 text-transparent rounded px-0.5">$1</mark>',
        )
      })
    }

    text = text.replace(/\n/g, '<br/>')
    if (value.endsWith('\n')) text += '<br/>'
    return text
  }

  return (
    <div className="relative w-full rounded-md overflow-hidden bg-background border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div
        className={cn(
          'absolute inset-0 pointer-events-none p-2 text-sm whitespace-pre-wrap break-words z-0 text-transparent',
          className?.replace(/min-h-\[[^\]]+\]/, ''),
        )}
        style={{
          top: -scrollTop,
          padding: '0.5rem 0.75rem',
          fontFamily: 'inherit',
          lineHeight: '1.25rem',
        }}
        dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
        aria-hidden="true"
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        placeholder={placeholder}
        className={cn(
          'block w-full resize-y bg-transparent p-2 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground relative z-10',
          className,
        )}
        style={{
          lineHeight: '1.25rem',
          minHeight: '80px',
        }}
        spellCheck={false}
      />
    </div>
  )
}

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
              Edite a base da sua história. Palavras do Glossário são
              destacadas. Alterações feitas no roteiro principal exigirão uma
              nova geração na aba "Criar".
            </p>
            <HighlightedTextarea
              className="min-h-[150px]"
              value={project.draftPrompt || ''}
              onChange={(val) => update({ draftPrompt: val })}
              placeholder="Escreva a base da sua história aqui..."
              glossary={project.glossary || []}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-base font-bold">
                Ajuste Fino de Legendas
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As alterações feitas nos trechos refletem imediatamente no
                visualizador.
              </p>
            </div>

            <div className="space-y-3">
              {project.aiClips?.map((clip) =>
                clip.subtitles.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex gap-3 items-start p-3 bg-card rounded-lg border focus-within:border-primary/50 focus-within:ring-1 ring-primary/20 transition-all shadow-sm"
                  >
                    <div className="w-14 shrink-0 mt-2 text-[10px] font-mono font-bold text-muted-foreground text-center bg-muted px-1.5 py-0.5 rounded">
                      {sub.start.toFixed(1)}s
                    </div>
                    <HighlightedTextarea
                      className="min-h-[50px] border-none shadow-none focus-within:ring-0 focus-within:ring-offset-0 px-1 py-1"
                      value={sub.text}
                      onChange={(val) =>
                        handleSubtitleChange(clip.id, sub.id, val)
                      }
                      glossary={project.glossary || []}
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
