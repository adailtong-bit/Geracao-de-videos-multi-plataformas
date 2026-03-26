import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import useAdminStore from '@/stores/useAdminStore'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export default function AdminSettingsPanel() {
  const { settings, updateSettings } = useAdminStore()
  const { toast } = useToast()

  const [limit, setLimit] = useState(settings.freeVideoLimit)
  const [price, setPrice] = useState(settings.pricePerVideo)
  const [subPrice, setSubPrice] = useState(settings.subscriptionPrice)
  const [stripe, setStripe] = useState(settings.paymentMethods.stripe)
  const [paypal, setPaypal] = useState(settings.paymentMethods.paypal)
  const [pix, setPix] = useState(settings.paymentMethods.pix)

  const handleSave = () => {
    updateSettings({
      freeVideoLimit: limit,
      pricePerVideo: price,
      subscriptionPrice: subPrice,
      paymentMethods: { stripe, paypal, pix },
    })
    toast({
      title: 'Configurações Salvas',
      description: 'As regras de monetização foram atualizadas com sucesso.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regras de Monetização</CardTitle>
          <CardDescription>
            Defina os limites gratuitos e preços da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label>Limite de Vídeos Grátis (Freemium)</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço por Vídeo Avulso ($)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Assinatura Mensal ($)</Label>
              <Input
                type="number"
                value={subPrice}
                onChange={(e) => setSubPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gateways de Pagamento</CardTitle>
          <CardDescription>
            Ative ou desative os métodos de pagamento disponíveis para os
            usuários.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stripe (Cartão de Crédito)</Label>
              <p className="text-xs text-muted-foreground">
                Processamento principal via cartões.
              </p>
            </div>
            <Switch checked={stripe} onCheckedChange={setStripe} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>PayPal</Label>
              <p className="text-xs text-muted-foreground">
                Pagamentos internacionais via saldo.
              </p>
            </div>
            <Switch checked={paypal} onCheckedChange={setPaypal} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pix (Brasil)</Label>
              <p className="text-xs text-muted-foreground">
                Pagamento instantâneo via QR Code.
              </p>
            </div>
            <Switch checked={pix} onCheckedChange={setPix} />
          </div>
          <div className="pt-4 border-t">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" /> Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
