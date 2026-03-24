import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Film,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  Scissors,
  Video,
} from 'lucide-react'

interface Props {
  project: Project
  onNext: () => void
}

export function TimelinePanel({ project, onNext }: Props) {
  const bRolls = project.bRolls || []
  const subtitles = project.aiClips?.[0]?.subtitles || []

  const isVideoSource =
    project.cuts && project.cuts.some((c) => c.sourceStart !== undefined)

  // Pure Editing Mode: Map cuts directly to UI if source is video, ignoring B-rolls
  const segments = isVideoSource
    ? project.cuts!.map((c) => {
        const sub =
          subtitles.find((s) => s.start >= c.start && s.start < c.end) ||
          subtitles.find((s) => s.start >= c.start)
        return {
          id: c.id,
          text: sub?.text || 'Trecho de entrevista capturado',
          start: c.start,
          end: c.end,
          imageUrl: '',
          isCut: true,
        }
      })
    : subtitles.map((sub) => {
        const bRoll = bRolls.find(
          (br) => br.start <= sub.start + 0.1 && br.end >= sub.end - 0.1,
        )
        return {
          id: sub.id,
          text: sub.text,
          start: sub.start,
          end: sub.end,
          imageUrl: bRoll?.url || '',
          isCut: false,
        }
      })

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4 text-center">
        <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-semibold text-foreground">
          Nenhuma sequência visual gerada
        </p>
        <p className="text-xs mt-1 max-w-[200px] leading-relaxed">
          Crie ou importe sua história na aba anterior para ver a correlação
          visual limpa.
        </p>
      </div>
    )
  }

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {isVideoSource ? (
            <Scissors className="w-5 h-5 text-indigo-500" />
          ) : (
            <Film className="w-5 h-5 text-indigo-500" />
          )}
          {isVideoSource ? 'Cortes Multicâmera' : 'Sequência Visual'}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isVideoSource
            ? 'Modo de Edição Pura ativo: O vídeo gerado consiste 100% de segmentos da fonte original. Nenhuma mídia externa foi inserida.'
            : 'Verifique a correlação semântica entre o áudio contínuo e as imagens. Textos minimalistas são aplicados no rodapé.'}
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-500/10 p-2 rounded-md border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {isVideoSource
            ? 'Apenas cortes originais baseados no fluxo de diálogo.'
            : 'Textos removidos do centro da tela. Transições orgânicas aplicadas.'}
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((seg, idx) => (
          <div
            key={seg.id}
            className="flex gap-4 p-3 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group hover:border-indigo-500/30"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
            <div className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-muted relative border border-border/50 flex items-center justify-center">
              {seg.imageUrl ? (
                <img
                  src={seg.imageUrl}
                  alt={`Cena ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-muted-foreground/50 gap-1">
                  {seg.isCut ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                  {seg.isCut && (
                    <span className="text-[9px] font-bold">Corte Fonte</span>
                  )}
                </div>
              )}
              <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" />
                {formatTime(seg.start)}
              </div>
            </div>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  {seg.isCut ? (
                    <Scissors className="w-3 h-3" />
                  ) : (
                    <Film className="w-3 h-3" />
                  )}
                  {seg.isCut
                    ? `Corte Inteligente ${idx + 1}`
                    : `Cena Visual ${idx + 1}`}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                  {(seg.end - seg.start).toFixed(1)}s
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground text-pretty italic border-l-2 border-muted pl-2">
                Áudio capturado: "{seg.text}"
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button
          className="w-full font-bold h-12 shadow-md hover:-translate-y-0.5 transition-transform"
          onClick={onNext}
        >
          <Send className="w-4 h-4 mr-2" /> Avançar para Publicação
        </Button>
      </div>
    </div>
  )
}
