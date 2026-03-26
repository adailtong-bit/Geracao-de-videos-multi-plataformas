import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Video } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const { user, login } = useAuthStore()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, name || 'Creator')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-elevation animate-fade-in-up border-0 sm:border">
        <CardHeader className="text-center space-y-2 p-6 sm:p-6">
          <div className="flex justify-center mb-2 sm:mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Video className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-2xl">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your details to sign in'
              : 'Start managing your videos today'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 p-6 pt-0 sm:p-6 sm:pt-0">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            {/* Helper buttons for quick testing of User Stories */}
            <div className="mt-8 pt-6 border-t space-y-4">
              <p className="text-xs text-center text-muted-foreground font-semibold uppercase tracking-wider">
                Fast Login (Sample Data)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEmail('admin@admin.com')
                    setName('Platform Owner')
                  }}
                  className="text-xs sm:text-xs h-10 sm:h-9"
                >
                  Admin Owner
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEmail('free@user.com')
                    setName('Test Free User')
                  }}
                  className="text-xs sm:text-xs h-10 sm:h-9"
                >
                  Free User
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEmail('paid@user.com')
                    setName('Test Paid User')
                  }}
                  className="text-xs sm:text-xs h-10 sm:h-9"
                >
                  Paid User
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEmail('overdue@user.com')
                    setName('Overdue User')
                  }}
                  className="text-xs sm:text-xs h-10 sm:h-9 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delinquent
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 pt-0 sm:p-6 sm:pt-0">
            <Button
              type="submit"
              className="w-full h-12 sm:h-11 text-base font-medium shadow-md"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
