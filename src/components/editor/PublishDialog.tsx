import { useState } from 'react'
import { Project, Platform, ScheduledPost } from '@/types'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  CalendarClock,
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

  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

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
      toast({
        title: 'Selecione pelo menos uma plataforma',
        variant: 'destructive',
      })
      return
    }

    if (isScheduling) {
      if (!scheduleDate || !scheduleTime) {
        toast({ title: 'Preencha a data e horário', variant: 'destructive' })
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

          const dt = new Date(`${scheduleDate}T${scheduleTime}`)
          const newPosts: ScheduledPost[] = project.targetPlatforms.map(
            (plat) => ({
              id: crypto.randomUUID(),
              platform: plat,
              date: dt.toISOString(),
              status: 'scheduled',
            }),
          )
          update({
            scheduledPosts: [...(project.scheduledPosts || []), ...newPosts],
          })

          toast({
            title: 'Agendamento Confirmado',
            description: `Seu vídeo foi agendado para ${scheduleDate} às ${scheduleTime}.`,
          })
        }
      }, 500)
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
          title: 'Publicação Concluída',
          description:
            'Vídeo distribuído para as redes selecionadas com sucesso.',
        })
      }
    }, 500)
  }

  const reset = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setStatus('idle')
        setIsScheduling(false)
        setScheduleDate('')
        setScheduleTime('')
      }, 300)
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
      <Send className="w-4 h-4 mr-2" /> Publicar
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
              Aprovação Necessária. O projeto deve estar com o status "Aprovado"
              na aba de Revisão antes de poder publicar ou agendar.
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
              <Upload className="w-5 h-5 text-indigo-600" /> Publicação
              Multiplataforma
            </DialogTitle>
            <DialogDescription>
              Selecione as redes sociais para enviar ou agendar o seu conteúdo.
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
                <h3 className="font-bold text-2xl text-foreground">Sucesso!</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">
                  {isScheduling
                    ? `Seu conteúdo foi agendado para as plataformas selecionadas.`
                    : `Seu vídeo foi processado e já está disponível nas redes.`}
                </p>
              </div>
              <Button onClick={() => reset(false)} className="mt-4 w-32">
                Fechar
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
                  {isScheduling
                    ? 'Processando Agendamento...'
                    : 'Distribuindo Redes...'}
                </h3>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm font-medium text-muted-foreground">
                  {progress}% completo
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

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-sm font-semibold flex items-center gap-2 cursor-pointer"
                    htmlFor="toggle-schedule"
                  >
                    <CalendarClock className="w-4 h-4 text-primary" /> Agendar
                    Publicação
                  </Label>
                  <Switch
                    id="toggle-schedule"
                    checked={isScheduling}
                    onCheckedChange={setIsScheduling}
                  />
                </div>

                {isScheduling && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 bg-background p-3 rounded-lg border">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Data
                      </Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Hora
                      </Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:-translate-y-0.5"
                  onClick={handlePublish}
                >
                  {isScheduling ? 'Confirmar Agendamento' : 'Publicar Agora'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
