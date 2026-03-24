import { Project } from '@/types'
import { cn } from '@/lib/utils'
import {
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
} from 'lucide-react'

export function PreviewCanvas({
  project,
  showSafeZones = false,
}: {
  project: Project
  showSafeZones?: boolean
}) {
  const getRatioStyle = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
      case '1:1':
        return { aspectRatio: '1/1', width: '100%', maxHeight: '100%' }
      case '4:5':
        return { aspectRatio: '4/5', height: '100%', maxWidth: '100%' }
      default:
        return { aspectRatio: '9/16', height: '100%', maxWidth: '100%' }
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      <div
        className={cn(
          'relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0',
        )}
        style={getRatioStyle()}
      >
        {project.videoUrl ? (
          <img
            src={project.videoUrl}
            alt="Video preview"
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-zinc-900/50 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2 shadow-inner border border-zinc-700/50">
              <LinkIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <span className="block text-zinc-200 font-semibold text-base sm:text-lg mb-1.5">
                Nenhuma mídia carregada
              </span>
              <span className="block text-xs sm:text-sm max-w-[250px] text-zinc-400 leading-relaxed mx-auto">
                Vá para a aba <strong>Mídia</strong> e cole o link do seu vídeo
                para puxá-lo automaticamente.
              </span>
            </div>
          </div>
        )}

        {project.elements.map((el) => (
          <div
            key={el.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out z-10"
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
          >
            {el.type === 'text' || el.type === 'caption' ? (
              <span
                className={cn(
                  'font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-nowrap text-xl sm:text-2xl md:text-3xl',
                  el.type === 'caption' &&
                    'bg-black/60 px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-black border border-white/10',
                )}
                style={{ color: el.color || '#ffffff' }}
              >
                {el.content || 'Texto'}
              </span>
            ) : (
              <div
                className="text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold text-sm sm:text-xl whitespace-nowrap shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-white/20"
                style={{ backgroundColor: el.bgColor || '#e11d48' }}
              >
                {el.content || 'Banner'}
              </div>
            )}
          </div>
        ))}

        {showSafeZones && project.videoUrl && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end text-white p-4 pb-6 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center opacity-80">
              <span className="text-sm font-bold drop-shadow">
                Following | For You
              </span>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm" />
            </div>

            <div className="flex items-end justify-between w-full opacity-90">
              <div className="space-y-3 w-2/3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 overflow-hidden">
                    <img
                      src="https://img.usecurling.com/ppl/thumbnail?seed=1"
                      alt="User"
                    />
                  </div>
                  <span className="font-bold text-sm drop-shadow">
                    @creator
                  </span>
                </div>
                <div className="h-4 w-3/4 bg-white/20 backdrop-blur-sm rounded drop-shadow" />
                <div className="h-4 w-1/2 bg-white/20 backdrop-blur-sm rounded drop-shadow" />
                <div className="flex items-center gap-2 text-xs font-semibold drop-shadow mt-1">
                  <Music className="w-3 h-3" /> Original Sound
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 pb-2">
                <div className="flex flex-col items-center gap-1">
                  <Heart className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">1.2M</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageCircle className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">10K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bookmark className="w-7 h-7 drop-shadow-md fill-white" />
                  <span className="text-[10px] font-medium">50K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Share2 className="w-7 h-7 drop-shadow-md" />
                  <span className="text-[10px] font-medium">Share</span>
                </div>
                <div className="w-9 h-9 mt-2 rounded-full bg-black/50 border-2 border-white/80 p-1 animate-[spin_4s_linear_infinite]">
                  <div className="w-full h-full rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/20 shadow-lg">
              Safe Zone Preview
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
