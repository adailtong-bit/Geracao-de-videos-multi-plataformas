import { useState } from 'react'
import { Project, Platform } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Youtube,
  Instagram,
  Upload,
  Send,
  CheckCircle2,
  Linkedin,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function PublishDialog({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handlePlatformToggle = (p: Platform) => {
    const current = project.targetPlatforms || []
    const updated = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p]
    update({ targetPlatforms: updated })
  }

  const handlePublish = () => {
    if (!project.targetPlatforms || project.targetPlatforms.length === 0) {
      toast({ title: 'Select at least one platform', variant: 'destructive' })
      return
    }
    setStatus('uploading')
    setProgress(0)
    let p = 0
    const int = setInterval(() => {
      p += 20
      setProgress(p)
      if (p >= 100) {
        clearInterval(int)
        setStatus('success')
        toast({
          title: 'Publication Successful',
          description:
            'Video distributed to selected platforms simultaneously.',
        })
      }
    }, 500)
  }

  const reset = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => setStatus('idle'), 300)
    }
  }

  const isApproved = project.approvalStatus === 'approved'

  const triggerButton = (
    <Button
      className={cn(
        'hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5',
        !isApproved && 'opacity-50 pointer-events-none hover:translate-y-0',
      )}
      disabled={!isApproved}
    >
      <Send className="w-4 h-4 mr-2" /> Publish
    </Button>
  )

  const platforms: { id: Platform; label: string; icon: React.ReactNode }[] = [
    {
      id: 'youtube',
      label: 'YouTube',
      icon: <Youtube className="w-5 h-5 text-red-500" />,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: (
        <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
          t
        </div>
      ),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5 text-blue-700" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={reset}>
      {!isApproved ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="hidden md:flex cursor-not-allowed">
              {triggerButton}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-[220px] text-center p-3 text-sm"
          >
            <p>
              Approval is required. The video must be marked as "Approved" in
              the Review tab before publishing.
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6 bg-card border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Upload className="w-5 h-5 text-indigo-600" /> Multi-Platform
              Publishing
            </DialogTitle>
            <DialogDescription>
              Select the platforms to distribute your content simultaneously.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 bg-muted/5">
          {status === 'success' ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-foreground">
                  Upload Complete!
                </h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">
                  Your video has been sent to all selected platforms and will be
                  available shortly.
                </p>
              </div>
              <Button onClick={() => reset(false)} className="mt-4 w-32">
                Close
              </Button>
            </div>
          ) : status === 'uploading' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center animate-pulse">
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="w-full max-w-xs space-y-3">
                <h3 className="font-bold text-lg text-foreground">
                  Distributing to Networks...
                </h3>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm font-medium text-muted-foreground">
                  {progress}% completed
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 gap-3">
                {platforms.map((p) => {
                  const isSelected = project.targetPlatforms?.includes(p.id)
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
                          : 'border-border bg-card hover:border-indigo-300',
                      )}
                      onClick={() => handlePlatformToggle(p.id)}
                    >
                      <div className="flex items-center gap-3">
                        {p.icon}
                        <span className="font-medium">{p.label}</span>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePlatformToggle(p.id)}
                        className="w-5 h-5 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </div>
                  )
                })}
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:-translate-y-0.5"
                  onClick={handlePublish}
                >
                  Confirm Publication
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
