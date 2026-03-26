import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import AdminOverview from '@/components/admin/AdminOverview'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminSettingsPanel from '@/components/admin/AdminSettingsPanel'
import { LayoutDashboard, Users, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthStore()

  // Strict route protection
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Gerencie a plataforma, os usuários e as regras de monetização.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 border overflow-x-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" /> Diretório de Usuários
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" /> Monetização & Pagamentos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="outline-none">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="users" className="outline-none">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="settings" className="outline-none">
          <AdminSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
