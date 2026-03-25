import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Video,
  Trash2,
  ExternalLink,
  PlaySquare,
  LayoutTemplate,
  Link as LinkIcon,
  Loader2,
  FileText,
  Wand2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { isValidVideoUrl } from '@/lib/utils'

const SCRIPT_TEMPLATES = [
  {
    id: 'suspense',
    name: 'História de Suspense',
    prompt:
      '[Introdução]\nA noite estava escura e a tempestade lá fora abafava qualquer som...\n\n[Gancho]\nAté que um estrondo no andar de baixo quebrou o silêncio.\n\n[Clímax]\nQuando desci as escadas, a porta da rua estava escancarada, mas não havia ninguém lá fora.\n\n[Conclusão]\nNunca mais dormi naquela casa novamente.',
  },
  {
    id: 'misterio',
    name: 'Relato de Mistério',
    prompt:
      '[Introdução]\nEncontrei um diário antigo escondido no fundo do porão da minha avó...\n\n[Gancho]\nCuriosamente, todas as páginas referentes ao ano de 1999 haviam sido arrancadas.\n\n[Clímax]\nNo final do caderno, um mapa desenhado à mão apontava exatamente para o meu quarto atual.\n\n[Conclusão]\nO verdadeiro segredo da nossa família sempre esteve debaixo da minha cama.',
  },
  {
    id: 'terror',
    name: 'Conto de Terror',
    prompt:
      '[Introdução]\nA velha casa abandonada no fim da rua sempre foi o pesadelo das crianças do bairro...\n\n[Gancho]\nNuma aposta boba, decidimos entrar. Assim que cruzamos o batente, a porta se fechou violentamente.\n\n[Clímax]\nAs luzes começaram a piscar e, no reflexo do espelho quebrado, vimos a figura de uma mulher sem rosto nos observando.\n\n[Conclusão]\nNós achávamos que estávamos sozinhos. Nós nunca estivemos.',
  },
]

export default function Index() {
  const { projects, addProject, removeProject } = useProjects()
  const { user } = useAuthStore()
  const [newProjectName, setNewProjectName] = useState('')
  const [heroUrl, setHeroUrl] = useState('')
  const [isHeroLoading, setIsHeroLoading] = useState(false)
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [isTextGenerating, setIsTextGenerating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const maxProjects = user?.plan === 'pro' ? Infinity : 3

  const handleHeroImport = () => {
    if (!heroUrl.trim()) return
    if (projects.length >= maxProjects) {
      return toast({ title: 'Upgrade Necessário', variant: 'destructive' })
    }
    if (!isValidVideoUrl(heroUrl)) {
      return toast({ title: 'Link não suportado', variant: 'destructive' })
    }

    setIsHeroLoading(true)
    setTimeout(() => {
      setIsHeroLoading(false)
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
    }, 1500)
  }

  useEffect(() => {
    if (heroUrl.trim() && isValidVideoUrl(heroUrl) && !isHeroLoading) {
      handleHeroImport()
    }
  }, [heroUrl, isHeroLoading])

  const handleTextImport = () => {
    if (!textContent.trim()) return
    if (projects.length >= maxProjects) {
      return toast({ title: 'Upgrade Necessário', variant: 'destructive' })
    }

    setIsTextGenerating(true)
    setTimeout(() => {
      setIsTextGenerating(false)
      setIsTextModalOpen(false)
      const draftId = crypto.randomUUID()
      const p = addProject(`História: ${textContent.slice(0, 15)}...`, {
        videoUrl:
          'https://img.usecurling.com/p/800/1200?q=storytelling&color=purple',
        videoDuration: 30,
        trimStart: 0,
        trimEnd: 30,
        aspectRatio: '9:16',
        activeDraftId: draftId,
        drafts: [
          {
            id: draftId,
            name: 'Geração Inicial',
            createdAt: Date.now(),
            snapshot: {
              videoUrl:
                'https://img.usecurling.com/p/800/1200?q=storytelling&color=purple',
              videoDuration: 30,
            },
          },
        ],
      })
      setTextContent('')
      toast({ title: 'Vídeo gerado com sucesso!' })
      navigate(`/editor/${p.id}`)
    }, 2000)
  }

  const handleCreate = () => {
    if (!newProjectName.trim()) return
    if (projects.length >= maxProjects) {
      return toast({ title: 'Upgrade Necessário', variant: 'destructive' })
    }
    addProject(newProjectName)
    setNewProjectName('')
    toast({ title: 'Projeto criado com sucesso!' })
  }

  const handleTemplateProject = (template: (typeof SCRIPT_TEMPLATES)[0]) => {
    if (projects.length >= maxProjects) {
      return toast({ title: 'Upgrade Necessário', variant: 'destructive' })
    }
    const p = addProject(`Novo: ${template.name}`, {
      draftPrompt: template.prompt,
      videoUrl: '',
      videoDuration: 60,
      aspectRatio: '9:16',
    })
    setIsTemplateModalOpen(false)
    toast({ title: 'Modelo carregado com sucesso!' })
    navigate(`/editor/${p.id}?tab=ai-creator`)
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-br from-card to-muted border border-border/50 rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-3 tracking-tight">
              Criar a partir de Link
            </h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              Cole o link de um vídeo do Instagram, TikTok ou YouTube e nós
              puxaremos a mídia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
              <Input
                placeholder="Cole o link do vídeo aqui..."
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHeroImport()}
                className="h-12 text-sm shadow-sm border-2 focus-visible:ring-0 focus-visible:border-primary rounded-xl flex-1"
                disabled={isHeroLoading}
              />
              <Button
                className="h-12 px-6 text-sm font-semibold shadow-md rounded-xl transition-all hover:scale-[1.02] shrink-0"
                onClick={handleHeroImport}
                disabled={isHeroLoading || !heroUrl.trim()}
              >
                {isHeroLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlaySquare className="w-4 h-4 mr-2" />
                )}
                {isHeroLoading ? 'Puxando...' : 'Importar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-bl from-card to-muted border border-border/50 rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-3 tracking-tight">
              Criar a partir de Texto
            </h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              Cole um texto, história ou versículo e a IA criará a narração e o
              vídeo.
            </p>
            <Dialog open={isTextModalOpen} onOpenChange={setIsTextModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full max-w-md mx-auto h-12 text-sm font-semibold shadow-md rounded-xl transition-all hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 text-white">
                  <Wand2 className="w-4 h-4 mr-2" /> Começar com Texto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-500" /> Criar a partir
                    de Texto
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Cole aqui o seu texto, versículo bíblico ou trecho de livro para transformar em vídeo..."
                    className="min-h-[200px] resize-none text-base p-4 focus-visible:ring-blue-500"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsTextModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleTextImport}
                    disabled={!textContent.trim() || isTextGenerating}
                    className="px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isTextGenerating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5 mr-2" />
                    )}
                    {isTextGenerating ? 'Gerando...' : 'Gerar Vídeo'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
              </CardHeader>
              <CardContent className="w-full p-0 space-y-3">
                <Input
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
                  <Plus className="w-4 h-4 mr-2" /> Criar
                </Button>
              </CardContent>
            </Card>

            <Dialog
              open={isTemplateModalOpen}
              onOpenChange={setIsTemplateModalOpen}
            >
              <DialogTrigger asChild>
                <Card className="border-2 flex flex-col justify-between p-6 text-center bg-card hover:shadow-md transition-all shadow-subtle border-primary/10 cursor-pointer group">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg flex items-center justify-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-primary" />{' '}
                      Modelos de Roteiro
                    </CardTitle>
                    <CardDescription>
                      Inicie um projeto com uma narrativa predefinida.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full p-0 pt-4 border-t">
                    <span className="text-sm text-primary font-semibold group-hover:underline">
                      Escolher Modelo &rarr;
                    </span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                    Biblioteca de Modelos de Roteiro
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {SCRIPT_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start text-left gap-2 hover:border-primary/50 transition-colors"
                      onClick={() => handleTemplateProject(template)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-base text-foreground">
                          {template.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {template.prompt}
                      </p>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
