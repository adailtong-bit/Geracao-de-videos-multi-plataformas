import { useParams, Link } from 'react-router-dom'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { MediaPanel } from '@/components/editor/MediaPanel'
import { OverlaysPanel } from '@/components/editor/OverlaysPanel'
import { PublishPanel } from '@/components/editor/PublishPanel'
import { AssetsPanel } from '@/components/editor/AssetsPanel'
import { ArrowLeft, LayoutDashboard, Loader2, Sparkles } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'

export default function Editor() {
  const { id } = useParams()
  const [project, update] = useProject(id || '')
  const { user } = useAuthStore()

  if (project === null) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-6 bg-muted/20">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist or was deleted.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/">Return to Dashboard</Link>
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
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">
                {project.name}
              </h1>
              <p className="text-xs text-muted-foreground">Auto-saved</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {user?.plan === 'pro' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Pro Workspace
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[480px] border-r bg-muted/5 flex flex-col shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <Tabs defaultValue="media" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-14 px-2 bg-background shadow-sm overflow-x-auto overflow-y-hidden">
              <TabsTrigger
                value="media"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                1. Media
              </TabsTrigger>
              <TabsTrigger
                value="overlays"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                2. Elements
              </TabsTrigger>
              <TabsTrigger
                value="assets"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                3. Assets
              </TabsTrigger>
              <TabsTrigger
                value="publish"
                className="flex-1 min-w-[100px] data-[state=active]:bg-muted/50"
              >
                4. Publish
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <TabsContent value="media" className="mt-0 outline-none">
                <MediaPanel project={project} update={update} />
              </TabsContent>
              <TabsContent value="overlays" className="mt-0 outline-none">
                <OverlaysPanel project={project} update={update} />
              </TabsContent>
              <TabsContent value="assets" className="mt-0 outline-none h-full">
                <AssetsPanel project={project} update={update} />
              </TabsContent>
              <TabsContent value="publish" className="mt-0 outline-none">
                <PublishPanel project={project} update={update} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] relative flex flex-col">
          <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
            <PreviewCanvas project={project} />
          </div>

          {project.videoUrl && (
            <div className="h-20 border-t bg-background flex flex-col items-center justify-center shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] z-10 px-6">
              <div className="w-full max-w-2xl flex items-center gap-4">
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  {project.trimStart}s
                </span>
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 bg-primary/20 w-full" />
                  <div
                    className="absolute top-0 bottom-0 bg-primary transition-all duration-300"
                    style={{ left: '0%', width: '100%' }}
                  />
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  {project.trimEnd}s
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-semibold">
                Timeline Preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
