import { Project, Platform } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import {
  Send,
  AlertTriangle,
  Instagram,
  Facebook,
  Share2,
  Eye,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onPreviewClick?: () => void
}

export function PublishPanel({ project, update, onPreviewClick }: Props) {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const duration = project.trimEnd - project.trimStart

  const togglePlatform = (p: Platform) => {
    const platforms = project.targetPlatforms.includes(p)
      ? project.targetPlatforms.filter((x) => x !== p)
      : [...project.targetPlatforms, p]
    update({ targetPlatforms: platforms })
  }

  const updateCaption = (p: Platform, text: string) => {
    update({ captions: { ...project.captions, [p]: text } })
  }

  const handlePublish = () => {
    if (user?.plan !== 'pro') {
      toast({
        title: 'Pro Feature Required',
        description:
          'Direct API publishing is exclusively available on the Pro plan.',
        variant: 'destructive',
      })
      return
    }

    const unlinked = project.targetPlatforms.filter(
      (p) => !user?.linkedAccounts?.[p],
    )
    if (unlinked.length > 0) {
      toast({
        title: 'Accounts not connected',
        description: `Please connect ${unlinked.join(', ')} in your profile settings.`,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Publishing Video',
      description: `Pushing to ${project.targetPlatforms.length} platforms via API...`,
    })
    setTimeout(() => {
      toast({
        title: 'Success! 🚀',
        description:
          'Video published successfully to all selected feeds/reels.',
      })
    }, 2500)
  }

  const exceedsInsta =
    duration > 90 && project.targetPlatforms.includes('instagram')
  const isPro = user?.plan === 'pro'

  return (
    <div className="space-y-8 animate-fade-in-up">
      {exceedsInsta && (
        <Alert
          variant="destructive"
          className="border-2 shadow-subtle bg-destructive/5"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-base font-bold">
            Reels Duration Warning
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            Instagram Reels limit is <strong>90 seconds</strong>. Your current
            edit is <strong>{duration}s</strong>. Trim the video to publish
            successfully.
          </AlertDescription>
        </Alert>
      )}

      {!isPro && (
        <Alert className="bg-primary/5 border-primary shadow-subtle">
          <Share2 className="h-5 w-5 text-primary" />
          <AlertTitle className="font-bold">
            Unlock Direct Publishing
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            Upgrade to Pro to send edited videos directly to your Instagram,
            TikTok, and Facebook feeds via API.
            <div className="mt-3">
              <Button asChild size="sm">
                <Link to="/billing">Upgrade Now</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" /> Multi-Platform Routing
        </h3>
        <div className="space-y-3 bg-background p-2 rounded-xl border shadow-subtle">
          {(['instagram', 'tiktok', 'facebook'] as Platform[]).map((p) => {
            const isConnected = !!user?.linkedAccounts?.[p]
            return (
              <div
                key={p}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Label
                  className="capitalize cursor-pointer flex items-center gap-3 text-base"
                  htmlFor={`switch-${p}`}
                >
                  {p === 'instagram' && (
                    <Instagram className="w-5 h-5 text-pink-600" />
                  )}
                  {p === 'facebook' && (
                    <Facebook className="w-5 h-5 text-blue-600" />
                  )}
                  {p === 'tiktok' && (
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                      t
                    </div>
                  )}
                  {p}
                  {!isConnected && (
                    <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded-full">
                      Not linked
                    </span>
                  )}
                </Label>
                <Switch
                  id={`switch-${p}`}
                  checked={project.targetPlatforms.includes(p)}
                  onCheckedChange={() => togglePlatform(p)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {project.targetPlatforms.length > 0 && (
        <div className="space-y-5">
          <h3 className="font-semibold text-lg">Unique Captions</h3>
          {project.targetPlatforms.map((p) => (
            <div
              key={p}
              className="space-y-2 bg-background p-4 rounded-xl border shadow-subtle relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
              <Label className="capitalize font-semibold text-sm flex items-center gap-2 ml-2">
                {p} Post
              </Label>
              <Textarea
                placeholder={`Write an engaging caption with hashtags for ${p}...`}
                value={project.captions[p]}
                onChange={(e) => updateCaption(p, e.target.value)}
                className="resize-none h-24 mt-2 border-muted"
              />
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 space-y-3">
        {onPreviewClick && (
          <Button
            variant="secondary"
            className="w-full h-12 text-sm font-semibold"
            onClick={onPreviewClick}
          >
            <Eye className="w-4 h-4 mr-2" /> Preview for Analysis
          </Button>
        )}
        <Button
          className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
          size="lg"
          onClick={handlePublish}
          disabled={project.targetPlatforms.length === 0 || !project.videoUrl}
        >
          <Send className="w-5 h-5 mr-3" /> Publish to Selected
        </Button>
      </div>
    </div>
  )
}
