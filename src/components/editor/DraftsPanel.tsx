import { Project, Draft } from '@/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Clock, ArrowLeftRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePlayerControls } from '@/stores/usePlayerStore'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function DraftsPanel({ project, update }: Props) {
  const drafts = project.drafts || []
  const { seek } = usePlayerControls()
  const { toast } = useToast()

  const handleSwitch = (draft: Draft) => {
    update({
      ...draft.snapshot,
      activeDraftId: draft.id,
    })
    seek(0)
    toast({
      title: 'Versão Carregada',
      description: `A versão "${draft.name}" foi carregada no editor.`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Histórico de Versões
        </h3>
        <p className="text-sm text-muted-foreground">
          Todas as versões geradas por IA para este projeto ficam salvas aqui,
          permitindo que você alterne facilmente entre os rascunhos.
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-background/50">
              <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhum rascunho gerado.</p>
              <p className="text-xs mt-1">
                Gere novas histórias na aba "Criar c/ IA".
              </p>
            </div>
          ) : (
            drafts
              .slice()
              .reverse()
              .map((draft) => {
                const isActive = project.activeDraftId === draft.id
                return (
                  <Card
                    key={draft.id}
                    className={`transition-all ${
                      isActive
                        ? 'border-primary ring-1 ring-primary/50 bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 overflow-hidden">
                          <h4 className="font-semibold text-sm line-clamp-2">
                            {draft.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(draft.createdAt, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                        {isActive && (
                          <Badge variant="default" className="text-[10px]">
                            Ativo
                          </Badge>
                        )}
                      </div>
                      {!isActive && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs h-8 bg-background border shadow-sm"
                          onClick={() => handleSwitch(draft)}
                        >
                          <ArrowLeftRight className="w-3 h-3 mr-2" /> Carregar
                          Versão
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
