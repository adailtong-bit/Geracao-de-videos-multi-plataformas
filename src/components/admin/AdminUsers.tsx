import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/useAuthStore'
import useAdminStore from '@/stores/useAdminStore'
import { Ban, Unlock } from 'lucide-react'

const initialMockUsers = [
  {
    id: '2',
    name: 'Test Free User',
    email: 'free@user.com',
    plan: 'free',
    videos: 3,
    paymentStatus: 'paid',
    isBlocked: false,
  },
  {
    id: '3',
    name: 'Test Paid User',
    email: 'paid@user.com',
    plan: 'pro',
    videos: 45,
    paymentStatus: 'paid',
    isBlocked: false,
  },
  {
    id: '4',
    name: 'Overdue User',
    email: 'overdue@user.com',
    plan: 'pro',
    videos: 12,
    paymentStatus: 'overdue',
    isBlocked: true,
  },
]

export default function AdminUsers() {
  const { user } = useAuthStore()
  const { settings } = useAdminStore()
  const [mockList, setMockList] = useState(initialMockUsers)

  // Include current admin user in the list for demonstration
  const displayUsers = [
    {
      id: user?.id || 'admin',
      name: user?.name || 'Platform Owner',
      email: user?.email || 'admin@admin.com',
      plan: user?.plan || 'pro',
      videos: user?.videosGenerated || 0,
      paymentStatus: user?.paymentStatus || 'paid',
      isBlocked: user?.isBlocked || false,
    },
    ...mockList,
  ]

  const toggleSuspend = (id: string) => {
    setMockList(
      mockList.map((u) => {
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
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Monitore o consumo, plano e status financeiro dos usuários da
          plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Uso (Vídeos)</TableHead>
              <TableHead>Status Financeiro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.plan === 'pro' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {u.plan === 'pro' ? 'Premium' : 'Free'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {u.plan === 'free'
                    ? `${u.videos}/${settings.freeVideoLimit}`
                    : 'Ilimitado'}
                </TableCell>
                <TableCell>
                  {u.isBlocked ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : u.paymentStatus === 'overdue' ? (
                    <Badge variant="destructive">Inadimplente</Badge>
                  ) : u.paymentStatus === 'pending' ? (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      Pendente
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-emerald-100 text-emerald-800 border-emerald-200"
                    >
                      Pago
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {u.id !== user?.id && u.id !== 'admin' && (
                    <Button
                      variant={u.isBlocked ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={() => toggleSuspend(u.id)}
                      className={
                        u.isBlocked
                          ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          : 'text-destructive hover:bg-destructive/10'
                      }
                    >
                      {u.isBlocked ? (
                        <>
                          <Unlock className="w-4 h-4 mr-2" /> Restaurar
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" /> Suspender
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
