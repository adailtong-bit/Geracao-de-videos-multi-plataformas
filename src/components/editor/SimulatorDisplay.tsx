import { Project, Platform } from '@/types'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Music,
  ThumbsUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SimulatorDisplay({
  project,
  platform,
  showSafeZones,
}: {
  project: Project
  platform: Platform
  showSafeZones: boolean
}) {
  const isFb = platform === 'facebook'

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden shrink-0 transition-all shadow-2xl',
        isFb
          ? 'w-full max-w-[400px] bg-white dark:bg-zinc-950 border rounded-xl overflow-y-auto'
          : 'bg-black rounded-[2rem] border-[6px] border-zinc-900 relative',
      )}
      style={
        isFb
          ? { maxHeight: '100%' }
          : {
              aspectRatio: '9/16',
              maxHeight: '100%',
              maxWidth: '100%',
              height: '100%',
            }
      }
    >
      {isFb && (
        <div className="p-3 flex items-center gap-2 border-b dark:border-zinc-800 shrink-0">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
            <img
              src="https://img.usecurling.com/ppl/thumbnail?seed=1"
              alt="User"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Sua Página</p>
            <p className="text-xs text-muted-foreground">2 horas atrás</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {isFb && project.captions.facebook && (
        <div className="p-3 text-sm shrink-0">{project.captions.facebook}</div>
      )}

      <div
        className={cn(
          'relative bg-zinc-900 flex items-center justify-center overflow-hidden w-full',
          isFb && project.aspectRatio === '9:16' ? 'aspect-[9/16]' : '',
          isFb && project.aspectRatio === '4:5' ? 'aspect-[4/5]' : '',
          isFb && project.aspectRatio === '1:1' ? 'aspect-square' : '',
          !isFb ? 'flex-1 h-full' : '',
        )}
      >
        {project.videoUrl ? (
          <img
            src={project.videoUrl}
            alt="Video"
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="text-muted-foreground text-sm">Sem Vídeo</div>
        )}

        {project.elements.map((el) => (
          <div
            key={el.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
          >
            {el.type === 'text' || el.type === 'caption' ? (
              <span
                className={cn(
                  'font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap',
                  el.type === 'caption' &&
                    'bg-black/60 px-3 py-1 rounded-md text-lg font-black',
                )}
                style={{ color: el.color || '#ffffff' }}
              >
                {el.content}
              </span>
            ) : (
              <div
                className="text-white px-4 py-2 rounded-md font-bold text-sm whitespace-nowrap shadow-lg"
                style={{ backgroundColor: el.bgColor || '#e11d48' }}
              >
                {el.content}
              </div>
            )}
          </div>
        ))}

        {!isFb && showSafeZones && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute right-0 bottom-0 top-[40%] w-16 bg-red-500/40 border-l border-red-500/50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-red-100 -rotate-90 whitespace-nowrap">
                ZONA UI
              </span>
            </div>
            <div className="absolute left-0 right-0 bottom-0 h-32 bg-red-500/40 border-t border-red-500/50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-red-100">
                ZONA UI
              </span>
            </div>
          </div>
        )}

        {platform === 'tiktok' && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end text-white p-4">
            <div className="flex items-end justify-between">
              <div className="flex-1 pr-12 space-y-2 mb-2">
                <p className="font-semibold text-sm drop-shadow-md">@usuario</p>
                <p className="text-xs line-clamp-2 drop-shadow-md">
                  {project.captions.tiktok ||
                    'Descrição incrível do vídeo aqui #fyp'}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Music className="w-3 h-3" />
                  <span>Som original</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 pb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white overflow-hidden">
                  <img
                    src="https://img.usecurling.com/ppl/thumbnail?seed=2"
                    alt="Avatar"
                  />
                </div>
                {['1.2M', '45K', '120K', '15K'].map((count, i) => {
                  const Icons = [Heart, MessageCircle, Bookmark, Share2]
                  const Icon = Icons[i]
                  return (
                    <div
                      key={count}
                      className="flex flex-col items-center gap-1"
                    >
                      <Icon className="w-7 h-7 drop-shadow-md" />
                      <span className="text-[10px] font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {platform === 'instagram' && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end text-white p-4">
            <div className="flex items-end justify-between">
              <div className="flex-1 pr-12 space-y-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                    <img
                      src="https://img.usecurling.com/ppl/thumbnail?seed=3"
                      alt="Avatar"
                    />
                  </div>
                  <p className="font-semibold text-sm drop-shadow-md">
                    usuario
                  </p>
                  <button className="px-2 py-0.5 border border-white rounded-md text-[10px] font-semibold backdrop-blur-sm bg-white/10">
                    Seguir
                  </button>
                </div>
                <p className="text-xs line-clamp-2 drop-shadow-md">
                  {project.captions.instagram ||
                    'Legenda do instagram reels #reels'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-5 pb-2">
                {['120K', '4K', 'Share', ''].map((label, i) => {
                  const Icons = [Heart, MessageCircle, Share2, MoreHorizontal]
                  const Icon = Icons[i]
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <Icon className="w-6 h-6 drop-shadow-md" />
                      {label && (
                        <span className="text-[10px] font-medium">{label}</span>
                      )}
                    </div>
                  )
                })}
                <div className="w-7 h-7 rounded-sm bg-white/20 border-2 border-white mt-2 overflow-hidden">
                  <img
                    src="https://img.usecurling.com/p/50/50?q=music&color=gray"
                    alt="Audio"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isFb && (
        <div className="p-3 border-t dark:border-zinc-800 flex items-center justify-between text-muted-foreground px-6 shrink-0">
          {[
            { icon: ThumbsUp, label: 'Curtir' },
            { icon: MessageCircle, label: 'Comentar' },
            { icon: Share2, label: 'Compartilhar' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1 cursor-pointer hover:text-foreground"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
