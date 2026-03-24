import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Upload,
  Film,
  Scissors,
  Crop,
  Instagram,
  Facebook,
  PlayCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function MediaPanel({ project, update }: Props) {
  const { toast } = useToast()

  const handleFakeUpload = () => {
    update({
      videoUrl:
        'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
      videoDuration: 120,
      trimStart: 0,
      trimEnd: 120,
    })
  }

  const duration = project.trimEnd - project.trimStart

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" /> Import Media
        </h3>
        {!project.videoUrl ? (
          <div className="border-2 border-dashed rounded-xl p-10 text-center bg-muted/30 transition-colors hover:bg-muted/50">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
            <p className="mb-2 font-medium">Upload a video to start editing</p>
            <p className="mb-6 text-sm text-muted-foreground">
              MP4, MOV up to 500MB
            </p>
            <Button onClick={handleFakeUpload}>Select Video File</Button>
          </div>
        ) : (
          <div className="p-5 bg-background rounded-xl border shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                {project.name.toLowerCase().replace(' ', '_')}.mp4
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1080p • {project.videoDuration}s duration
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleFakeUpload}>
              Replace
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" /> Cutting Tool
        </h3>
        <div className="space-y-6 bg-background p-5 rounded-xl border shadow-subtle">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Start Time (s)</Label>
              <Input
                type="number"
                value={project.trimStart}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (val >= 0 && val < project.trimEnd)
                    update({ trimStart: val })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Time (s)</Label>
              <Input
                type="number"
                value={project.trimEnd}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (
                    val > project.trimStart &&
                    val <= (project.videoDuration || 100)
                  )
                    update({ trimEnd: val })
                }}
              />
            </div>
          </div>

          <div className="px-2">
            <Slider
              value={[project.trimStart, project.trimEnd]}
              max={project.videoDuration || 100}
              step={1}
              onValueChange={([start, end]) => {
                if (end - start >= 1) {
                  update({ trimStart: start, trimEnd: end })
                }
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium text-primary">
              Duration: {duration}s
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast({
                  title: 'Previewing cut...',
                  description: `Playing segment from ${project.trimStart}s to ${project.trimEnd}s`,
                })
              }
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Preview Cut
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Crop className="w-5 h-5 text-primary" /> Format Adaptor
        </h3>
        <div className="space-y-4 bg-background p-5 rounded-xl border shadow-subtle">
          <Label>Platform Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={project.aspectRatio === '9:16' ? 'default' : 'outline'}
              className="flex flex-col h-auto py-3 gap-1 px-1"
              onClick={() => update({ aspectRatio: '9:16' })}
            >
              <Instagram className="w-5 h-5" />
              <span className="text-xs">Reel</span>
            </Button>
            <Button
              variant={project.aspectRatio === '9:16' ? 'default' : 'outline'}
              className="flex flex-col h-auto py-3 gap-1 px-1"
              onClick={() => update({ aspectRatio: '9:16' })}
            >
              <div className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-current text-background rounded-sm">
                t
              </div>
              <span className="text-xs">TikTok</span>
            </Button>
            <Button
              variant={project.aspectRatio === '4:5' ? 'default' : 'outline'}
              className="flex flex-col h-auto py-3 gap-1 px-1"
              onClick={() => update({ aspectRatio: '4:5' })}
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs">FB Feed</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
