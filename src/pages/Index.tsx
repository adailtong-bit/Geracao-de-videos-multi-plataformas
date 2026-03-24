import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Plus,
  Video,
  Trash2,
  ExternalLink,
  PlaySquare,
  LayoutTemplate,
  Link as LinkIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Index() {
  const { projects, addProject, removeProject } = useProjects()
  const { user } = useAuthStore()
  const [newProjectName, setNewProjectName] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  const [importUrl, setImportUrl] = useState('')
  const [showImportPreview, setShowImportPreview] = useState(false)

  const maxProjects = user?.plan === 'pro' ? Infinity : 3

  const handleCreate = () => {
    if (!newProjectName.trim()) return
    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Required',
        description: 'You have reached the free plan limit.',
        variant: 'destructive',
      })
      return
    }
    try {
      addProject(newProjectName)
      setNewProjectName('')
      toast({ title: 'Project created successfully!' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleUrlChange = (val: string) => {
    setImportUrl(val)
    if (
      val.includes('facebook.com') ||
      val.includes('fb.watch') ||
      val.includes('instagram.com') ||
      val.includes('tiktok.com') ||
      val.includes('youtube.com')
    ) {
      setShowImportPreview(true)
    } else {
      setShowImportPreview(false)
    }
  }

  const handleImportVideo = () => {
    if (!importUrl.trim()) return
    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Required',
        description: 'You have reached the free plan limit.',
        variant: 'destructive',
      })
      return
    }
    try {
      const p = addProject('Imported Video', {
        videoUrl:
          'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
        videoDuration: 180,
        trimStart: 0,
        trimEnd: 180,
      })
      setImportUrl('')
      setShowImportPreview(false)
      toast({ title: 'Video imported successfully!' })
      navigate(`/editor/${p.id}`)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleExampleProject = () => {
    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Required',
        description: 'You have reached the free plan limit.',
        variant: 'destructive',
      })
      return
    }
    try {
      const p = addProject('Demo: FB Repurpose', {
        videoUrl:
          'https://img.usecurling.com/p/800/1200?q=parkour&color=orange',
        videoDuration: 60,
        trimStart: 10,
        trimEnd: 45,
        aspectRatio: '9:16',
        elements: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Wait for it...',
            x: 50,
            y: 20,
            color: '#ffffff',
            bgColor: '#000000',
          },
          {
            id: crypto.randomUUID(),
            type: 'banner',
            content: 'Follow for more!',
            x: 50,
            y: 80,
            color: '#ffffff',
            bgColor: '#e11d48',
          },
        ],
      })
      toast({ title: 'Example loaded!' })
      navigate(`/editor/${p.id}`)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            My Projects
          </h1>
          <p className="text-muted-foreground">
            Manage your video edits across platforms simultaneously.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="flex flex-col shadow-subtle hover:shadow-elevation transition-all"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5 text-primary" />
                <span className="truncate">{p.name}</span>
              </CardTitle>
              <CardDescription>
                Created {new Date(p.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Platforms: {p.targetPlatforms.join(', ') || 'None'}</p>
                <p>
                  Aspect Ratio:{' '}
                  <span className="font-medium text-foreground">
                    {p.aspectRatio}
                  </span>
                </p>
                <p>Duration: {p.trimEnd - p.trimStart}s</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProject(p.id)}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button asChild className="gap-2" size="sm">
                <Link to={`/editor/${p.id}`}>
                  Open Editor <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {projects.length < maxProjects && (
          <>
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">New Project</CardTitle>
                <CardDescription>Create a blank workspace.</CardDescription>
              </CardHeader>
              <CardContent className="w-full space-y-4 pt-4">
                <Input
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="bg-background"
                />
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!newProjectName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Blank
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 flex flex-col items-center justify-center p-6 text-center bg-card hover:shadow-md transition-all shadow-subtle border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" /> Unified Importer
                </CardTitle>
                <CardDescription>
                  Fetch content from Facebook, Instagram, TikTok, or YouTube.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full space-y-4 pt-4">
                <Input
                  placeholder="Video URL (e.g., https://...)"
                  value={importUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="bg-background"
                />
                {showImportPreview && (
                  <div className="bg-muted/50 border rounded-lg p-3 flex gap-3 text-left animate-fade-in shadow-sm">
                    <div className="w-12 h-12 bg-black rounded overflow-hidden shrink-0">
                      <img
                        src="https://img.usecurling.com/p/100/100?q=video&color=blue"
                        alt="Thumbnail"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="font-semibold text-xs truncate">
                        External Video
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Ready to import
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full shadow-md"
                  onClick={handleImportVideo}
                  disabled={!importUrl.trim()}
                >
                  <PlaySquare className="w-4 h-4 mr-2" /> Import Video
                </Button>

                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Demo Mode
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExampleProject}
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" /> Load Example Video
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {projects.length >= maxProjects && (
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center bg-muted/50">
            <p className="text-sm text-muted-foreground mb-4">
              Maximum active projects reached on the free plan.
            </p>
            <Button asChild variant="outline">
              <Link to="/billing">Upgrade to Pro</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
