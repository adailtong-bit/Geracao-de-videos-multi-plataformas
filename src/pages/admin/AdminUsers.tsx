import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Ban, Unlock, Eye, Calendar, Film, DollarSign } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import useAdminStore from '@/stores/useAdminStore'
import { User } from '@/types'

const mockUsers: User[] = [
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria@example.com',
    plan: 'free',
    videosGenerated: 3,
    paymentStatus: 'paid',
    isBlocked: false,
    linkedAccounts: { instagram: '@maria_s' },
    lastActivity: 'Hoje, 14:30',
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@agency.com',
    plan: 'pro',
    videosGenerated: 145,
    paymentStatus: 'paid',
    isBlocked: false,
    linkedAccounts: { tiktok: '@joao.agency' },
    lastActivity: 'Ontem, 09:15',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@mail.com',
    plan: 'pro',
    videosGenerated: 12,
    paymentStatus: 'overdue',
    isBlocked: true,
    linkedAccounts: {},
    lastActivity: 'Há 5 dias',
  },
]

export default function AdminUsers() {
  const { user } = useAuthStore()
  const { settings } = useAdminStore()
  const [usersList, setUsersList] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const toggleSuspend = (id: string) => {
    setUsersList(
      usersList.map((u) => {
        if (u.id === id) {
          const willBlock = !u.isBlocked
          return {
            ...u,
            isBlocked: willBlock,
            paymentStatus: willBlock ? 'overdue' : 'paid',
          }
        }
        return u
      }),
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Diretório de Usuários
        </h1>
        <p className="text-muted-foreground">
          Monitoramento de engajamento, planos e controle de acesso.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Base de Clientes</CardTitle>
          <CardDescription>
            Gerencie ativamente a retenção e suporte dos seus criadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Engajamento</TableHead>
                <TableHead>Status Financeiro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.plan === 'pro' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {u.plan === 'pro' ? 'Premium' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {u.videosGenerated} vídeos
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Login: {u.lastActivity}
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.isBlocked ? (
                      <Badge variant="destructive">Bloqueado</Badge>
                    ) : u.paymentStatus === 'overdue' ? (
                      <Badge variant="destructive">Inadimplente</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-100 text-emerald-800 border-emerald-200"
                      >
                        Em dia
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedUser(u)}
                      title="Ver Detalhes"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant={u.isBlocked ? 'outline' : 'ghost'}
                      size="icon"
                      onClick={() => toggleSuspend(u.id)}
                      className={
                        u.isBlocked
                          ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          : 'text-destructive hover:bg-destructive/10'
                      }
                      title={
                        u.isBlocked ? 'Restaurar Acesso' : 'Suspender Usuário'
                      }
                    >
                      {u.isBlocked ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedUser}
        onOpenChange={(o) => !o && setSelectedUser(null)}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Perfil do Usuário</SheetTitle>
            <SheetDescription>
              Visão detalhada de uso e integrações de {selectedUser?.name}.
            </SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Plano atual:{' '}
                    <strong className="uppercase">{selectedUser.plan}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Film className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Consumo: {selectedUser.videosGenerated} vídeos gerados
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Última Atividade: {selectedUser.lastActivity}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Redes Sociais Conectadas
                </h4>
                {Object.keys(selectedUser.linkedAccounts).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(selectedUser.linkedAccounts).map(
                      ([platform, handle]) => (
                        <div
                          key={platform}
                          className="flex justify-between items-center p-2 border rounded text-sm"
                        >
                          <span className="capitalize font-medium">
                            {platform}
                          </span>
                          <span className="text-muted-foreground">
                            {handle}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma rede social vinculada.
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
