import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { MediaPanel } from '@/components/editor/MediaPanel'
import { OverlaysPanel } from '@/components/editor/OverlaysPanel'
import { PublishPanel } from '@/components/editor/PublishPanel'
import { AssetsPanel } from '@/components/editor/AssetsPanel'
import { PreviewSimulatorModal } from '@/components/editor/PreviewSimulatorModal'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  Sparkles,
  Eye,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'

export default function Editor() {
  const { id } = useParams()
  const [project, update] = useProject(id || '')
  const { user } = useAuthStore()
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  if (project === null) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-6 bg-muted/20">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Projeto Não Encontrado</h2>
          <p className="text-muted-foreground">
            O projeto que você está procurando não existe ou foi excluído.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/">Voltar ao Dashboard</Link>
        </Button>
      </div>
    )
  }

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-card shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
          >
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md hidden md:block">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-base md:text-lg leading-tight truncate max-w-[150px] md:max-w-xs">
                {project.name}
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Salvo automaticamente
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            disabled={!project.videoUrl}
            className="hidden md:flex shadow-sm"
          >
            <Eye className="w-4 h-4 mr-2" /> Pré-visualizar para Análise
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPreviewModal(true)}
            disabled={!project.videoUrl}
            className="md:hidden shadow-sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {user?.plan === 'pro' && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Pro
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <div className="h-[45vh] md:h-auto md:w-[400px] lg:w-[480px] border-b md:border-b-0 md:border-r bg-muted/5 flex flex-col shrink-0 overflow-hidden shadow-sm z-10">
          <Tabs
            defaultValue="media"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full justify-start rounded-none border-b h-14 px-2 bg-background shadow-sm overflow-x-auto overflow-y-hidden shrink-0 flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsTrigger
                value="media"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                1. Mídia
              </TabsTrigger>
              <TabsTrigger
                value="overlays"
                className="flex-1 min-w-[110px] data-[state=active]:bg-muted/50"
              >
                2. Elementos
              </TabsTrigger>
              <TabsTrigger
                value="assets"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                3. Ativos
              </TabsTrigger>
              <TabsTrigger
                value="publish"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                4. Publicar
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-hidden relative">
              <ScrollArea className="absolute inset-0 h-full w-full">
                <div className="p-4 md:p-6 pb-12">
                  <TabsContent value="media" className="mt-0 outline-none">
                    <MediaPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent value="overlays" className="mt-0 outline-none">
                    <OverlaysPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent
                    value="assets"
                    className="mt-0 outline-none h-full"
                  >
                    <AssetsPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent value="publish" className="mt-0 outline-none">
                    <PublishPanel
                      project={project}
                      update={update}
                      onPreviewClick={() => setShowPreviewModal(true)}
                    />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        <div className="flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] relative flex flex-col min-w-0 min-h-0">
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-0">
            <PreviewCanvas project={project} />
          </div>

          {project.videoUrl && (
            <div className="h-28 border-t bg-background flex flex-col justify-center shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-10 relative">
              <div className="px-4 md:px-6 pt-3 flex items-center justify-between shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Corte Preciso (Timeline)
                </p>
                <span className="text-xs font-mono font-medium bg-muted px-2 py-1 rounded-md text-foreground border shadow-sm">
                  {project.trimStart}s - {project.trimEnd}s
                </span>
              </div>
              <ScrollArea className="w-full flex-1" orientation="horizontal">
                <div className="w-full min-w-[600px] md:min-w-[800px] px-4 md:px-6 py-4 flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground shrink-0 font-medium">
                    0s
                  </span>
                  <div className="h-8 flex-1 bg-muted/50 rounded-lg overflow-hidden relative border shadow-inner">
                    <div className="absolute top-0 bottom-0 left-0 bg-background/80 w-full backdrop-blur-sm" />
                    <div
                      className="absolute top-0 bottom-0 bg-primary/20 transition-all duration-300 border-x-[3px] border-primary flex items-center justify-between px-1"
                      style={{
                        left: `${(project.trimStart / (project.videoDuration || 100)) * 100}%`,
                        width: `${((project.trimEnd - project.trimStart) / (project.videoDuration || 100)) * 100}%`,
                      }}
                    >
                      <div className="w-1.5 h-4 bg-primary rounded-full shadow-sm" />
                      <div className="w-1.5 h-4 bg-primary rounded-full shadow-sm" />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0 font-medium">
                    {project.videoDuration || 100}s
                  </span>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <PreviewSimulatorModal
        project={project}
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
      />
    </div>
  )
}
