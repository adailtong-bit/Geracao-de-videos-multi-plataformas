import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Plus,
  Video,
  Trash2,
  ExternalLink,
  PlaySquare,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { isValidVideoUrl } from '@/lib/utils'

export default function Index() {
  const { projects, addProject, removeProject } = useProjects()
  const { user } = useAuthStore()
  const [newProjectName, setNewProjectName] = useState('')
  const [heroUrl, setHeroUrl] = useState('')
  const [isHeroLoading, setIsHeroLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const maxProjects = user?.plan === 'pro' ? Infinity : 3

  const handleHeroImport = () => {
    if (!heroUrl.trim()) return

    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Necessário',
        description: 'Você atingiu o limite de projetos no plano gratuito.',
        variant: 'destructive',
      })
      return
    }

    if (!isValidVideoUrl(heroUrl)) {
      toast({
        title: 'Link não suportado',
        description:
          'Não foi possível carregar este vídeo. Verifique o link e tente novamente.',
        variant: 'destructive',
      })
      return
    }

    setIsHeroLoading(true)

    // Simulate automated media fetching process
    setTimeout(() => {
      setIsHeroLoading(false)
      try {
        const p = addProject('Projeto Importado', {
          videoUrl:
            'https://img.usecurling.com/p/800/1200?q=skateboarding&color=blue',
          videoDuration: 180,
          trimStart: 0,
          trimEnd: 180,
        })
        setHeroUrl('')
        toast({ title: 'Mídia puxada com sucesso!' })
        navigate(`/editor/${p.id}`)
      } catch (e: any) {
        toast({
          title: 'Erro',
          description: e.message,
          variant: 'destructive',
        })
      }
    }, 1500)
  }

  useEffect(() => {
    if (heroUrl.trim() && isValidVideoUrl(heroUrl) && !isHeroLoading) {
      handleHeroImport()
    }
  }, [heroUrl, isHeroLoading])

  const handleCreate = () => {
    if (!newProjectName.trim()) return
    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Necessário',
        description: 'Você atingiu o limite de projetos no plano gratuito.',
        variant: 'destructive',
      })
      return
    }
    try {
      addProject(newProjectName)
      setNewProjectName('')
      toast({ title: 'Projeto criado com sucesso!' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleExampleProject = () => {
    if (projects.length >= maxProjects) {
      toast({
        title: 'Upgrade Necessário',
        description: 'Você atingiu o limite de projetos no plano gratuito.',
        variant: 'destructive',
      })
      return
    }
    try {
      const p = addProject('Demo: FB Repurpose', {
        videoUrl:
          'https://img.usecurling.com/p/800/1200?q=parkour&color=orange',
        videoDuration: 60,
        trimStart: 10,
        trimEnd: 45,
        aspectRatio: '9:16',
        elements: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Wait for it...',
            x: 50,
            y: 20,
            color: '#ffffff',
            bgColor: '#000000',
          },
          {
            id: crypto.randomUUID(),
            type: 'banner',
            content: 'Follow for more!',
            x: 50,
            y: 80,
            color: '#ffffff',
            bgColor: '#e11d48',
          },
        ],
      })
      toast({ title: 'Exemplo carregado!' })
      navigate(`/editor/${p.id}`)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="mb-10 bg-gradient-to-br from-card to-muted border border-border/50 rounded-3xl p-6 sm:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Crie um projeto a partir de um link
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-sm sm:text-base md:text-lg">
            Cole o link de um vídeo do Instagram, TikTok ou YouTube e nós
            puxaremos a mídia automaticamente para o editor.
          </p>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Paste Video Link here"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroImport()}
                className="h-14 pl-12 pr-4 text-base md:text-lg shadow-sm border-2 focus-visible:ring-0 focus-visible:border-primary rounded-xl"
                disabled={isHeroLoading}
              />
            </div>
            <Button
              className="h-14 px-8 text-base font-semibold shadow-md rounded-xl transition-all hover:scale-[1.02]"
              onClick={handleHeroImport}
              disabled={isHeroLoading || !heroUrl.trim()}
            >
              {isHeroLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <PlaySquare className="w-5 h-5 mr-2" />
              )}
              {isHeroLoading ? 'Puxando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Seus Projetos
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e edite vídeos para múltiplas plataformas.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="flex flex-col shadow-subtle hover:shadow-elevation transition-all group"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                <span className="truncate">{p.name}</span>
              </CardTitle>
              <CardDescription>
                Criado em {new Date(p.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground space-y-1.5">
                <p>
                  Plataformas:{' '}
                  <span className="font-medium text-foreground capitalize">
                    {p.targetPlatforms.join(', ') || 'Nenhuma'}
                  </span>
                </p>
                <p>
                  Formato:{' '}
                  <span className="font-medium text-foreground">
                    {p.aspectRatio}
                  </span>
                </p>
                <p>
                  Duração:{' '}
                  <span className="font-medium text-foreground">
                    {p.trimEnd - p.trimStart}s
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProject(p.id)}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button asChild className="gap-2 shadow-sm" size="sm">
                <Link to={`/editor/${p.id}`}>
                  Abrir Editor <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {projects.length < maxProjects && (
          <>
            <Card className="border-dashed border-2 flex flex-col justify-between p-6 text-center bg-muted/10 hover:bg-muted/30 transition-colors">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Novo Projeto Branco</CardTitle>
                <CardDescription>Crie um workspace vazio.</CardDescription>
              </CardHeader>
              <CardContent className="w-full p-0 space-y-3">
                <Input
                  id="new-project-input"
                  placeholder="Nome do Projeto"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="bg-background h-11"
                />
                <Button
                  className="w-full h-11"
                  onClick={handleCreate}
                  disabled={!newProjectName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" /> Criar Projeto
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 flex flex-col justify-between p-6 text-center bg-card hover:shadow-md transition-all shadow-subtle border-primary/10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-primary" /> Template
                  Rápido
                </CardTitle>
                <CardDescription>
                  Carregue um projeto predefinido.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full p-0">
                <Button
                  variant="outline"
                  className="w-full h-11 shadow-sm"
                  onClick={handleExampleProject}
                >
                  <PlaySquare className="w-4 h-4 mr-2" /> Iniciar Demo
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {projects.length >= maxProjects && (
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center bg-primary/5 border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium mb-4">
              Limite de projetos ativos atingido no plano atual.
            </p>
            <Button asChild className="shadow-sm">
              <Link to="/billing">Fazer Upgrade para Pro</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
