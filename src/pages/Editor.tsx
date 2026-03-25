import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { AiCreatorPanel } from '@/components/editor/AiCreatorPanel'
import { TimelinePanel } from '@/components/editor/TimelinePanel'
import { PublishPanel } from '@/components/editor/PublishPanel'
import { AudioPanel } from '@/components/editor/AudioPanel'
import { ReviewPanel } from '@/components/editor/ReviewPanel'
import { InteractiveTimeline } from '@/components/editor/InteractiveTimeline'
import { PublishDialog } from '@/components/editor/PublishDialog'
import { TeamDialog } from '@/components/editor/TeamDialog'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  Wand2,
  Video,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  Film,
  Download,
  Music,
  Settings2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Project, Draft } from '@/types'
import { usePlayerControls } from '@/stores/usePlayerStore'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function VersionsSidebar({
  project,
  update,
  isGenerating,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
  isGenerating: boolean
}) {
  const { drafts = [], activeDraftId } = project
  const { seek } = usePlayerControls()

  const handleSwitch = (draft: Draft) => {
    update({
      ...draft.snapshot,
      activeDraftId: draft.id,
    })
    seek(0)
  }

  return (
    <Sidebar variant="sidebar" className="border-r shadow-sm">
      <SidebarHeader className="h-14 border-b px-4 flex items-center justify-center shrink-0 bg-card">
        <h2 className="text-sm font-bold flex items-center gap-2 w-full text-foreground">
          <Video className="w-4 h-4 text-primary" /> Meus Vídeos Gerados
        </h2>
      </SidebarHeader>
      <SidebarContent className="bg-muted/10">
        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent className="p-3 space-y-3">
              {isGenerating && (
                <div className="p-3 flex flex-col gap-3 bg-primary/5 rounded-xl border-2 border-dashed border-primary/50 animate-pulse shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm font-bold text-primary">
                      Gerando nova narrativa HD...
                    </p>
                  </div>
                  <Skeleton className="h-24 w-full rounded-md bg-primary/10" />
                  <Skeleton className="h-3 w-3/4 rounded bg-primary/10" />
                </div>
              )}
              {drafts
                .slice()
                .reverse()
                .map((draft, idx) => {
                  const isActive = activeDraftId === draft.id
                  const versionNum = drafts.length - idx
                  const isLatest = idx === 0
                  const label = isLatest
                    ? 'Última Criação'
                    : `Versão ${versionNum}`

                  const hasMedia =
                    draft.snapshot.videoUrl ||
                    (draft.snapshot.bRolls && draft.snapshot.bRolls.length > 0)
                  const thumbnail = draft.snapshot.videoUrl
                    ? `https://img.usecurling.com/p/200/200?q=video&color=gray&seed=${draft.id}`
                    : draft.snapshot.bRolls?.[0]?.url

                  return (
                    <div
                      key={draft.id}
                      className={cn(
                        'p-3 border rounded-xl cursor-pointer transition-all relative overflow-hidden group',
                        isActive
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/50 shadow-sm'
                          : 'hover:border-primary/50 bg-card hover:shadow-md',
                      )}
                      onClick={() => handleSwitch(draft)}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-10" />
                      )}
                      <div className="relative aspect-video bg-black/5 rounded-md mb-3 overflow-hidden flex items-center justify-center border border-border/50">
                        {hasMedia && thumbnail ? (
                          <img
                            src={thumbnail}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            alt="Thumbnail"
                          />
                        ) : (
                          <Video className="w-6 h-6 text-muted-foreground" />
                        )}
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Atual
                          </div>
                        )}
                      </div>

                      <div className="pl-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              'text-sm font-bold line-clamp-1',
                              isActive ? 'text-primary' : 'text-foreground',
                            )}
                            title={label}
                          >
                            {label}
                          </p>
                        </div>
                        <p
                          className="text-xs text-muted-foreground line-clamp-1 font-medium"
                          title={draft.name}
                        >
                          {draft.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(draft.createdAt, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              {!isGenerating && drafts.length === 0 && (
                <div className="text-center py-10 px-2 text-muted-foreground bg-card rounded-xl border border-dashed">
                  <Video className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold text-foreground">
                    Nenhum vídeo ainda
                  </p>
                  <p className="text-xs mt-2 text-balance leading-relaxed">
                    Comece gerando sua história orgânica no painel ao lado.
                  </p>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}

export default function Editor() {
  const { id } = useParams()
  const [project, update] = useProject(id || '')
  const [activeTab, setActiveTab] = useState('ai-creator')
  const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'success'>(
    'idle',
  )
  const { toast } = useToast()

  // Listener para eventos customizados (Ex: botão "Voltar para Correção" no PreviewCanvas)
  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setActiveTab(customEvent.detail)
      }
    }
    window.addEventListener('set_tab', handleSetTab)
    return () => window.removeEventListener('set_tab', handleSetTab)
  }, [])

  if (project === null) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-6 bg-muted/20 p-4">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold">Projeto Não Encontrado</h2>
          <p className="text-muted-foreground">
            O projeto que você está procurando não existe, falhou ao carregar ou
            foi excluído.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/">Voltar aos Projetos</Link>
        </Button>
      </div>
    )
  }

  if (project === undefined) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 hidden sm:block" />
        </header>
        <div className="flex-1 flex overflow-hidden min-h-0 w-full">
          <div className="w-80 lg:w-[400px] border-r flex flex-col bg-muted/5 shrink-0 p-4 space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black/5 dark:bg-white/5 relative p-4 md:p-8">
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () =>
    toast({
      title: 'Projeto Salvo',
      description: 'Alterações armazenadas com sucesso.',
    })

  const handleDownload = () => {
    toast({
      title: 'Renderizando HD',
      description: 'Seu vídeo MP4 está sendo gerado em alta definição...',
    })
    setTimeout(() => {
      toast({
        title: 'Download Concluído',
        description: 'O arquivo MP4 foi salvo no seu dispositivo.',
      })
    }, 3000)
  }

  const hasMultipleCreations = (project.drafts?.length || 0) > 1
  const teamMembers = project.teamMembers || []

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {hasMultipleCreations && (
          <VersionsSidebar
            project={project}
            update={update}
            isGenerating={aiStatus === 'generating'}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <header className="h-14 border-b flex items-center justify-between px-2 sm:px-4 bg-card shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              {hasMultipleCreations && (
                <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
              )}
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="text-foreground shrink-0 font-medium hover:bg-secondary/80"
              >
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />{' '}
                  <span className="hidden sm:inline">Voltar aos Projetos</span>
                </Link>
              </Button>
              <div className="flex flex-col justify-center min-w-0 pl-2 sm:pl-4 border-l">
                <h1 className="font-semibold text-sm md:text-base leading-tight truncate max-w-[150px] md:max-w-xs">
                  {project.name}
                </h1>
                <div className="text-[10px] text-muted-foreground flex items-center mt-0.5">
                  Salvo automaticamente
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden lg:flex items-center -space-x-2 mr-2">
                {teamMembers.slice(0, 3).map((m) => (
                  <Avatar
                    key={m.id}
                    className="w-8 h-8 border-2 border-card shadow-sm"
                    title={m.email}
                  >
                    <AvatarImage src={m.avatar} />
                  </Avatar>
                ))}
              </div>
              <TeamDialog project={project} update={update} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hidden md:flex"
              >
                <Download className="w-4 h-4 mr-2" /> Baixar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="hidden md:flex"
              >
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
              <PublishDialog project={project} />
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden min-h-0 w-full">
            <div className="w-80 lg:w-[400px] border-r flex flex-col bg-muted/5 shrink-0 overflow-hidden z-10 shadow-sm">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <TabsList className="w-full justify-start rounded-none border-b h-14 px-2 bg-background shadow-sm shrink-0 flex-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
                  <TabsTrigger
                    value="ai-creator"
                    className="shrink-0 min-w-[90px] text-sm text-blue-600 data-[state=active]:text-blue-700 font-bold h-10"
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Criar
                  </TabsTrigger>
                  <TabsTrigger
                    value="audio"
                    className="shrink-0 min-w-[90px] text-sm text-green-600 data-[state=active]:text-green-700 font-bold h-10"
                  >
                    <Music className="w-4 h-4 mr-2" /> Áudio
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="shrink-0 min-w-[90px] text-sm text-indigo-600 data-[state=active]:text-indigo-700 font-bold h-10"
                  >
                    <Film className="w-4 h-4 mr-2" /> Sequência
                  </TabsTrigger>
                  <TabsTrigger
                    value="review"
                    className="shrink-0 min-w-[90px] text-sm text-amber-600 data-[state=active]:text-amber-700 font-bold h-10"
                  >
                    <Settings2 className="w-4 h-4 mr-2" /> Studio
                  </TabsTrigger>
                  <TabsTrigger
                    value="publish"
                    className="shrink-0 min-w-[90px] text-sm h-10 font-medium"
                  >
                    <Send className="w-4 h-4 mr-2" /> Publicar
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 relative overflow-hidden">
                  <ScrollArea className="absolute inset-0 w-full h-full">
                    <div className="p-4 md:p-6 pb-12 h-full">
                      <TabsContent
                        value="ai-creator"
                        className="mt-0 outline-none"
                      >
                        <AiCreatorPanel
                          project={project}
                          update={update}
                          onNext={() => setActiveTab('audio')}
                          onStatusChange={setAiStatus}
                        />
                      </TabsContent>
                      <TabsContent
                        value="audio"
                        className="mt-0 outline-none h-full"
                      >
                        <AudioPanel project={project} update={update} />
                      </TabsContent>
                      <TabsContent
                        value="timeline"
                        className="mt-0 outline-none"
                      >
                        <TimelinePanel
                          project={project}
                          onNext={() => setActiveTab('review')}
                          update={update}
                        />
                      </TabsContent>
                      <TabsContent value="review" className="mt-0 outline-none">
                        <ReviewPanel
                          project={project}
                          update={update}
                          onNext={() => setActiveTab('publish')}
                        />
                      </TabsContent>
                      <TabsContent
                        value="publish"
                        className="mt-0 outline-none"
                      >
                        <PublishPanel project={project} update={update} />
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </div>
              </Tabs>
            </div>

            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black/5 dark:bg-white/5 relative">
              <div className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-0 relative overflow-hidden">
                <PreviewCanvas
                  project={project}
                  isGenerating={aiStatus === 'generating'}
                />
              </div>

              <InteractiveTimeline project={project} update={update} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
