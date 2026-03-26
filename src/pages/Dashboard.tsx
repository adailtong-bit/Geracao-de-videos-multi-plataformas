import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlaySquare, TrendingUp, Users, Activity } from 'lucide-react'

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState('all')

  const topVideos = [
    {
      id: 1,
      title: 'O Mistério das Pirâmides',
      views: '2.4M',
      reach: '1.8M',
      engagement: '15.2%',
      thumbnail: 'https://img.usecurling.com/p/100/100?q=pyramid&color=orange',
    },
    {
      id: 2,
      title: '5 Curiosidades do Espaço',
      views: '1.1M',
      reach: '950K',
      engagement: '12.4%',
      thumbnail: 'https://img.usecurling.com/p/100/100?q=space&color=blue',
    },
    {
      id: 3,
      title: 'Motivação Diária #01',
      views: '850K',
      reach: '720K',
      engagement: '10.1%',
      thumbnail: 'https://img.usecurling.com/p/100/100?q=success&color=yellow',
    },
    {
      id: 4,
      title: 'Truques de Edição',
      views: '600K',
      reach: '500K',
      engagement: '9.8%',
      thumbnail: 'https://img.usecurling.com/p/100/100?q=video&color=purple',
    },
    {
      id: 5,
      title: 'História de Roma',
      views: '450K',
      reach: '400K',
      engagement: '8.5%',
      thumbnail: 'https://img.usecurling.com/p/100/100?q=rome&color=red',
    },
  ]

  const filteredVideos =
    selectedProject === 'all'
      ? topVideos
      : topVideos.filter((v) => v.id.toString() === selectedProject)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Performance Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Acompanhe suas métricas de sucesso e vídeos de maior engajamento.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 bg-muted/20 p-3 md:p-4 rounded-xl border border-border/50">
        <div className="flex-1 w-full space-y-1.5">
          <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filtrar por Projeto
          </Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="h-11 sm:h-10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {topVideos.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48 space-y-1.5">
          <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Início
          </Label>
          <Input type="date" className="h-11 sm:h-10 bg-background" />
        </div>
        <div className="w-full sm:w-48 space-y-1.5">
          <Label className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Fim
          </Label>
          <Input type="date" className="h-11 sm:h-10 bg-background" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vídeos
            </CardTitle>
            <PlaySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12 no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizações (Views)
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.4M</div>
            <p className="text-xs text-muted-foreground">+800k no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alcance Único (Reach)
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.1M</div>
            <p className="text-xs text-muted-foreground">+600k no último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engajamento Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11.2%</div>
            <p className="text-xs text-muted-foreground">+2.4% no último mês</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl">
            Top Vídeos por Engajamento
          </CardTitle>
          <CardDescription>
            Os conteúdos que mais bombaram nas suas redes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] pl-4 md:pl-2">Capa</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Visualizações</TableHead>
                  <TableHead className="text-right">Alcance (Reach)</TableHead>
                  <TableHead className="text-right pr-4 md:pr-2">
                    Engajamento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="pl-4 md:pl-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-muted border shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {video.title}
                    </TableCell>
                    <TableCell className="text-right">{video.views}</TableCell>
                    <TableCell className="text-right text-purple-600 font-medium">
                      {video.reach}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold pr-4 md:pr-2">
                      {video.engagement}
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
