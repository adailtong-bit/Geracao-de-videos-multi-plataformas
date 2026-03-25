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
  Wand2,
  Upload,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { cn, CHECKERBOARD_BG } from '@/lib/utils'

export default function Avatars() {
  const { avatars, addAvatar, updateAvatar, removeAvatar } = useAvatarStore()
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createTab, setCreateTab] = useState('upload')
  const [newName, setNewName] = useState('')
  const [newImage, setNewImage] = useState('')
  const [prompt, setPrompt] = useState('')

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

  const simulateProcessing = (avatarId: string, name: string) => {
    setTimeout(() => {
      updateAvatar(avatarId, { status: 'training_motion' })
      setTimeout(() => {
        updateAvatar(avatarId, { status: 'ready' })
        toast({
          title: 'Persona Digital Pronta',
          description: `"${name}" teve o corpo reconstruído (Inpainting) e o fundo extraído (Alpha Perfect) com sucesso, sem formatos de retrato.`,
        })
      }, 3000)
    }, 2500)
  }

  const handleCreateUpload = () => {
    if (!newName || !newImage) return
    const created = addAvatar({
      name: newName,
      imageUrl: newImage,
      status: 'processing_bg',
    })
    setIsCreateOpen(false)
    setNewName('')
    setNewImage('')
    simulateProcessing(created.id, newName)
  }

  const handleCreateGenerate = () => {
    if (!newName || !prompt) return
    const generatedUrl = `https://img.usecurling.com/p/512/512?q=portrait,${encodeURIComponent(prompt.split(' ')[0] || 'person')}&dpr=2&seed=${Date.now()}`
    const created = addAvatar({
      name: newName,
      imageUrl: generatedUrl,
      status: 'processing_bg',
    })
    setIsCreateOpen(false)
    setNewName('')
    setPrompt('')
    simulateProcessing(created.id, newName)
  }

  const handlePreviewPlay = () => {
    setIsPreviewPlaying(true)
    setTimeout(() => setIsPreviewPlaying(false), 4000)
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((avatar) => {
            const isProcessing =
              avatar.status === 'processing_bg' ||
              avatar.status === 'training_motion'
            return (
              <Card
                key={avatar.id}
                className="overflow-hidden shadow-subtle hover:shadow-elevation transition-all group flex flex-col"
              >
                <div
                  className="aspect-[4/5] bg-muted relative border-b overflow-hidden flex items-center justify-center p-4"
                  style={{ backgroundImage: CHECKERBOARD_BG }}
                >
                  <img
                    src={avatar.imageUrl}
                    className={cn(
                      'w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-xl',
                      isProcessing && 'opacity-50 grayscale',
                    )}
                    alt={avatar.name}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-md z-10 p-4 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse leading-relaxed">
                        {avatar.status === 'processing_bg'
                          ? 'Segmentação Alpha &\nInpainting Anatômico...'
                          : 'Rigging de Movimento\nLip-Sync Fonético...'}
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
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> Minhas Personas
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Gerencie seus clones digitais independentes. Nossa IA reconstrói
            ombros e braços ausentes (Inpainting), extrai o fundo perfeitamente
            livre de bordas, e aplica um motor de movimento de corpo inteiro
            para gesticulação natural.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-11 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Persona
        </Button>
      </div>

      <div className="space-y-12">
        <AvatarGrid
          items={customs}
          title="Meus Clones (Uploads & Gerados)"
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
            <DialogTitle>Visualizar Persona Digital</DialogTitle>
            <DialogDescription>
              Teste a integridade anatômica (tronco e ombros reconstruídos) e o
              motor neural de lip-sync com gestos de mãos.
            </DialogDescription>
          </DialogHeader>
          {previewAvatar && (
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <style>{`
                @keyframes neural-idle {
                  0%, 100% { transform: scale(1) rotate(0deg) translateY(0) perspective(500px) rotateY(0deg) rotateX(0deg); }
                  50% { transform: scale(1) rotate(0.2deg) translateY(-2px) perspective(500px) rotateY(2deg) rotateX(1deg); }
                }
                @keyframes neural-talking {
                  0%, 100% { transform: scale(1) rotate(0deg) translateY(0) skewX(0deg) perspective(500px) rotateY(0deg) rotateX(0deg); }
                  15% { transform: scale(1.005) rotate(0.5deg) translateY(-3px) skewX(0.5deg) perspective(500px) rotateY(3deg) rotateX(1.5deg); }
                  30% { transform: scale(1.01) rotate(-0.5deg) translateY(-1px) skewX(-0.5deg) perspective(500px) rotateY(-1deg) rotateX(-0.5deg); }
                  45% { transform: scale(1.015) rotate(1.5deg) translateY(-4px) skewX(1deg) perspective(500px) rotateY(4deg) rotateX(2deg); }
                  60% { transform: scale(0.995) rotate(-0.5deg) translateY(1px) skewX(-0.5deg) perspective(500px) rotateY(-2deg) rotateX(-1deg); }
                  75% { transform: scale(1.02) rotate(1deg) translateY(-5px) skewX(1.5deg) perspective(500px) rotateY(5deg) rotateX(2.5deg); }
                  90% { transform: scale(1.005) rotate(-1deg) translateY(0px) skewX(-1deg) perspective(500px) rotateY(-1deg) rotateX(0.5deg); }
                }
                .animate-neural-idle { animation: neural-idle 5s ease-in-out infinite; transform-origin: 50% 100%; }
                .animate-neural-talking { animation: neural-talking 3s ease-in-out infinite; transform-origin: 50% 100%; }
              `}</style>
              <div
                className={cn(
                  'w-64 h-80 rounded-xl overflow-hidden shadow-2xl transition-all relative border border-border bg-muted p-4',
                  isPreviewPlaying
                    ? 'animate-neural-talking ring-4 ring-primary/30'
                    : 'animate-neural-idle',
                )}
                style={{
                  backgroundImage: CHECKERBOARD_BG,
                }}
              >
                <img
                  src={previewAvatar.imageUrl}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  alt="Preview"
                />
                {isPreviewPlaying && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-[9px] px-3 py-1.5 rounded-t-lg backdrop-blur-md font-bold uppercase whitespace-nowrap shadow-xl border-t border-x border-blue-400/50 flex items-center gap-1.5">
                    <div className="flex items-end gap-0.5 h-2">
                      <div
                        className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate]"
                        style={{ height: '100%' }}
                      />
                      <div
                        className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate_0.2s]"
                        style={{ height: '60%' }}
                      />
                      <div
                        className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate_0.4s]"
                        style={{ height: '80%' }}
                      />
                    </div>
                    Lip-Sync Fonético & Gestos
                  </div>
                )}
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
                  ? 'Sintetizando Movimento...'
                  : 'Testar Motor Neural'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Persona Digital</DialogTitle>
            <DialogDescription>
              A IA reconstrói a anatomia (Inpainting de ombros e braços ausentes
              em fotos de busto) para garantir integridade anatômica e remover
              qualquer formato de moldura ou retângulo.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={createTab}
            onValueChange={setCreateTab}
            className="w-full pt-4"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="font-semibold text-xs">
                <Upload className="w-4 h-4 mr-2" /> Fazer Upload
              </TabsTrigger>
              <TabsTrigger value="generate" className="font-semibold text-xs">
                <Wand2 className="w-4 h-4 mr-2" /> Gerar por Descrição
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
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
                  <div className="relative w-32 h-40 mx-auto rounded-xl overflow-hidden border-4 border-muted bg-muted/50 p-2">
                    <img
                      src={newImage}
                      className="w-full h-full object-contain drop-shadow-md"
                      alt="Upload preview"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full"
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
                <p className="text-[10px] text-muted-foreground">
                  Dica: A IA tratará a imagem como base livre, reconstituindo
                  membros faltantes para permitir movimentos fluidos na edição.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleCreateUpload}
                disabled={!newName || !newImage}
              >
                Reconstruir Corpo e Extrair Alfa
              </Button>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Avatar</Label>
                <Input
                  placeholder="Ex: Personagem 3D, Ilustração, Realista..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição da Persona (Prompt)</Label>
                <Textarea
                  placeholder="Ex: Mulher realista de terno profissional, personagem 3D estilo cartoon, ilustrador minimalista..."
                  className="resize-none h-24"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  A IA gerará a silhueta completa livre de molduras e aplicará
                  uma camada alfa nativa.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleCreateGenerate}
                disabled={!newName || !prompt}
              >
                Gerar Avatar e Animar
              </Button>
            </TabsContent>
          </Tabs>
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
