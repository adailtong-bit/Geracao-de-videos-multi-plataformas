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
import {
  Ban,
  Unlock,
  Eye,
  Calendar,
  Film,
  DollarSign,
  User,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import useAdminStore from '@/stores/useAdminStore'
import type { User as UserType } from '@/types'

const mockUsers: UserType[] = [
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
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Diretório de Usuários
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Monitoramento de engajamento, planos e controle de acesso.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Base de Clientes</CardTitle>
          <CardDescription>
            Gerencie ativamente a retenção e suporte dos seus criadores.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-2">Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Status Financeiro</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-2">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="pl-4 sm:pl-2">
                      <div className="font-semibold text-sm whitespace-nowrap">
                        {u.name}
                      </div>
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
                      <div className="text-sm font-medium whitespace-nowrap">
                        {u.videosGenerated} vídeos
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
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
                          className="bg-emerald-100 text-emerald-800 border-emerald-200 whitespace-nowrap"
                        >
                          Em dia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2 whitespace-nowrap pr-4 sm:pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedUser(u)}
                        title="Ver Detalhes"
                        className="h-10 w-10 sm:h-9 sm:w-9"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant={u.isBlocked ? 'outline' : 'ghost'}
                        size="icon"
                        onClick={() => toggleSuspend(u.id)}
                        className={`h-10 w-10 sm:h-9 sm:w-9 ${
                          u.isBlocked
                            ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            : 'text-destructive hover:bg-destructive/10'
                        }`}
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
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedUser}
        onOpenChange={(o) => !o && setSelectedUser(null)}
      >
        <SheetContent className="sm:max-w-md w-[calc(100vw-2rem)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
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
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>
                    Plano atual:{' '}
                    <strong className="uppercase">{selectedUser.plan}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Film className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>
                    Consumo: {selectedUser.videosGenerated} vídeos gerados
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
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
                          className="flex justify-between items-center p-3 border rounded-lg text-sm bg-background"
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
                  <p className="text-sm text-muted-foreground italic p-3 bg-muted/10 rounded-lg border border-dashed text-center">
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
