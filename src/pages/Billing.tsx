import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Check, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Billing() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  const handleUpgrade = () => {
    updateUser({ plan: 'pro' })
    toast({
      title: 'Upgraded to Pro! 🚀',
      description:
        'You now have access to direct publishing, global assets, and more.',
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and unlock premium features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mt-8">
        <Card
          className={`relative ${user?.plan === 'free' ? 'border-primary shadow-md' : ''}`}
        >
          <CardHeader>
            <CardTitle>Creator Basic</CardTitle>
            <CardDescription>
              Essential features for starting creators.
            </CardDescription>
            <div className="text-4xl font-bold mt-4">
              $0
              <span className="text-lg text-muted-foreground font-normal">
                /mo
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {[
                'Manage up to 3 projects',
                'Basic video editing',
                'Export and download',
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0" />{' '}
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={user?.plan === 'free' ? 'secondary' : 'outline'}
              className="w-full"
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        <Card
          className={`relative border-primary shadow-elevation ${user?.plan === 'pro' ? 'ring-2 ring-primary' : ''}`}
        >
          {user?.plan === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3" /> Active Plan
            </div>
          )}
          <CardHeader>
            <CardTitle>Creator Pro</CardTitle>
            <CardDescription>
              Advanced features to scale your reach.
            </CardDescription>
            <div className="text-4xl font-bold mt-4">
              $29
              <span className="text-lg text-muted-foreground font-normal">
                /mo
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {[
                'Unlimited active projects',
                'Direct API publishing to all platforms',
                'Global resource library (Banners/CTAs)',
                'AI-Powered Auto-Captions',
                'Priority support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" /> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {user?.plan === 'pro' ? (
              <Button className="w-full" variant="outline">
                Manage Subscription
              </Button>
            ) : (
              <Button className="w-full" onClick={handleUpgrade}>
                Upgrade to Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
