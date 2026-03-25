import { useState } from 'react'
import { Project, GlossaryTerm } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookA, Plus, Trash2 } from 'lucide-react'

export function GlossaryPanel({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')

  const glossary = project.glossary || []

  const handleAdd = () => {
    if (!source.trim() || !target.trim()) return
    const newTerm: GlossaryTerm = {
      id: crypto.randomUUID(),
      source: source.trim(),
      target: target.trim(),
    }
    update({ glossary: [...glossary, newTerm] })
    setSource('')
    setTarget('')
  }

  const handleRemove = (id: string) => {
    update({ glossary: glossary.filter((t) => t.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 flex flex-col h-full">
      <div className="space-y-4 shrink-0">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookA className="w-5 h-5 text-fuchsia-500" /> Dicionário de Termos
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Evite que a IA erre a pronúncia de marcas ou termos técnicos. Defina
          como a palavra é escrita e como deve ser pronunciada pelo motor
          neural.
        </p>

        <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Termo Original (Escrita)</Label>
              <Input
                placeholder="Ex: API"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-background h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Como Pronunciar (Alvo)</Label>
              <Input
                placeholder="Ex: ÊI PI ÁI"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-background h-9"
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={!source.trim() || !target.trim()}
            className="w-full h-9"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar ao Dicionário
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3 pb-6">
          {glossary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <p className="text-sm font-medium">Nenhum termo definido.</p>
              <p className="text-xs mt-1">
                Sua biblioteca de pronúncia global está vazia.
              </p>
            </div>
          ) : (
            glossary.map((term) => (
              <div
                key={term.id}
                className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm hover:border-fuchsia-500/30 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Termo Original
                    </p>
                    <p className="text-sm font-semibold truncate text-foreground">
                      {term.source}
                    </p>
                  </div>
                  <div className="w-8 flex items-center justify-center text-muted-foreground/50">
                    →
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Pronúncia IA
                    </p>
                    <p className="text-sm font-semibold truncate text-fuchsia-600 dark:text-fuchsia-400">
                      {term.target}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(term.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
