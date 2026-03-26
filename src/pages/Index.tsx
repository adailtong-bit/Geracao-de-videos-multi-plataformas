import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Video,
  Trash2,
  Edit2,
  Download,
  Loader2,
  CheckCircle2,
  Music,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Project, ProjectType } from '@/types'
import { getProjects, createProject, deleteProject } from '@/lib/storage'
import useAuthStore from '@/stores/useAuthStore'
import useAdminStore from '@/stores/useAdminStore'

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set())
  const [exportProgress, setExportProgress] = useState<Record<string, number>>(
    {},
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { user, updateUser } = useAuthStore()
  const { settings } = useAdminStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const loadProjects = () => {
      const all = getProjects()
      setProjects(all)
    }
    loadProjects()
    window.addEventListener('projects_updated', loadProjects)
    window.addEventListener('storage', loadProjects)
    return () => {
      window.removeEventListener('projects_updated', loadProjects)
      window.removeEventListener('storage', loadProjects)
    }
  }, [])

  const handleCreate = (type: ProjectType) => {
    if (
      user?.role !== 'admin' &&
      user?.plan === 'free' &&
      (user?.videosGenerated || 0) >= settings.freeVideoLimit
    ) {
      toast({
        title: 'Limite Atingido',
        description: `Você atingiu o limite de ${settings.freeVideoLimit} criações gratuitas. Faça upgrade para continuar criando.`,
        variant: 'destructive',
      })
      navigate('/billing')
      setIsCreateOpen(false)
      return
    }

    const newProject: Project = {
      id: crypto.randomUUID(),
      name:
        type === 'music'
          ? `Nova Música ${projects.length + 1}`
          : `Novo Vídeo ${projects.length + 1}`,
      projectType: type,
      videoUrl: null,
      videoDuration: 60,
      trimStart: 0,
      trimEnd: 60,
      elements: [],
      targetPlatforms: [],
      aspectRatio: '9:16',
      captions: {},
      createdAt: Date.now(),
    }
    createProject(newProject)

    updateUser({ videosGenerated: (user?.videosGenerated || 0) + 1 })
    setIsCreateOpen(false)
    navigate(`/editor/${newProject.id}`)
  }

  const handleDelete = (id: string) => {
    deleteProject(id)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)))
    }
  }

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return

    setExportingIds(new Set(selectedIds))
    const progressMap: Record<string, number> = {}
    selectedIds.forEach((id) => {
      progressMap[id] = 0
    })
    setExportProgress(progressMap)

    selectedIds.forEach((id) => {
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 15 + 5
        if (p >= 100) {
          p = 100
          clearInterval(interval)
          setTimeout(() => {
            setExportingIds((prev) => {
              const next = new Set(prev)
              next.delete(id)
              return next
            })
            toast({
              title: 'Exportação Concluída',
              description: `Projeto exportado com sucesso.`,
            })
          }, 500)
        }
        setExportProgress((prev) => ({ ...prev, [id]: p }))
      }, 500)
    })
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              O que você deseja criar?
            </DialogTitle>
            <DialogDescription>
              Selecione o tipo de projeto para iniciar a produção do seu
              conteúdo com Inteligência Artificial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 mt-2">
            <div
              className="border-2 rounded-2xl p-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex flex-col items-center text-center gap-4 group shadow-sm hover:shadow-md"
              onClick={() => handleCreate('video')}
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Produção de Vídeo
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Crie vídeos do zero usando textos, ou importe seus vídeos para
                  cortes dinâmicos com B-rolls e narração.
                </p>
              </div>
            </div>

            <div
              className="border-2 rounded-2xl p-6 cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all flex flex-col items-center text-center gap-4 group shadow-sm hover:shadow-md"
              onClick={() => handleCreate('music')}
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Composição Musical
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Gere faixas musicais, batidas de fundo ou músicas completas
                  com vocais a partir de texto (Text-to-Music).
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie e exporte seus vídeos e músicas.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-4 rounded-xl border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        {selectedIds.size > 0 && (
          <Button
            onClick={handleBatchExport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto transition-all animate-in fade-in zoom-in-95 duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportação em Lote ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border w-max transition-colors hover:bg-muted/50">
            <Checkbox
              id="select-all"
              checked={
                selectedIds.size > 0 && selectedIds.size === filtered.length
              }
              onCheckedChange={toggleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-semibold text-muted-foreground cursor-pointer"
            >
              Selecionar Todos
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const isExporting = exportingIds.has(project.id)
            const progress = exportProgress[project.id] || 0
            const isSelected = selectedIds.has(project.id)

            return (
              <Card
                key={project.id}
                className={`overflow-hidden transition-all duration-300 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'hover:border-indigo-300 hover:shadow-sm'}`}
              >
                <div
                  className="relative aspect-video bg-muted border-b flex items-center justify-center group cursor-pointer"
                  onClick={() => toggleSelect(project.id)}
                >
                  {project.projectType === 'music' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-500/10 text-purple-600/50 group-hover:bg-purple-500/20 transition-colors">
                      <Music className="w-12 h-12 mb-2 opacity-60" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">
                        Studio Musical
                      </span>
                    </div>
                  ) : project.videoUrl || project.bRolls?.[0]?.url ? (
                    <img
                      src={
                        project.bRolls?.[0]?.url ||
                        `https://img.usecurling.com/p/400/300?q=video&seed=${project.id}`
                      }
                      alt=""
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Video className="w-10 h-10 text-muted-foreground/30" />
                  )}

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />

                  <div
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(project.id)}
                      className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 shadow-sm w-5 h-5"
                    />
                  </div>

                  {project.approvalStatus === 'approved' && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-1 pointer-events-none">
                      <CheckCircle2 className="w-3 h-3" /> Aprovado
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-4 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/editor/${project.id}`)}
                    >
                      <h3
                        className="font-bold text-lg truncate hover:text-indigo-600 transition-colors"
                        title={project.name}
                      >
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        {project.projectType === 'music' ? (
                          <Music className="w-3 h-3" />
                        ) : (
                          <Video className="w-3 h-3" />
                        )}
                        {new Date(project.createdAt).toLocaleDateString(
                          'pt-BR',
                        )}{' '}
                        • {project.videoDuration}s
                      </p>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 p-3 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{' '}
                          Renderizando...
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-1.5 bg-indigo-100 dark:bg-indigo-950"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 font-semibold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                      asChild
                      disabled={isExporting}
                    >
                      <Link to={`/editor/${project.id}`}>
                        <Edit2 className="w-4 h-4 mr-2" />{' '}
                        {project.projectType === 'music'
                          ? 'Abrir Editor Musical'
                          : 'Editar Vídeo'}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={() => handleDelete(project.id)}
                      disabled={isExporting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed animate-in fade-in">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Crie seu primeiro vídeo ou música com IA para começar.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 font-bold shadow-md hover:-translate-y-0.5 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
