import { Project, ProjectElement } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Type,
  Square,
  Trash2,
  GripHorizontal,
  Wand2,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function OverlaysPanel({ project, update }: Props) {
  const { toast } = useToast()

  const addElement = (type: 'text' | 'banner' | 'caption') => {
    const el: ProjectElement = {
      id: crypto.randomUUID(),
      type,
      content: type === 'banner' ? 'Inscreva-se' : 'Gancho Engajador!',
      x: 50,
      y: 50,
      color: '#ffffff',
      bgColor: '#e11d48',
      animationStyle: 'none',
    }
    update({ elements: [...project.elements, el] })
  }

  const handleGenerateCaptions = () => {
    if (!project.videoUrl) {
      toast({
        title: 'Faça upload de um vídeo',
        description: 'Legendas automáticas precisam do áudio do vídeo.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Analisando áudio...',
      description: 'Gerando legendas inteligentes.',
    })

    setTimeout(() => {
      update({
        elements: [
          ...project.elements,
          {
            id: crypto.randomUUID(),
            type: 'caption',
            content: 'Bem-vindos de volta pessoal!',
            x: 50,
            y: 75,
            color: '#ffffff',
            animationStyle: 'pop-up',
          },
          {
            id: crypto.randomUUID(),
            type: 'caption',
            content: 'Hoje vamos explorar...',
            x: 50,
            y: 75,
            color: '#facc15',
            animationStyle: 'highlight',
          },
        ],
      })
      toast({ title: 'Legendas geradas com sucesso!' })
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
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-4 bg-background p-4 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <Label className="font-bold flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-purple-500" /> Animação de
            Legendas (Global)
          </Label>
        </div>
        <Select
          value={project.globalCaptionStyle || 'none'}
          onValueChange={(v: any) => update({ globalCaptionStyle: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sem Animação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma (Estática)</SelectItem>
            <SelectItem value="pop-up">Pop-up (Salto Rápido)</SelectItem>
            <SelectItem value="highlight">
              Highlight (Palavras Destaque)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Aplica movimento automático para as legendas inteligentes geradas por
          IA.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => addElement('caption')}
          className="shadow-sm font-medium"
          variant="secondary"
        >
          <Type className="w-4 h-4 mr-2" /> Nova Legenda
        </Button>
        <Button
          onClick={() => addElement('banner')}
          className="shadow-sm font-medium"
          variant="secondary"
        >
          <Square className="w-4 h-4 mr-2" /> Banner CTA
        </Button>
      </div>

      <Button
        onClick={handleGenerateCaptions}
        className="w-full h-12 shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 transition-all hover:scale-[1.02] font-bold"
      >
        <Wand2 className="w-5 h-5 mr-2" /> Gerar Legendas com IA
      </Button>

      <div className="space-y-4 mt-8">
        {project.elements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-background/50">
            <p>Nenhum elemento adicionado.</p>
            <p className="text-sm mt-1">Adicione texto, banners ou legendas.</p>
          </div>
        ) : (
          project.elements.map((el, i) => (
            <Card
              key={el.id}
              className="relative overflow-hidden shadow-sm border-l-4 transition-colors"
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
                    {el.type === 'banner'
                      ? 'Banner CTA'
                      : el.type === 'caption'
                        ? 'Legenda'
                        : 'Texto'}{' '}
                    {i + 1}
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
                      <span>Pos X</span>
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
                      <span>Pos Y</span>
                      <span>{el.y}%</span>
                    </div>
                    <Slider
                      value={[el.y]}
                      max={100}
                      onValueChange={([v]) => updateElement(el.id, { y: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs font-medium">Cor</Label>
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

                  {(el.type === 'caption' || el.type === 'text') && (
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Estilo</Label>
                      <Select
                        value={el.animationStyle || 'none'}
                        onValueChange={(v: any) =>
                          updateElement(el.id, { animationStyle: v })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs">
                            Estático
                          </SelectItem>
                          <SelectItem value="pop-up" className="text-xs">
                            Pop-up
                          </SelectItem>
                          <SelectItem value="highlight" className="text-xs">
                            Highlight
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
