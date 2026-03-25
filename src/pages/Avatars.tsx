import { useState } from 'react'
import {
  Plus,
  User,
  Play,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useAvatarStore from '@/stores/useAvatarStore'
import { useToast } from '@/hooks/use-toast'
import { AvatarModel } from '@/types'
import { cn } from '@/lib/utils'

export default function Avatars() {
  const { avatars, addAvatar, updateAvatar, removeAvatar } = useAvatarStore()
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newImage, setNewImage] = useState('')

  const [previewAvatar, setPreviewAvatar] = useState<AvatarModel | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const [editAvatar, setEditAvatar] = useState<AvatarModel | null>(null)
  const [editName, setEditName] = useState('')

  const presets = avatars.filter((a) => a.type === 'preset')
  const customs = avatars.filter((a) => a.type === 'custom')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = () => setNewImage(reader.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleCreate = () => {
    if (!newName || !newImage) return
    const created = addAvatar({
      name: newName,
      imageUrl: newImage,
      status: 'processing',
    })
    setIsCreateOpen(false)
    setNewName('')
    setNewImage('')

    setTimeout(() => {
      updateAvatar(created.id, { status: 'ready' })
      toast({
        title: 'Avatar Concluído',
        description: `O clone "${newName}" está pronto para uso em seus vídeos.`,
      })
    }, 4000)
  }

  const handlePreviewPlay = () => {
    setIsPreviewPlaying(true)
    setTimeout(() => setIsPreviewPlaying(false), 3000)
  }

  const saveEdit = () => {
    if (editAvatar && editName) {
      updateAvatar(editAvatar.id, { name: editName })
      setEditAvatar(null)
      toast({ title: 'Nome atualizado' })
    }
  }

  const AvatarGrid = ({
    items,
    title,
    emptyMessage,
  }: {
    items: AvatarModel[]
    title: string
    emptyMessage: string
  }) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold tracking-tight border-b pb-2">
        {title}
      </h3>
      {items.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          <Info className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((avatar) => (
            <Card
              key={avatar.id}
              className="overflow-hidden shadow-subtle hover:shadow-elevation transition-all group flex flex-col"
            >
              <div className="aspect-square bg-muted relative border-b overflow-hidden">
                <img
                  src={avatar.imageUrl}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                    avatar.status === 'processing' && 'opacity-50 grayscale',
                  )}
                  alt={avatar.name}
                />
                {avatar.status === 'processing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Mapeando Rosto...
                    </span>
                  </div>
                )}
                {avatar.status === 'ready' && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 rounded-full shadow-sm"
                      onClick={() => setPreviewAvatar(avatar)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between flex-1">
                <div className="min-w-0 pr-2">
                  <h4
                    className="font-semibold text-sm truncate"
                    title={avatar.name}
                  >
                    {avatar.name}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[10px] uppercase font-bold tracking-wider"
                  >
                    {avatar.type === 'preset' ? 'Modelo IA' : 'Meu Clone'}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setPreviewAvatar(avatar)}
                      disabled={avatar.status !== 'ready'}
                    >
                      <Play className="w-4 h-4 mr-2" /> Visualizar
                    </DropdownMenuItem>
                    {avatar.type === 'custom' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditAvatar(avatar)
                            setEditName(avatar.name)
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" /> Editar Nome
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => removeAvatar(avatar.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> Meus Avatares
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus clones digitais e modelos de IA para aplicar em seus
            vídeos.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-11 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Criar Novo Avatar
        </Button>
      </div>

      <div className="space-y-12">
        <AvatarGrid
          items={customs}
          title="Meus Clones (Uploads)"
          emptyMessage="Você ainda não criou nenhum clone personalizado."
        />
        <AvatarGrid
          items={presets}
          title="Modelos de IA (Predefinidos)"
          emptyMessage="Nenhum modelo IA disponível."
        />
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewAvatar}
        onOpenChange={(o) => !o && setPreviewAvatar(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visualizar Avatar</DialogTitle>
            <DialogDescription>
              Teste de lip-sync e estabilidade do clone digital.
            </DialogDescription>
          </DialogHeader>
          {previewAvatar && (
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <style>{`
                @keyframes avatar-talking-preview {
                  0%, 100% { transform: scale(1) rotate(0deg); }
                  25% { transform: scale(1.02) rotate(-1deg); }
                  50% { transform: scale(1.04) rotate(1deg); }
                  75% { transform: scale(1.02) rotate(-0.5deg); }
                }
                .animate-avatar-talking-preview {
                  animation: avatar-talking-preview 2s ease-in-out infinite;
                }
              `}</style>
              <div
                className={cn(
                  'w-48 h-48 rounded-full overflow-hidden border-[4px] border-primary/20 shadow-2xl transition-all duration-300 bg-muted',
                  isPreviewPlaying &&
                    'animate-avatar-talking-preview border-primary shadow-primary/30',
                )}
              >
                <img
                  src={previewAvatar.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>
              <Button
                onClick={handlePreviewPlay}
                disabled={isPreviewPlaying}
                className="w-full h-11 text-base font-bold shadow-md"
              >
                {isPreviewPlaying ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {isPreviewPlaying
                  ? 'Testando Animação e Lip-Sync...'
                  : 'Testar Animação'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Avatar Digital</DialogTitle>
            <DialogDescription>
              Faça o upload de uma foto frontal com boa iluminação para criar
              seu clone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Avatar</Label>
              <Input
                placeholder="Ex: Eu (Formal)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto Frontal (JPG/PNG)</Label>
              {newImage ? (
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-muted">
                  <img
                    src={newImage}
                    className="w-full h-full object-cover"
                    alt="Upload preview"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full"
                    onClick={() => setNewImage('')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                  <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    Selecionar Imagem
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFile}
                  />
                </Label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName || !newImage}>
              Criar Clone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog
        open={!!editAvatar}
        onOpenChange={(o) => !o && setEditAvatar(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Nome</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Novo Nome</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditAvatar(null)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={!editName}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
