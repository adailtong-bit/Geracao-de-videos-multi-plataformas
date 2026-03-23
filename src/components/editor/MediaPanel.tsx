import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Upload, Film, Clock, Crop, Instagram, Facebook } from 'lucide-react'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function MediaPanel({ project, update }: Props) {
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
          <Clock className="w-5 h-5 text-primary" /> Trimming (Cuts)
        </h3>
        <div className="space-y-6 bg-background p-5 rounded-xl border shadow-subtle">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">
              Start: {project.trimStart}s
            </span>
            <span className="text-primary">Duration: {duration}s</span>
            <span className="text-muted-foreground">
              End: {project.trimEnd}s
            </span>
          </div>
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
