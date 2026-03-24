import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Instagram, Facebook, CheckCircle2, Music } from 'lucide-react'

export default function Integrations() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

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
      description: `${platform} has been ${isConnected ? 'removed' : 'linked'} via OAuth.`,
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts via OAuth for direct publishing.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
          <CardDescription>
            Securely link your Instagram, TikTok, and Facebook profiles to
            enable API publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['instagram', 'tiktok', 'facebook'] as const).map((platform) => {
            const connected = !!user.linkedAccounts[platform]
            return (
              <div
                key={platform}
                className="flex items-center justify-between p-5 border rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${platform === 'instagram' ? 'bg-pink-100 text-pink-600' : platform === 'facebook' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-900'}`}
                  >
                    {platform === 'instagram' && (
                      <Instagram className="w-6 h-6" />
                    )}
                    {platform === 'facebook' && (
                      <Facebook className="w-6 h-6" />
                    )}
                    {platform === 'tiktok' && <Music className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold capitalize text-base">
                      {platform}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {connected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">
                            Connected as {user.linkedAccounts[platform]}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant={connected ? 'outline' : 'default'}
                  onClick={() => toggleAccount(platform)}
                  className="w-36"
                >
                  {connected ? 'Disconnect' : 'Connect Account'}
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
