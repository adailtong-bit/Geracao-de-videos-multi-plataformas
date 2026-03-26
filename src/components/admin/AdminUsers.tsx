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
import useAuthStore from '@/stores/useAuthStore'

const mockUsers = [
  {
    id: '1',
    email: 'creator@example.com',
    date: '10/08/2023',
    plan: 'pro',
    videos: 142,
  },
  {
    id: '2',
    email: 'john.doe@gmail.com',
    date: '05/10/2023',
    plan: 'free',
    videos: 5,
  },
  {
    id: '3',
    email: 'sarah.smith@yahoo.com',
    date: '12/10/2023',
    plan: 'free',
    videos: 2,
  },
  {
    id: '4',
    email: 'agency.plus@business.com',
    date: '20/06/2023',
    plan: 'pro',
    videos: 350,
  },
]

export default function AdminUsers() {
  const { user } = useAuthStore()

  // Include current admin user in the mock list for demonstration
  const displayUsers = [
    {
      id: user?.id || 'admin',
      email: user?.email || 'admin@admin.com',
      date: new Date().toLocaleDateString('pt-BR'),
      plan: user?.plan || 'pro',
      videos: user?.videosGenerated || 0,
    },
    ...mockUsers,
  ]

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle>Diretório de Usuários</CardTitle>
        <CardDescription>
          Gerencie todos os usuários registrados na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email do Usuário</TableHead>
              <TableHead>Data de Registro</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="text-right">Vídeos Gerados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>{u.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={u.plan === 'pro' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {u.plan === 'pro' ? 'Pro' : 'Grátis'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {u.videos}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
