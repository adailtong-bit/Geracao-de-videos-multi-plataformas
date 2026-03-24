import { useState } from 'react'
import { Project } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Youtube, Instagram, Upload, Send, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PublishDialog({ project }: { project: Project }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedCover, setSelectedCover] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePublish = () => {
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
          description: 'Vídeo distribuído para as redes sociais com sucesso.',
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

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all hover:-translate-y-0.5">
          <Send className="w-4 h-4 mr-2" /> Publicar Direto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="p-6 bg-card border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Upload className="w-5 h-5 text-indigo-600" /> Exportar & Publicar
            </DialogTitle>
            <DialogDescription>
              Envie seu vídeo HD diretamente para as redes sociais.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2 bg-muted/10">
          {status === 'success' ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-foreground">
                  Upload Concluído!
                </h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">
                  Seu vídeo está em processamento final nas plataformas e logo
                  estará disponível.
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
                  Transmitindo HD...
                </h3>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm font-medium text-muted-foreground">
                  {progress}% concluído
                </p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="youtube" className="w-full animate-fade-in-up">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="youtube"
                  className="flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4 text-red-500" /> YouTube
                </TabsTrigger>
                <TabsTrigger
                  value="instagram"
                  className="flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4 text-pink-500" /> Reels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Título do Vídeo</Label>
                  <Input
                    defaultValue={project.name}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Descrição Semântica</Label>
                  <Textarea
                    placeholder="Descreva seu vídeo para o YouTube..."
                    className="resize-none h-24 bg-background"
                    defaultValue={`${project.name}\n\nGerado com IA.\n#shorts #historia`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Visibilidade</Label>
                  <Select defaultValue="public">
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="unlisted">Não Listado</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="instagram" className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Legenda do Reels</Label>
                  <Textarea
                    defaultValue={project.captions?.instagram || ''}
                    className="resize-none h-24 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Capa Personalizada</Label>
                  <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
                    {project.bRolls?.slice(0, 4).map((br) => {
                      const isSelected = selectedCover === br.id
                      return (
                        <div
                          key={br.id}
                          className="relative shrink-0 cursor-pointer group"
                          onClick={() => setSelectedCover(br.id)}
                        >
                          <img
                            src={br.url}
                            className={`w-20 h-32 object-cover rounded-md border-2 transition-all duration-300 ${
                              isSelected
                                ? 'border-pink-500 scale-105 shadow-md'
                                : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            alt="cover option"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <div className="pt-6 mt-6">
                <Button
                  className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  onClick={handlePublish}
                >
                  Confirmar e Transmitir
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
