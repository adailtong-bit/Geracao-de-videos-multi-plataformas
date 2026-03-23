import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const data = [
  { date: 'Mon', instagram: 4000, tiktok: 2400, facebook: 2400 },
  { date: 'Tue', instagram: 3000, tiktok: 1398, facebook: 2210 },
  { date: 'Wed', instagram: 2000, tiktok: 9800, facebook: 2290 },
  { date: 'Thu', instagram: 2780, tiktok: 3908, facebook: 2000 },
  { date: 'Fri', instagram: 1890, tiktok: 4800, facebook: 2181 },
  { date: 'Sat', instagram: 2390, tiktok: 3800, facebook: 2500 },
  { date: 'Sun', instagram: 3490, tiktok: 4300, facebook: 2100 },
]

const chartConfig = {
  instagram: { label: 'Instagram', color: 'hsl(var(--chart-1))' },
  tiktok: { label: 'TikTok', color: 'hsl(var(--chart-2))' },
  facebook: { label: 'Facebook', color: 'hsl(var(--chart-3))' },
}

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your engagement across all connected platforms.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124.5K</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Views Overview</CardTitle>
          <CardDescription>
            Daily views across connected platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted))"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="instagram"
                fill="var(--color-instagram)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tiktok"
                fill="var(--color-tiktok)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="facebook"
                fill="var(--color-facebook)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
