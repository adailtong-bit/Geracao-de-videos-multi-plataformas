import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import useAdminStore from '@/stores/useAdminStore'
import { useToast } from '@/hooks/use-toast'
import { Save, KeyRound, Globe, ShieldCheck } from 'lucide-react'
import type { GatewayConfig } from '@/types'

export default function AdminSettings() {
  const { settings, updateSettings } = useAdminStore()
  const { toast } = useToast()

  const [limit, setLimit] = useState(settings.freeVideoLimit)
  const [subPrice, setSubPrice] = useState(settings.subscriptionPrice)
  const [gateways, setGateways] = useState<GatewayConfig[]>(settings.gateways)

  const handleSaveMonetization = () => {
    updateSettings({ freeVideoLimit: limit, subscriptionPrice: subPrice })
    toast({
      title: 'Regras Salvas',
      description: 'Limites e preços atualizados.',
    })
  }

  const handleSaveGateways = () => {
    updateSettings({ gateways })
    toast({
      title: 'Credenciais Salvas',
      description: 'Chaves de API registradas com sucesso no cofre.',
    })
  }

  const updateGateway = (
    provider: string,
    field: keyof GatewayConfig,
    value: any,
  ) => {
    setGateways(
      gateways.map((g) =>
        g.provider === provider ? { ...g, [field]: value } : g,
      ),
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Gateways & Configurações
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gerencie as integrações de pagamento e regras de monetização da
          plataforma.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <Card className="shadow-subtle h-max">
          <CardHeader>
            <CardTitle>Regras de Monetização</CardTitle>
            <CardDescription>
              Defina os limites freemium e valor da assinatura Pro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Limite Freemium (Vídeos/Mês)
              </Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Preço Assinatura Pro Mensal ($)
              </Label>
              <Input
                type="number"
                value={subPrice}
                onChange={(e) => setSubPrice(Number(e.target.value))}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t pt-4 p-4">
            <Button
              onClick={handleSaveMonetization}
              className="w-full h-12 sm:h-10 font-medium"
            >
              <Save className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Salvar Regras
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
            <ShieldCheck className="text-primary w-5 h-5 shrink-0" /> Cofre de
            Gateways (Pagamentos)
          </h3>

          {gateways.map((gateway) => (
            <Card
              key={gateway.provider}
              className={`shadow-sm border-l-4 ${gateway.enabled ? 'border-l-primary' : 'border-l-muted'}`}
            >
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />{' '}
                    {gateway.provider}
                  </CardTitle>
                  <Switch
                    checked={gateway.enabled}
                    onCheckedChange={(v) =>
                      updateGateway(gateway.provider, 'enabled', v)
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <KeyRound className="w-4 h-4 sm:w-3 sm:h-3" /> Public Key
                  </Label>
                  <Input
                    type="password"
                    placeholder={`pk_${gateway.env}_...`}
                    value={gateway.publicKey}
                    onChange={(e) =>
                      updateGateway(
                        gateway.provider,
                        'publicKey',
                        e.target.value,
                      )
                    }
                    disabled={!gateway.enabled}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <KeyRound className="w-4 h-4 sm:w-3 sm:h-3 text-red-400" />{' '}
                    Secret/Private Key
                  </Label>
                  <Input
                    type="password"
                    placeholder={`sk_${gateway.env}_...`}
                    value={gateway.privateKey}
                    onChange={(e) =>
                      updateGateway(
                        gateway.provider,
                        'privateKey',
                        e.target.value,
                      )
                    }
                    disabled={!gateway.enabled}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3 bg-muted/20 rounded-lg gap-3 sm:gap-0">
                  <Label className="text-sm font-semibold">
                    Modo de Ambiente
                  </Label>
                  <div className="flex items-center gap-3 sm:gap-2 text-sm bg-background/50 p-2 sm:p-0 rounded-md sm:bg-transparent">
                    <span
                      className={
                        gateway.env === 'sandbox'
                          ? 'font-bold'
                          : 'text-muted-foreground'
                      }
                    >
                      Sandbox
                    </span>
                    <Switch
                      checked={gateway.env === 'production'}
                      onCheckedChange={(v) =>
                        updateGateway(
                          gateway.provider,
                          'env',
                          v ? 'production' : 'sandbox',
                        )
                      }
                      disabled={!gateway.enabled}
                    />
                    <span
                      className={
                        gateway.env === 'production'
                          ? 'font-bold text-red-600'
                          : 'text-muted-foreground'
                      }
                    >
                      Produção
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={handleSaveGateways}
            className="w-full shadow-md h-12 sm:h-11 text-base sm:text-sm font-bold"
          >
            <Save className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Atualizar Cofre de
            Credenciais
          </Button>
        </div>
      </div>
    </div>
  )
}
