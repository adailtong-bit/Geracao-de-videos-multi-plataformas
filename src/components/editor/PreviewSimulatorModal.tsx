import { Project, Platform } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Eye } from 'lucide-react'
import { SimulatorDisplay } from './SimulatorDisplay'

interface Props {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewSimulatorModal({ project, open, onOpenChange }: Props) {
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [showSafeZones, setShowSafeZones] = useState(false)

  const duration = project.trimEnd - project.trimStart
  const is916 = project.aspectRatio === '9:16'
  const is45 = project.aspectRatio === '4:5'

  const validations = {
    tiktok: {
      duration: duration <= 600,
      aspect: is916,
      durationText: `${duration}s / 600s max`,
      aspectText: is916 ? '9:16 Optimized' : '9:16 Recommended',
    },
    instagram: {
      duration: duration <= 90,
      aspect: is916,
      durationText: `${duration}s / 90s max`,
      aspectText: is916 ? '9:16 Optimized' : '9:16 Recommended',
    },
    facebook: {
      duration: duration <= 240,
      aspect: is45 || is916,
      durationText: `${duration}s / 240s max`,
      aspectText: is45 || is916 ? 'Optimized' : '4:5 or 9:16 Recommended',
    },
  }

  const currentValidation = validations[platform]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col md:flex-row gap-0 p-0 overflow-hidden">
        {/* Left Panel - Controls & Validation */}
        <div className="w-full md:w-[320px] bg-muted/10 border-r flex flex-col p-6 overflow-y-auto shrink-0">
          <DialogHeader className="mb-6">
            <DialogTitle>Preview & Analyze</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Platform Simulator
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {(['tiktok', 'instagram', 'facebook'] as Platform[]).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={platform === p ? 'default' : 'outline'}
                      className="justify-start capitalize"
                      onClick={() => setPlatform(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pre-Publishing Analysis
              </Label>
              <div className="bg-background border rounded-lg p-4 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {currentValidation.duration ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Duration</p>
                    <p className="text-xs text-muted-foreground">
                      {currentValidation.durationText}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {currentValidation.aspect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Aspect Ratio</p>
                    <p className="text-xs text-muted-foreground">
                      {currentValidation.aspectText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="safe-zones"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Show Safe Zones
                </Label>
                <Switch
                  id="safe-zones"
                  checked={showSafeZones}
                  onCheckedChange={setShowSafeZones}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Highlight areas covered by the native app interface to avoid
                placing important text or banners there.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Return to Editor
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-black/5 relative flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <SimulatorDisplay
            project={project}
            platform={platform}
            showSafeZones={showSafeZones}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
