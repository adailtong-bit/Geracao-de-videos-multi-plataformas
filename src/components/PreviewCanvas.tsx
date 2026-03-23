import { Project } from '@/types'
import { cn } from '@/lib/utils'

export function PreviewCanvas({ project }: { project: Project }) {
  const ratioClass = {
    '9:16': 'aspect-[9/16] w-full max-w-[320px]',
    '1:1': 'aspect-square w-full max-w-[420px]',
    '4:5': 'aspect-[4/5] w-full max-w-[380px]',
  }[project.aspectRatio]

  return (
    <div
      className={cn(
        'relative bg-black rounded-lg shadow-elevation overflow-hidden flex items-center justify-center transition-all duration-500',
        ratioClass,
      )}
    >
      {project.videoUrl ? (
        <img
          src={project.videoUrl}
          alt="Video preview"
          className="w-full h-full object-cover opacity-80"
        />
      ) : (
        <div className="text-muted-foreground text-sm flex flex-col items-center p-8 text-center bg-white/5 border border-white/10 rounded-xl">
          <span>No video imported</span>
          <span className="text-xs mt-2 opacity-70">
            Go to Media panel to start
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
                'font-bold text-3xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-nowrap',
                el.type === 'caption' &&
                  'bg-black/60 px-4 py-1.5 rounded-lg text-[22px] font-black border border-white/10',
              )}
              style={{ color: el.color || '#ffffff' }}
            >
              {el.content || 'Add Text'}
            </span>
          ) : (
            <div
              className="text-white px-6 py-3 rounded-lg font-bold text-xl whitespace-nowrap shadow-[0_8px_16px_rgba(0,0,0,0.5)] border border-white/20"
              style={{ backgroundColor: el.bgColor || '#e11d48' }}
            >
              {el.content || 'Banner'}
            </div>
          )}
        </div>
      ))}

      {/* Safe zone overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-50 z-0" />
    </div>
  )
}
