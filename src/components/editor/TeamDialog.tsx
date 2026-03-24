import { useState } from 'react'
import { Project, TeamMember } from '@/types'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Users, UserPlus, Trash2, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TeamDialog({
  project,
  update,
}: {
  project: Project
  update: (updates: Partial<Project>) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer')
  const { toast } = useToast()

  const members: TeamMember[] = project.teamMembers || [
    {
      id: '1',
      email: 'owner@empresa.com',
      role: 'editor',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=9',
    },
  ]

  const handleInvite = () => {
    if (!email) return
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email,
      role,
      avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${email.length * 10}`,
    }
    update({ teamMembers: [...members, newMember] })
    setEmail('')
    toast({
      title: 'Convite enviado!',
      description: `${email} foi convidado como ${role === 'editor' ? 'Editor' : 'Visualizador'}.`,
    })
  }

  const handleRemove = (id: string) => {
    if (id === '1') return
    update({ teamMembers: members.filter((m) => m.id !== id) })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex bg-background font-medium hover:bg-muted"
        >
          <Users className="w-4 h-4 mr-2 text-primary" /> Equipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" /> Colaboração
          </DialogTitle>
          <DialogDescription>
            Compartilhe seu projeto com a equipe e defina as permissões de
            acesso para cada membro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 items-end mt-4">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Convidar via Email
            </Label>
            <Input
              placeholder="nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50"
            />
          </div>
          <div className="w-[130px] space-y-1.5">
            <Label className="text-xs text-muted-foreground">Permissão</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizar</SelectItem>
                <SelectItem value="editor">Editar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="icon"
            onClick={handleInvite}
            disabled={!email}
            className="w-10 h-10 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Membros com Acesso ({members.length})
          </h4>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {m.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {m.role === 'editor' && (
                        <Shield className="w-3 h-3 text-indigo-500" />
                      )}
                      {m.role === 'editor' ? 'Editor Geral' : 'Visualizador'}
                    </p>
                  </div>
                </div>
                {m.id !== '1' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive w-8 h-8"
                    onClick={() => handleRemove(m.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
