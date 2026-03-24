import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { MediaPanel } from '@/components/editor/MediaPanel'
import { OverlaysPanel } from '@/components/editor/OverlaysPanel'
import { PublishPanel } from '@/components/editor/PublishPanel'
import { AssetsPanel } from '@/components/editor/AssetsPanel'
import { PreviewSimulatorModal } from '@/components/editor/PreviewSimulatorModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Loader2,
  Eye,
  Save,
  Download,
  ShieldAlert,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

export default function Editor() {
  const { id } = useParams()
  const [project, update] = useProject(id || '')
  const { user } = useAuthStore()
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSafeZones, setShowSafeZones] = useState(false)
  const { toast } = useToast()

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

  const handleSave = () =>
    toast({
      title: 'Project Saved',
      description: 'All changes have been successfully stored.',
    })
  const handleExport = () =>
    toast({
      title: 'Export Started',
      description:
        'Your video is rendering. We will notify you when it is done.',
    })

  const videoDuration = project.videoDuration || 100
  const snapPoints = [15, 30, 60, 90, 120]

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-sm md:text-base leading-tight truncate max-w-[150px] md:max-w-xs">
              {project.name}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Salvo automaticamente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2 border-r pr-4">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            <Label
              htmlFor="safe-zones-editor"
              className="text-xs font-semibold cursor-pointer"
            >
              Safe Zones
            </Label>
            <Switch
              id="safe-zones-editor"
              checked={showSafeZones}
              onCheckedChange={setShowSafeZones}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="hidden md:flex"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            disabled={!project.videoUrl}
          >
            <Eye className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button size="sm" onClick={handleExport} disabled={!project.videoUrl}>
            <Download className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        <div className="w-80 lg:w-96 border-r flex flex-col bg-muted/5 shrink-0 overflow-hidden z-10 shadow-sm">
          <Tabs
            defaultValue="media"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full justify-start rounded-none border-b h-12 px-2 bg-background shadow-sm shrink-0 flex-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
              <TabsTrigger value="media" className="flex-1 min-w-[80px]">
                1. Mídia
              </TabsTrigger>
              <TabsTrigger value="overlays" className="flex-1 min-w-[90px]">
                2. Elementos
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex-1 min-w-[80px]">
                3. Ativos
              </TabsTrigger>
              <TabsTrigger value="publish" className="flex-1 min-w-[80px]">
                4. Publicar
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 relative overflow-hidden">
              <ScrollArea className="absolute inset-0 w-full h-full">
                <div className="p-4 md:p-6 pb-12">
                  <TabsContent value="media" className="mt-0 outline-none">
                    <MediaPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent value="overlays" className="mt-0 outline-none">
                    <OverlaysPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent value="assets" className="mt-0 outline-none">
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

        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black/5 dark:bg-white/5 relative">
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-0 relative overflow-hidden">
            <PreviewCanvas project={project} showSafeZones={showSafeZones} />
          </div>

          {project.videoUrl && (
            <div className="h-32 border-t bg-background flex flex-col shrink-0 z-10 relative shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <div className="px-4 pt-3 flex items-center justify-between shrink-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">
                  Precise Cut Timeline
                </p>
                <span className="text-xs font-mono font-medium bg-muted px-2 py-1 rounded border">
                  {project.trimStart}s - {project.trimEnd}s
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 md:px-16 min-h-0">
                <div className="relative w-full py-4">
                  <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none">
                    {snapPoints.map((point) => {
                      if (point > videoDuration) return null
                      const pct = (point / videoDuration) * 100
                      return (
                        <div
                          key={point}
                          className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                          style={{ left: `${pct}%` }}
                        >
                          <span className="text-[9px] font-bold text-yellow-600 mb-0.5 bg-yellow-100 px-1 rounded">
                            {point}s
                          </span>
                          <div className="w-px h-2 bg-yellow-500" />
                        </div>
                      )
                    })}
                  </div>
                  <Slider
                    value={[project.trimStart, project.trimEnd]}
                    max={videoDuration}
                    step={1}
                    onValueChange={([start, end]) => {
                      if (end - start >= 1)
                        update({ trimStart: start, trimEnd: end })
                    }}
                    className="z-10 relative cursor-pointer"
                  />
                </div>
              </div>
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
