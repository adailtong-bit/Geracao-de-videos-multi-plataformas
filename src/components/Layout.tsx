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

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  if (location.pathname.startsWith('/editor')) {
    return (
      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>
    )
  }

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
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col shrink-0 sticky top-0 h-screen shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <Video className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">
            MultiProject{' '}
            {user?.role === 'admin' && (
              <span className="text-xs text-primary ml-1 uppercase tracking-wider">
                Admin
              </span>
            )}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t bg-muted/10">
          <div className="mb-4 px-3">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
