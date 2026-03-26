import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Integrations from './pages/Integrations'
import Billing from './pages/Billing'
import Analytics from './pages/Analytics'
import Avatars from './pages/Avatars'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminFinancials from './pages/admin/AdminFinancials'
import AdminSettings from './pages/admin/AdminSettings'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import useAuthStore from './stores/useAuthStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />

  // Admin routing constraints
  if (user.role === 'admin' && location.pathname === '/') {
    return <Navigate to="/admin" replace />
  }

  // Service Interruption System check (bypass for admins)
  const isAllowedRoute = ['/billing', '/profile'].includes(location.pathname)
  if (user.isBlocked && !isAllowedRoute && user.role !== 'admin') {
    return <Navigate to="/billing" replace />
  }

  return <>{children}</>
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Creator Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/financials" element={<AdminFinancials />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
