import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Plus, Video, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'

export default function Index() {
  const { projects, addProject, removeProject } = useProjects()
  const { user } = useAuthStore()
  const [newProjectName, setNewProjectName] = useState('')
  const { toast } = useToast()

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
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">New Project</CardTitle>
              <CardDescription>
                {user?.plan === 'pro'
                  ? 'Create unlimited projects.'
                  : 'You can work on up to 3 projects at once.'}
              </CardDescription>
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
                <Plus className="w-4 h-4 mr-2" /> Create Project
              </Button>
            </CardContent>
          </Card>
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
