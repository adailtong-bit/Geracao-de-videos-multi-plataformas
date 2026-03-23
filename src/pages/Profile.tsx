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
import { Instagram, Facebook, Share2 } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: 'Profile updated successfully' })
  }

  const toggleAccount = (platform: 'instagram' | 'tiktok' | 'facebook') => {
    const isConnected = !!user.linkedAccounts[platform]
    updateUser({
      linkedAccounts: {
        ...user.linkedAccounts,
        [platform]: isConnected
          ? undefined
          : `@${user.name.toLowerCase().replace(/\s/g, '')}`,
      },
    })
    toast({
      title: isConnected ? 'Account disconnected' : 'Account connected',
      description: `${platform} has been ${isConnected ? 'removed' : 'linked'}.`,
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and connected accounts.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={user.name}
                  onChange={(e) => updateUser({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user.email}
                  onChange={(e) => updateUser({ email: e.target.value })}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Link your social media profiles for direct publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['instagram', 'tiktok', 'facebook'] as const).map((platform) => {
              const connected = !!user.linkedAccounts[platform]
              return (
                <div
                  key={platform}
                  className="flex items-center justify-between p-4 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    {platform === 'instagram' && (
                      <Instagram className="w-5 h-5 text-pink-600" />
                    )}
                    {platform === 'facebook' && (
                      <Facebook className="w-5 h-5 text-blue-600" />
                    )}
                    {platform === 'tiktok' && <Share2 className="w-5 h-5" />}
                    <div>
                      <p className="font-medium capitalize">{platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {connected
                          ? `Connected as ${user.linkedAccounts[platform]}`
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={connected ? 'outline' : 'default'}
                    onClick={() => toggleAccount(platform)}
                  >
                    {connected ? 'Disconnect' : 'Connect Account'}
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
