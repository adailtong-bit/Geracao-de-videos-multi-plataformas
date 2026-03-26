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
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: 'Profile updated successfully' })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Manage your personal information.
        </p>
      </div>

      <Card className="max-w-2xl shadow-subtle">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input
                value={user.name}
                onChange={(e) => updateUser({ name: e.target.value })}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input
                value={user.email}
                onChange={(e) => updateUser({ email: e.target.value })}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 sm:h-10 font-medium"
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
