import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  User,
  LogOut,
  Video,
  Link as LinkIcon,
  Home,
  UserCircle,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'

function AppSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()

  const adminLinks = [
    { name: 'Dashboard BI', path: '/admin', icon: LayoutDashboard },
    { name: 'Diretório de Usuários', path: '/admin/users', icon: Users },
    {
      name: 'Contábil & Financeiro',
      path: '/admin/financials',
      icon: DollarSign,
    },
    { name: 'Gateways & Config', path: '/admin/settings', icon: Settings },
  ]

  const userLinks = [
    { name: 'Meus Projetos', path: '/', icon: Home },
    { name: 'Avatar Studio', path: '/avatars', icon: UserCircle },
    { name: 'Performance', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Integrações', path: '/integrations', icon: LinkIcon },
    { name: 'Plano & Faturamento', path: '/billing', icon: CreditCard },
    { name: 'Perfil', path: '/profile', icon: User },
  ]

  const links = user?.role === 'admin' ? adminLinks : userLinks

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-sidebar-border">
        <Video className="w-6 h-6 text-primary mr-2 shrink-0" />
        <span className="font-bold text-lg truncate">
          MultiProject{' '}
          {user?.role === 'admin' && (
            <span className="text-[10px] text-primary ml-1 uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          )}
        </span>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <SidebarMenuItem key={link.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={link.name}
                  className={cn(
                    'h-11 md:h-10 transition-all font-medium text-base md:text-sm',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Link
                    to={link.path}
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="mb-4 px-2 overflow-hidden">
          <p className="text-sm font-bold truncate text-sidebar-foreground">
            {user?.name}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {user?.email}
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setOpenMobile(false)
                logout()
              }}
              className="w-full h-11 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors font-medium text-base md:text-sm"
            >
              <LogOut className="w-5 h-5 md:w-4 md:h-4 mr-2 shrink-0" />
              Sair da Conta
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function Layout() {
  const location = useLocation()

  if (location.pathname.startsWith('/editor')) {
    return (
      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/20 min-h-screen w-full flex flex-col">
        {/* Mobile Header with safe area support */}
        <header className="flex min-h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden sticky top-0 z-40 shadow-sm pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] box-content">
          <SidebarTrigger className="-ml-2" />
          <div className="font-bold flex items-center ml-1 text-foreground">
            <Video className="w-5 h-5 text-primary mr-2" />
            MultiProject
          </div>
        </header>

        <main className="flex-1 w-full overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
