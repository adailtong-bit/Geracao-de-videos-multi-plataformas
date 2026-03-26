import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'

const mrrData = [
  { month: 'Jan', mrr: 4500 },
  { month: 'Fev', mrr: 5200 },
  { month: 'Mar', mrr: 6800 },
  { month: 'Abr', mrr: 8400 },
  { month: 'Mai', mrr: 10500 },
  { month: 'Jun', mrr: 12450 },
]

const churnData = [
  { month: 'Jan', novos: 120, churn: 15 },
  { month: 'Fev', novos: 150, churn: 20 },
  { month: 'Mar', novos: 200, churn: 25 },
  { month: 'Abr', novos: 250, churn: 30 },
  { month: 'Mai', novos: 300, churn: 45 },
  { month: 'Jun', novos: 350, churn: 50 },
]

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Market Performance
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Monitoramento de saúde do negócio, crescimento de base e retenção (MRR
          & Churn).
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.450</div>
            <p className="text-xs text-muted-foreground">
              +18% comparado ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos (MAU)
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.345</div>
            <p className="text-xs text-muted-foreground">+240 novos este mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              -0.4% comparado ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground">
              Contas com faturas atrasadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Crescimento do MRR (Receita Recorrente)</CardTitle>
            <CardDescription>
              Evolução da receita mensal garantida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                mrr: { label: 'MRR ($)', color: 'hsl(var(--primary))' },
              }}
              className="h-[300px] w-full"
            >
              <AreaChart
                data={mrrData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--color-mrr)"
                  fill="var(--color-mrr)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Aquisição vs Churn</CardTitle>
            <CardDescription>
              Entrada de novos assinantes vs cancelamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                novos: { label: 'Novos', color: '#10b981' },
                churn: { label: 'Churn', color: '#ef4444' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart
                data={churnData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="novos"
                  fill="var(--color-novos)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churn"
                  fill="var(--color-churn)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
