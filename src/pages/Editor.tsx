import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { MediaPanel } from '@/components/editor/MediaPanel'
import { OverlaysPanel } from '@/components/editor/OverlaysPanel'
import { PublishPanel } from '@/components/editor/PublishPanel'
import { AssetsPanel } from '@/components/editor/AssetsPanel'
import { AiClipsPanel } from '@/components/editor/AiClipsPanel'
import { PreviewSimulatorModal } from '@/components/editor/PreviewSimulatorModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Eye,
  Save,
  Download,
  ShieldAlert,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Project } from '@/types'
import { usePlayerState, usePlayerControls } from '@/stores/usePlayerStore'

function TimelinePlayer({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const { currentTime, duration, isPlaying, volume, activeClipId } =
    usePlayerState()
  const { play, pause, seek, setVolume } = usePlayerControls()
  const [pendingMark, setPendingMark] = useState<number | null>(null)
  const { toast } = useToast()

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleMarkCut = () => {
    if (pendingMark === null) {
      setPendingMark(currentTime)
      toast({
        title: 'Ponto inicial marcado',
        description: `Em ${formatTime(currentTime)}`,
      })
    } else {
      const start = Math.min(pendingMark, currentTime)
      const end = Math.max(pendingMark, currentTime)
      update({
        cuts: [
          ...(project.cuts || []),
          { id: crypto.randomUUID(), start, end },
        ],
      })
      setPendingMark(null)
      toast({
        title: 'Segmento salvo',
        description: `De ${formatTime(start)} a ${formatTime(end)}`,
      })
    }
  }

  if (!project.videoUrl) return null

  return (
    <div className="h-32 border-t bg-background flex flex-col shrink-0 z-10 relative shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="px-4 py-2 flex items-center justify-between shrink-0 bg-muted/20 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant={isPlaying ? 'secondary' : 'default'}
            size="icon"
            className="rounded-full shadow-sm w-10 h-10 transition-transform active:scale-95"
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </Button>
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={([v]) => setVolume(v)}
            />
          </div>
          <span className="text-xs font-mono font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={pendingMark !== null ? 'destructive' : 'outline'}
            onClick={handleMarkCut}
            className="font-medium"
          >
            <Scissors className="w-4 h-4 mr-2" />
            {pendingMark !== null ? 'Marcar Fim' : 'Marcar Corte'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 min-h-0">
        <div className="relative w-full py-4 flex flex-col gap-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([val]) => seek(val)}
            className="z-10 relative cursor-pointer"
          />
          <div className="relative w-full h-2 pointer-events-none">
            {project.cuts?.map((cut) => {
              const left = (cut.start / duration) * 100
              const width = ((cut.end - cut.start) / duration) * 100
              return (
                <div
                  key={cut.id}
                  className="absolute top-0 h-1.5 bg-primary rounded-full"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              )
            })}
            {project.aiClips?.map((clip) => {
              const left = (clip.start / duration) * 100
              const width = ((clip.end - clip.start) / duration) * 100
              const isActive = activeClipId === clip.id
              return (
                <div
                  key={clip.id}
                  className={cn(
                    'absolute top-0 rounded-full transition-all',
                    isActive
                      ? 'bg-purple-500 z-20 h-2 -translate-y-[2px] shadow-sm'
                      : 'bg-purple-500/40 z-10 h-1.5',
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              )
            })}
            {pendingMark !== null && (
              <div
                className="absolute top-0 h-2 w-2 bg-red-500 rounded-full -translate-x-1 shadow-sm"
                style={{ left: `${(pendingMark / duration) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Editor() {
  const { id } = useParams()
  const [project, update] = useProject(id || '')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSafeZones, setShowSafeZones] = useState(false)
  const { toast } = useToast()

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
          <Link to="/">Go Back</Link>
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
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 hidden sm:block" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden min-h-0 w-full">
          <div className="w-80 lg:w-[400px] border-r flex flex-col bg-muted/5 shrink-0 p-4 space-y-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
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
      title: 'Project Saved',
      description: 'All changes have been successfully stored.',
    })
  const handleExport = () =>
    toast({
      title: 'Export Started',
      description:
        'Your video is rendering. We will notify you when it is done.',
    })

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
        <div className="w-80 lg:w-[400px] border-r flex flex-col bg-muted/5 shrink-0 overflow-hidden z-10 shadow-sm">
          <Tabs
            defaultValue="media"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full justify-start rounded-none border-b h-12 px-2 bg-background shadow-sm shrink-0 flex-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
              <TabsTrigger
                value="media"
                className="flex-1 min-w-[60px] text-xs sm:text-sm"
              >
                Mídia
              </TabsTrigger>
              <TabsTrigger
                value="ai-clips"
                className="flex-1 min-w-[80px] text-xs sm:text-sm text-purple-600 data-[state=active]:text-purple-700"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> IA Engine
              </TabsTrigger>
              <TabsTrigger
                value="overlays"
                className="flex-1 min-w-[80px] text-xs sm:text-sm"
              >
                Elementos
              </TabsTrigger>
              <TabsTrigger
                value="assets"
                className="flex-1 min-w-[60px] text-xs sm:text-sm"
              >
                Ativos
              </TabsTrigger>
              <TabsTrigger
                value="publish"
                className="flex-1 min-w-[70px] text-xs sm:text-sm"
              >
                Publicar
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 relative overflow-hidden">
              <ScrollArea className="absolute inset-0 w-full h-full">
                <div className="p-4 md:p-6 pb-12">
                  <TabsContent value="media" className="mt-0 outline-none">
                    <MediaPanel project={project} update={update} />
                  </TabsContent>
                  <TabsContent value="ai-clips" className="mt-0 outline-none">
                    <AiClipsPanel project={project} update={update} />
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

          <TimelinePlayer project={project} update={update} />
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
