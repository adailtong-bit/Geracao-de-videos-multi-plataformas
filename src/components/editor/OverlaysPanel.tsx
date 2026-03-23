import { Project, ProjectElement } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Type, Square, Trash2, GripHorizontal, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function OverlaysPanel({ project, update }: Props) {
  const { toast } = useToast()

  const addElement = (type: 'text' | 'banner') => {
    const el: ProjectElement = {
      id: crypto.randomUUID(),
      type,
      content: type === 'text' ? 'Engaging Hook!' : 'Subscribe Now',
      x: 50,
      y: 50,
      color: '#ffffff',
      bgColor: '#e11d48',
    }
    update({ elements: [...project.elements, el] })
  }

  const handleGenerateCaptions = () => {
    if (!project.videoUrl) {
      toast({
        title: 'Upload a video first',
        description: 'Auto-captions require video audio.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Analyzing audio...',
      description: 'Generating smart captions.',
    })

    setTimeout(() => {
      update({
        elements: [
          ...project.elements,
          {
            id: crypto.randomUUID(),
            type: 'caption',
            content: 'Welcome back guys!',
            x: 50,
            y: 75,
            color: '#ffffff',
          },
          {
            id: crypto.randomUUID(),
            type: 'caption',
            content: 'Today we will explore...',
            x: 50,
            y: 75,
            color: '#facc15',
          },
        ],
      })
      toast({ title: 'Captions generated successfully!' })
    }, 2000)
  }

  const updateElement = (id: string, elUpdates: Partial<ProjectElement>) => {
    update({
      elements: project.elements.map((el) =>
        el.id === id ? { ...el, ...elUpdates } : el,
      ),
    })
  }

  const removeElement = (id: string) => {
    update({ elements: project.elements.filter((el) => el.id !== id) })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex gap-2">
        <Button
          onClick={() => addElement('text')}
          className="flex-1 shadow-subtle"
          variant="secondary"
        >
          <Type className="w-4 h-4 mr-2" /> Text
        </Button>
        <Button
          onClick={() => addElement('banner')}
          className="flex-1 shadow-subtle"
          variant="secondary"
        >
          <Square className="w-4 h-4 mr-2" /> CTA Banner
        </Button>
      </div>

      <Button
        onClick={handleGenerateCaptions}
        className="w-full h-12 shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 transition-all hover:scale-[1.02]"
      >
        <Wand2 className="w-4 h-4 mr-2" /> Auto-Generate Captions
      </Button>

      <div className="space-y-4 mt-8">
        {project.elements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-background/50">
            <p>No overlays added yet.</p>
            <p className="text-sm mt-1">Add text, banners or auto-captions.</p>
          </div>
        ) : (
          project.elements.map((el, i) => (
            <Card
              key={el.id}
              className="relative overflow-hidden shadow-subtle border-l-4"
              style={{
                borderLeftColor:
                  el.type === 'text' || el.type === 'caption'
                    ? 'hsl(var(--primary))'
                    : el.bgColor,
              }}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                    <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                    {el.type === 'banner' ? 'CTA Banner' : el.type} {i + 1}
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeElement(el.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    value={el.content}
                    onChange={(e) =>
                      updateElement(el.id, { content: e.target.value })
                    }
                    className="font-medium h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 bg-muted/30 p-2 rounded-lg">
                    <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                      <span>X Pos</span>
                      <span>{el.x}%</span>
                    </div>
                    <Slider
                      value={[el.x]}
                      max={100}
                      onValueChange={([v]) => updateElement(el.id, { x: v })}
                    />
                  </div>
                  <div className="space-y-2 bg-muted/30 p-2 rounded-lg">
                    <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                      <span>Y Pos</span>
                      <span>{el.y}%</span>
                    </div>
                    <Slider
                      value={[el.y]}
                      max={100}
                      onValueChange={([v]) => updateElement(el.id, { y: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs font-medium">Color</Label>
                  <Input
                    type="color"
                    value={
                      el.type === 'text' || el.type === 'caption'
                        ? el.color
                        : el.bgColor
                    }
                    onChange={(e) =>
                      updateElement(
                        el.id,
                        el.type === 'text' || el.type === 'caption'
                          ? { color: e.target.value }
                          : { bgColor: e.target.value },
                      )
                    }
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer rounded-md overflow-hidden"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
