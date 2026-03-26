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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Plus,
  FileText,
} from 'lucide-react'
import useAdminStore from '@/stores/useAdminStore'
import { useToast } from '@/hooks/use-toast'
import type { AdminTransaction } from '@/types'

const mockRevenues: AdminTransaction[] = [
  {
    id: 'r1',
    date: '2023-10-10',
    user: 'maria@example.com',
    type: 'revenue',
    description: 'Assinatura Pro Mensal',
    value: 29.0,
    status: 'paid',
  },
  {
    id: 'r2',
    date: '2023-10-12',
    user: 'joao@agency.com',
    type: 'revenue',
    description: 'Assinatura Pro Mensal',
    value: 29.0,
    status: 'paid',
  },
  {
    id: 'r3',
    date: '2023-10-14',
    user: 'ana.costa@mail.com',
    type: 'revenue',
    description: 'Crédito Avulso (5 vídeos)',
    value: 15.0,
    status: 'pending',
  },
]

export default function AdminFinancials() {
  const { settings, addCost } = useAdminStore()
  const { toast } = useToast()

  const [costDesc, setCostDesc] = useState('')
  const [costAmount, setCostAmount] = useState('')
  const [costType, setCostType] = useState<'hosting' | 'api' | 'other'>(
    'hosting',
  )
  const [isCostOpen, setIsCostOpen] = useState(false)

  const handleAddCost = () => {
    if (!costDesc || !costAmount) return
    addCost({
      date: new Date().toISOString().split('T')[0],
      description: costDesc,
      amount: Number(costAmount),
      type: costType,
    })
    setIsCostOpen(false)
    setCostDesc('')
    setCostAmount('')
    toast({
      title: 'Custo Adicionado',
      description: 'Balanço financeiro atualizado com sucesso.',
    })
  }

  const handleExport = () => {
    toast({
      title: 'Relatório Gerado',
      description: 'O relatório contábil (CSV) está sendo baixado.',
    })
  }

  const totalRevenues = mockRevenues
    .filter((r) => r.status === 'paid')
    .reduce((acc, r) => acc + r.value, 0)
  const totalCosts = settings.costs.reduce((acc, c) => acc + c.amount, 0)
  const netProfit = totalRevenues - totalCosts

  const allTransactions = [
    ...mockRevenues,
    ...settings.costs.map((c) => ({
      id: c.id,
      date: c.date,
      user: 'Skip Cloud / Fornecedor',
      type: 'cost' as const,
      description: c.description,
      value: c.amount,
      status: 'paid' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Módulo Contábil & Financeiro
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Controle central de receitas, custos operacionais e margem de lucro.
          </p>
        </div>
        <Dialog open={isCostOpen} onOpenChange={setIsCostOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="shadow-md w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Lançar Custo Infra
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Despesa Operacional</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={costDesc}
                  onChange={(e) => setCostDesc(e.target.value)}
                  placeholder="Ex: Fatura AWS"
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor ($)</Label>
                <Input
                  type="number"
                  value={costAmount}
                  onChange={(e) => setCostAmount(e.target.value)}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={costType}
                  onValueChange={(v: any) => setCostType(v)}
                >
                  <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hosting">
                      Hospedagem & Storage
                    </SelectItem>
                    <SelectItem value="api">
                      APIs de IA (OpenAI, etc)
                    </SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddCost}
                className="w-full sm:w-auto h-12 sm:h-10 font-medium"
              >
                Salvar Despesa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-sm border-emerald-500/20 bg-emerald-50/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Balanço (Lucro Líquido)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              ${netProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Receitas
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenues.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Custos Operacionais
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalCosts.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-primary">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Exportação de Relatório Contábil</CardTitle>
              <CardDescription>
                Gere relatórios formatados para sua contabilidade local.
              </CardDescription>
            </div>
            <Button
              onClick={handleExport}
              className="bg-primary text-white w-full sm:w-auto h-11 sm:h-10 shadow-sm font-medium"
            >
              <Download className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Exportar
              CSV/PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 bg-muted/10">
          <div className="space-y-1.5">
            <Label>Período Inicial</Label>
            <Input
              type="date"
              className="h-12 sm:h-10 text-base sm:text-sm bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Período Final</Label>
            <Input
              type="date"
              className="h-12 sm:h-10 text-base sm:text-sm bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Formato Regional</Label>
            <Select defaultValue="br">
              <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="br">BR (BRL / DD/MM)</SelectItem>
                <SelectItem value="us">US (USD / MM/DD)</SelectItem>
                <SelectItem value="eu">EU (EUR / DD-MM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Conta Corrente (Extrato Geral)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 sm:pl-2">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuário/Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-2">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap pl-4 sm:pl-2">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2 whitespace-nowrap min-w-[200px]">
                      {t.type === 'revenue' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                      <span className="truncate">{t.description}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {t.user}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.status === 'paid'
                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                            : 'border-amber-200 text-amber-600 bg-amber-50'
                        }
                      >
                        {t.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold whitespace-nowrap pr-4 sm:pr-2 ${t.type === 'revenue' ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {t.type === 'revenue' ? '+' : '-'}${t.value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
