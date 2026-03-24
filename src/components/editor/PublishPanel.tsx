import { useState, useMemo } from 'react'
import { Project, Platform, ScheduledPost } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
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
  Loader2,
  CheckCircle2,
  CalendarIcon,
  Clock,
  Trash2,
} from 'lucide-react'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
  onPreviewClick?: () => void
}

export function PublishPanel({ project, update, onPreviewClick }: Props) {
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [statuses, setStatuses] = useState<
    Record<Platform, 'ready' | 'uploading' | 'published'>
  >({
    tiktok: 'ready',
    instagram: 'ready',
    facebook: 'ready',
  })

  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [viewDate, setViewDate] = useState<Date | undefined>(new Date())

  const totalCuts =
    project.cuts?.reduce((acc, cut) => acc + (cut.end - cut.start), 0) || 0
  const duration = totalCuts > 0 ? totalCuts : project.videoDuration || 0
  const isPro = user?.plan === 'pro'
  const isPublishing = Object.values(statuses).includes('uploading')

  const togglePlatform = (p: Platform) => {
    const platforms = project.targetPlatforms.includes(p)
      ? project.targetPlatforms.filter((x) => x !== p)
      : [...project.targetPlatforms, p]
    update({ targetPlatforms: platforms })
  }

  const handleAction = () => {
    if (!isPro)
      return toast({ title: 'Recurso Pro Necessário', variant: 'destructive' })
    if (project.targetPlatforms.length === 0)
      return toast({
        title: 'Selecione uma plataforma',
        variant: 'destructive',
      })

    if (publishMode === 'schedule') {
      if (!scheduleDate || !scheduleTime)
        return toast({
          title: 'Data e hora obrigatórias',
          variant: 'destructive',
        })
      const dt = new Date(`${scheduleDate}T${scheduleTime}`)
      const newPosts: ScheduledPost[] = project.targetPlatforms.map((p) => ({
        id: crypto.randomUUID(),
        platform: p,
        date: dt.toISOString(),
        status: 'scheduled',
      }))
      update({
        scheduledPosts: [...(project.scheduledPosts || []), ...newPosts],
      })
      toast({ title: 'Posts Agendados com sucesso! 📅' })
      return
    }

    const newStatuses = { ...statuses }
    project.targetPlatforms.forEach((p) => {
      newStatuses[p] = 'uploading'
    })
    setStatuses(newStatuses)
    toast({
      title: 'Publicando Vídeo',
      description: `Enviando para as plataformas...`,
    })

    setTimeout(() => {
      const finalStatuses = { ...newStatuses }
      project.targetPlatforms.forEach((p) => {
        finalStatuses[p] = 'published'
      })
      setStatuses(finalStatuses)
      toast({
        title: 'Sucesso! 🚀',
        description: 'Vídeo publicado com sucesso.',
      })
    }, 3000)
  }

  const cancelPost = (id: string) => {
    update({
      scheduledPosts: project.scheduledPosts?.filter((p) => p.id !== id),
    })
    toast({ title: 'Agendamento cancelado' })
  }

  const scheduledDates = useMemo(
    () => project.scheduledPosts?.map((p) => new Date(p.date)) || [],
    [project.scheduledPosts],
  )
  const postsOnViewDate = useMemo(
    () =>
      project.scheduledPosts?.filter(
        (p) =>
          viewDate &&
          new Date(p.date).toDateString() === viewDate.toDateString(),
      ) || [],
    [project.scheduledPosts, viewDate],
  )

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      {duration > 90 && project.targetPlatforms.includes('instagram') && (
        <Alert
          variant="destructive"
          className="border-2 shadow-sm bg-destructive/5"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">
            Aviso de Duração (Reels)
          </AlertTitle>
          <AlertDescription className="text-sm">
            O limite do Instagram Reels é 90s. Seu vídeo tem{' '}
            {Math.round(duration)}s.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" /> Roteamento Multiplataforma
        </h3>
        <div className="space-y-3 bg-background p-2 rounded-xl border shadow-sm">
          {(['instagram', 'tiktok', 'facebook'] as Platform[]).map((p) => (
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
              </Label>
              <Switch
                id={`switch-${p}`}
                checked={project.targetPlatforms.includes(p)}
                onCheckedChange={() => togglePlatform(p)}
                disabled={
                  statuses[p] === 'uploading' || statuses[p] === 'published'
                }
              />
            </div>
          ))}
        </div>
      </div>

      {project.targetPlatforms.length > 0 && (
        <div className="space-y-5">
          <h3 className="font-semibold text-lg">Legendas Únicas</h3>
          {project.targetPlatforms.map((p) => (
            <div
              key={p}
              className="space-y-2 bg-background p-4 rounded-xl border shadow-sm relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
              <Label className="capitalize font-semibold text-sm">
                Post {p}
              </Label>
              <Textarea
                placeholder={`Escreva uma legenda engajadora para ${p}...`}
                value={project.captions[p] || ''}
                onChange={(e) =>
                  update({
                    captions: { ...project.captions, [p]: e.target.value },
                  })
                }
                className="resize-none h-20 mt-2 border-muted text-sm"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 bg-background p-5 rounded-xl border shadow-sm">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={publishMode === 'now' ? 'default' : 'ghost'}
            className="flex-1 text-sm font-semibold"
            onClick={() => setPublishMode('now')}
          >
            <Send className="w-4 h-4 mr-2" /> Publicar Agora
          </Button>
          <Button
            variant={publishMode === 'schedule' ? 'default' : 'ghost'}
            className="flex-1 text-sm font-semibold"
            onClick={() => setPublishMode('schedule')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Agendar
          </Button>
        </div>

        {publishMode === 'schedule' && (
          <div className="flex gap-3 pt-2 animate-fade-in">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Horário</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        )}

        <Button
          className="w-full h-12 text-base font-bold shadow-md mt-4 transition-all hover:-translate-y-0.5"
          onClick={handleAction}
          disabled={!project.videoUrl || isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : null}
          {publishMode === 'now'
            ? isPublishing
              ? 'Publicando...'
              : 'Publicar nos Selecionados'
            : 'Agendar Posts'}
        </Button>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" /> Calendário de
          Publicações
        </h3>
        <div className="bg-background p-4 rounded-xl border shadow-sm">
          <Calendar
            mode="single"
            selected={viewDate}
            onSelect={setViewDate}
            className="mx-auto"
            modifiers={{ scheduled: scheduledDates }}
            modifiersStyles={{
              scheduled: {
                fontWeight: 'bold',
                border: '2px solid hsl(var(--primary))',
              },
            }}
          />
          <div className="mt-4 space-y-2 border-t pt-4 min-h-[80px]">
            {postsOnViewDate.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum post agendado para este dia.
              </p>
            ) : (
              postsOnViewDate.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-bold text-foreground">
                      {post.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />{' '}
                      {new Date(post.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive hover:bg-destructive/10"
                      onClick={() => cancelPost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
