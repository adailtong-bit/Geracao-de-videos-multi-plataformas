import { Project, Asset } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import useAssetsStore from '@/stores/useAssetsStore'
import useAuthStore from '@/stores/useAuthStore'
import { Plus, FolderPlus, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  project: Project
  update: (updates: Partial<Project>) => void
}

export function AssetsPanel({ project, update }: Props) {
  const { assets, addAsset } = useAssetsStore()
  const { user } = useAuthStore()
  const isPro = user?.plan === 'pro'

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh] animate-fade-in-up pb-8">
        <div className="p-4 bg-primary/10 rounded-full mb-2">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Biblioteca Global</h3>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          Faça upgrade para o Pro para salvar e reutilizar seus banners
          personalizados e ativos da marca em todos os projetos.
        </p>
        <Button asChild className="mt-4 shadow-sm">
          <Link to="/billing">Fazer Upgrade</Link>
        </Button>
      </div>
    )
  }

  const handleAddAssetToProject = (asset: Asset) => {
    update({
      elements: [
        ...project.elements,
        {
          id: crypto.randomUUID(),
          type: asset.type,
          content: asset.content,
          bgColor: asset.bgColor,
          color: '#ffffff',
          x: 50,
          y: 80,
        },
      ],
    })
  }

  const handleCreateNewAsset = () => {
    addAsset({
      name: `Novo Banner ${assets.length + 1}`,
      type: 'banner',
      bgColor: '#10b981',
      content: 'Clique no Link da Bio',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-primary" /> Seus Ativos
        </h3>
        <Button size="sm" onClick={handleCreateNewAsset}>
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-background/50">
          <p>Nenhum ativo salvo ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer hover:border-primary transition-all hover:shadow-md overflow-hidden group"
              onClick={() => handleAddAssetToProject(asset)}
            >
              <div
                className="h-20 flex items-center justify-center p-2"
                style={{ backgroundColor: asset.bgColor }}
              >
                <span className="text-white font-bold text-center text-sm drop-shadow-sm truncate w-full">
                  {asset.content}
                </span>
              </div>
              <CardContent className="p-3 text-sm flex justify-between items-center bg-card">
                <span className="font-medium truncate">{asset.name}</span>
                <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Add +
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
