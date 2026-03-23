import { Project, ProjectElement } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Type, Square, Trash2, GripHorizontal } from 'lucide-react'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function OverlaysPanel({ project, update }: Props) {
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
      <div className="flex gap-3">
        <Button
          onClick={() => addElement('text')}
          className="flex-1 h-12 shadow-subtle"
          variant="secondary"
        >
          <Type className="w-4 h-4 mr-2" /> Add Text
        </Button>
        <Button
          onClick={() => addElement('banner')}
          className="flex-1 h-12 shadow-subtle"
          variant="secondary"
        >
          <Square className="w-4 h-4 mr-2" /> Add CTA Banner
        </Button>
      </div>

      <div className="space-y-4">
        {project.elements.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-background/50">
            <p>No overlays added yet.</p>
            <p className="text-sm mt-1">
              Add text or banners to engage your audience.
            </p>
          </div>
        ) : (
          project.elements.map((el, i) => (
            <Card
              key={el.id}
              className="relative overflow-hidden shadow-subtle border-l-4"
              style={{
                borderLeftColor:
                  el.type === 'text' ? 'hsl(var(--primary))' : el.bgColor,
              }}
            >
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                    <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                    {el.type} Overlay {i + 1}
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
                  <Label className="text-xs text-muted-foreground">
                    Content
                  </Label>
                  <Input
                    value={el.content}
                    onChange={(e) =>
                      updateElement(el.id, { content: e.target.value })
                    }
                    placeholder="Enter text..."
                    className="font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                    <div className="flex justify-between text-xs font-medium">
                      <span>X Position</span>
                      <span>{el.x}%</span>
                    </div>
                    <Slider
                      value={[el.x]}
                      max={100}
                      onValueChange={([v]) => updateElement(el.id, { x: v })}
                    />
                  </div>
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Y Position</span>
                      <span>{el.y}%</span>
                    </div>
                    <Slider
                      value={[el.y]}
                      max={100}
                      onValueChange={([v]) => updateElement(el.id, { y: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg w-max">
                  <Label className="text-xs font-medium">Color</Label>
                  <Input
                    type="color"
                    value={el.type === 'text' ? el.color : el.bgColor}
                    onChange={(e) =>
                      updateElement(
                        el.id,
                        el.type === 'text'
                          ? { color: e.target.value }
                          : { bgColor: e.target.value },
                      )
                    }
                    className="w-10 h-10 p-1 border-none bg-transparent cursor-pointer rounded-md overflow-hidden"
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
