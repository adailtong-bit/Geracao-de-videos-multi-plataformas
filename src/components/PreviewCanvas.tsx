import { Project } from '@/types'
import { cn } from '@/lib/utils'

export function PreviewCanvas({ project }: { project: Project }) {
  const getRatioStyle = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return { aspectRatio: '9/16', height: '100%' }
      case '1:1':
        return { aspectRatio: '1/1', width: '100%' }
      case '4:5':
        return { aspectRatio: '4/5', height: '100%' }
      default:
        return { aspectRatio: '9/16', height: '100%' }
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 min-h-0 min-w-0">
      <div
        className={cn(
          'relative bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ring-1 ring-white/10 shrink-0',
        )}
        style={{
          ...getRatioStyle(),
          maxHeight: '100%',
          maxWidth: '100%',
        }}
      >
        {project.videoUrl ? (
          <img
            src={project.videoUrl}
            alt="Video preview"
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white/5">
            <span className="text-white/80 font-medium">
              Nenhum vídeo importado
            </span>
            <span className="text-xs mt-2 text-white/50">
              Vá para o painel de Mídia para começar
            </span>
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

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none opacity-60 z-0 flex items-end justify-center pb-4">
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold drop-shadow-sm">
            Zona Segura
          </span>
        </div>
      </div>
    </div>
  )
}
