import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  User,
  LogOut,
  Video,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { logout } = useAuthStore()
  const location = useLocation()

  // Don't show sidebar in editor
  if (location.pathname.startsWith('/editor')) {
    return (
      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>
    )
  }

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 bg-background border-r flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b">
          <Video className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">MultiProject</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
