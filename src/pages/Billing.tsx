import useAuthStore from '@/stores/useAuthStore'
import useAdminStore from '@/stores/useAdminStore'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Check, Star, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Billing() {
  const { user, updateUser } = useAuthStore()
  const { settings } = useAdminStore()
  const { toast } = useToast()

  const handleUpgrade = () => {
    updateUser({ plan: 'pro', paymentStatus: 'paid', isBlocked: false })
    toast({
      title: 'Upgraded to Pro! 🚀',
      description:
        'You now have access to direct publishing, global assets, and more.',
    })
  }

  const handleRegularize = () => {
    updateUser({ isBlocked: false, paymentStatus: 'paid' })
    toast({
      title: 'Pagamento Confirmado',
      description: 'Seu acesso foi restaurado com sucesso.',
    })
  }

  const limit = settings.freeVideoLimit
  const used = user?.videosGenerated || 0
  const percent = Math.min((used / limit) * 100, 100)

  const mockTransactions = [
    {
      id: '1',
      date: '01/10/2023',
      amount: settings.subscriptionPrice,
      status: 'Pago',
      desc: 'Plano Pro - Mensal',
    },
    {
      id: '2',
      date: '01/09/2023',
      amount: settings.subscriptionPrice,
      status: 'Pago',
      desc: 'Plano Pro - Mensal',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      {user?.isBlocked && (
        <Card className="mb-6 md:mb-8 border-destructive shadow-lg bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
              <div>
                <CardTitle className="text-destructive text-lg md:text-xl">
                  Acesso Restrito - Pagamento Pendente
                </CardTitle>
                <CardDescription className="text-destructive/80 font-medium mt-1">
                  Sua conta foi suspensa temporariamente devido a pendências
                  financeiras.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 text-destructive/90">
              Para restaurar seu acesso e continuar criando vídeos, por favor,
              regularize sua situação.
            </p>
            <Button
              variant="destructive"
              onClick={handleRegularize}
              className="shadow-md w-full sm:w-auto h-12 sm:h-10"
            >
              Pagar Agora e Desbloquear
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Planos & Assinaturas
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gerencie seu plano, faturas e acompanhe o uso da sua conta.
        </p>
      </div>

      <Card className="mb-6 md:mb-8 border-l-4 border-l-primary shadow-subtle">
        <CardHeader>
          <CardTitle>Uso & Limites de Criação</CardTitle>
          <CardDescription>
            Acompanhe o consumo da sua conta freemium.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <span>Vídeos Gerados</span>
            <span>
              {used} / {user?.plan === 'pro' ? 'Ilimitado' : limit}
            </span>
          </div>
          <Progress
            value={user?.plan === 'pro' ? 100 : percent}
            className="h-3"
          />
          {user?.plan === 'free' && used >= limit && (
            <p className="text-sm text-destructive font-semibold mt-2 bg-destructive/10 p-3 rounded-md">
              Atenção: Você atingiu seu limite gratuito de vídeos. Assine o
              plano Pro para continuar criando sem restrições.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mt-6 md:mt-8">
        <Card
          className={`relative ${user?.plan === 'free' ? 'border-primary shadow-md' : ''}`}
        >
          <CardHeader>
            <CardTitle>Criador Básico</CardTitle>
            <CardDescription>Recursos essenciais para iniciar.</CardDescription>
            <div className="text-4xl font-bold mt-4">
              $0
              <span className="text-lg text-muted-foreground font-normal">
                /mês
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {[
                `Até ${limit} vídeos por mês`,
                'Edição básica de vídeo',
                'Exportação e download',
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0" />{' '}
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={user?.plan === 'free' ? 'secondary' : 'outline'}
              className="w-full h-12 sm:h-11 font-medium"
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Plano Atual' : 'Fazer Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        <Card
          className={`relative border-primary shadow-elevation ${
            user?.plan === 'pro' ? 'ring-2 ring-primary' : ''
          }`}
        >
          {user?.plan === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3" /> Plano Ativo
            </div>
          )}
          <CardHeader>
            <CardTitle>Criador Pro</CardTitle>
            <CardDescription>
              Recursos avançados para escalar seu alcance.
            </CardDescription>
            <div className="text-4xl font-bold mt-4">
              ${settings.subscriptionPrice}
              <span className="text-lg text-muted-foreground font-normal">
                /mês
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {[
                'Projetos e vídeos ilimitados',
                'Publicação direta via API',
                'Biblioteca de recursos global',
                'Legendas automáticas com IA',
                'Suporte prioritário',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" />{' '}
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {user?.plan === 'pro' ? (
              <Button
                className="w-full h-12 sm:h-11 font-medium"
                variant="outline"
              >
                Gerenciar Assinatura
              </Button>
            ) : (
              <Button
                className="w-full h-12 sm:h-11 font-medium"
                onClick={handleUpgrade}
              >
                Fazer Upgrade para Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-8 md:mt-12 shadow-subtle">
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Visualize suas faturas e transações anteriores.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.desc}</TableCell>
                  <TableCell>${t.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700"
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {mockTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
