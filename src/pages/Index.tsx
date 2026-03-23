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

export default function Index() {
  const { projects, addProject, removeProject } = useProjects()
  const [newProjectName, setNewProjectName] = useState('')
  const { toast } = useToast()

  const handleCreate = () => {
    if (!newProjectName.trim()) return
    try {
      addProject(newProjectName)
      setNewProjectName('')
      toast({ title: 'Project created successfully!' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
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
              <CardTitle className="flex items-center gap-2">
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
              <Button asChild className="gap-2">
                <Link to={`/editor/${p.id}`} target="_blank">
                  Open Editor <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {projects.length < 3 && (
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">New Project</CardTitle>
              <CardDescription>
                You can work on up to 3 projects at once.
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

        {projects.length >= 3 && (
          <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center bg-muted/50 opacity-70">
            <p className="text-sm text-muted-foreground">
              Maximum of 3 active projects reached.
              <br />
              Delete one to create a new project.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
