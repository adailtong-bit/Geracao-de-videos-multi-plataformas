import { Project } from '@/types'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Music,
  Wand2,
  Play,
  Pause,
  Square,
  Loader2,
  Download,
  Save,
  Video,
  Sliders,
  Layers,
  FileAudio,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function MusicEditor({
  project,
  update,
}: {
  project: Project
  update: (p: Partial<Project>) => void
}) {
  const { toast } = useToast()

  // Sidebar & Form State
  const [activeTab, setActiveTab] = useState('create')
  const [prompt, setPrompt] = useState(project.musicPrompt || '')
  const [lyrics, setLyrics] = useState(project.draftPrompt || '')
  const [genre, setGenre] = useState(project.musicGenre || 'pop')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)

  // Transport & Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)

  // Audio Engine State
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [isBuffering, setIsBuffering] = useState(true)
  const [audioErrorMsg, setAudioErrorMsg] = useState<string>('')
  const [retryKey, setRetryKey] = useState(0)

  const [bgError, setBgError] = useState(false)
  const [vocalError, setVocalError] = useState(false)
  const bgErrorRef = useRef(false)
  const vocalErrorRef = useRef(false)

  // Mixer State
  const [masterVol, setMasterVol] = useState(100)
  const [bgVol, setBgVol] = useState(80)
  const [vocalVol, setVocalVol] = useState(100)
  const [bgMuted, setBgMuted] = useState(false)
  const [vocalMuted, setVocalMuted] = useState(false)

  // Audio Elements Refs
  const bgAudioRef = useRef<HTMLAudioElement>(null)
  const vocalAudioRef = useRef<HTMLAudioElement>(null)
  const readyFlags = useRef({ bg: false, voc: false })

  // Web Audio API Refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const masterAnalyserRef = useRef<AnalyserNode | null>(null)
  const bgSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const bgGainRef = useRef<GainNode | null>(null)
  const bgAnalyserRef = useRef<AnalyserNode | null>(null)
  const vocalSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const vocalGainRef = useRef<GainNode | null>(null)
  const vocalAnalyserRef = useRef<AnalyserNode | null>(null)

  // VU Meter DOM Refs
  const masterVuRef = useRef<HTMLDivElement>(null)
  const bgVuRef = useRef<HTMLDivElement>(null)
  const vocalVuRef = useRef<HTMLDivElement>(null)

  const primaryUrl =
    project.audioTrack?.url ||
    'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg'
  const vocalUrl =
    'https://actions.google.com/sounds/v1/human_voices/human_singing_choir.ogg'

  const [waveform] = useState(() =>
    Array.from({ length: 80 }, (_, i) => {
      const base = 15
      const variance = 60 * Math.abs(Math.sin(i * 0.15) * Math.cos(i * 0.05))
      return Math.min(100, Math.max(5, base + variance + Math.random() * 20))
    }),
  )

  const tracks = [
    {
      id: 'trk-bg',
      name: 'Cinematic Ambient (Background)',
      type: 'background',
      duration: 120,
    },
    {
      id: 'trk-voc',
      name: 'Choir Harmony (Vocals)',
      type: 'vocals',
      duration: 120,
    },
  ]

  const initAudioEngine = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioContextClass()

        masterGainRef.current = audioCtxRef.current.createGain()
        masterAnalyserRef.current = audioCtxRef.current.createAnalyser()
        masterAnalyserRef.current.fftSize = 256
        masterGainRef.current.connect(masterAnalyserRef.current)
        masterAnalyserRef.current.connect(audioCtxRef.current.destination)

        if (bgAudioRef.current) {
          bgSourceRef.current = audioCtxRef.current.createMediaElementSource(
            bgAudioRef.current,
          )
          bgGainRef.current = audioCtxRef.current.createGain()
          bgAnalyserRef.current = audioCtxRef.current.createAnalyser()
          bgAnalyserRef.current.fftSize = 256
          bgSourceRef.current.connect(bgGainRef.current)
          bgGainRef.current.connect(bgAnalyserRef.current)
          bgAnalyserRef.current.connect(masterGainRef.current)
        }

        if (vocalAudioRef.current) {
          vocalSourceRef.current = audioCtxRef.current.createMediaElementSource(
            vocalAudioRef.current,
          )
          vocalGainRef.current = audioCtxRef.current.createGain()
          vocalAnalyserRef.current = audioCtxRef.current.createAnalyser()
          vocalAnalyserRef.current.fftSize = 256
          vocalSourceRef.current.connect(vocalGainRef.current)
          vocalGainRef.current.connect(vocalAnalyserRef.current)
          vocalAnalyserRef.current.connect(masterGainRef.current)
        }

        if (masterGainRef.current)
          masterGainRef.current.gain.value = masterVol / 100
        if (bgGainRef.current)
          bgGainRef.current.gain.value = bgMuted ? 0 : bgVol / 100
        if (vocalGainRef.current)
          vocalGainRef.current.gain.value = vocalMuted ? 0 : vocalVol / 100
      }
    } catch (err) {
      console.error('Audio engine init failed:', err)
      setAudioStatus('error')
      setAudioErrorMsg(
        'Falha ao inicializar o motor de áudio. Verifique as permissões do navegador.',
      )
    }
  }, [bgMuted, bgVol, masterVol, vocalMuted, vocalVol])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error)
      }
    }
  }, [])

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenProgress(0)
    let p = 0
    const int = setInterval(() => {
      p += 10
      setGenProgress(p)
      if (p >= 100) {
        clearInterval(int)
        update({
          musicPrompt: prompt,
          draftPrompt: lyrics,
          musicGenre: genre,
          audioTrack: {
            id: crypto.randomUUID(),
            name: prompt
              ? `Faixa IA: ${prompt.slice(0, 15)}...`
              : 'Música Original',
            mood: 'custom',
            url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
            adaptiveLeveling: false,
          },
        })
        setIsGenerating(false)
        setActiveTab('mixer')
        toast({ title: 'Composição Finalizada com Sucesso!' })
      }
    }, 300)
  }

  const togglePlay = async () => {
    if (audioStatus === 'error' || audioStatus === 'loading') return

    if (!audioCtxRef.current) {
      initAudioEngine()
    }

    if (!audioCtxRef.current) {
      setIsPlaying(false)
      return
    }

    if (isPlaying) {
      if (!bgError) bgAudioRef.current?.pause()
      if (!vocalError) vocalAudioRef.current?.pause()
      setIsPlaying(false)
    } else {
      if (currentTime >= duration) {
        handleSeek(0)
      }

      setIsBuffering(true)
      try {
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume()
        }

        const promises = []
        if (!bgError && bgAudioRef.current) {
          promises.push(
            bgAudioRef.current.play().catch((e) => {
              console.warn('BG Err', e)
              throw e
            }),
          )
        }
        if (!vocalError && vocalAudioRef.current) {
          promises.push(
            vocalAudioRef.current.play().catch((e) => {
              console.warn('Voc Err', e)
              throw e
            }),
          )
        }
        await Promise.all(promises)

        if (audioCtxRef.current.state !== 'running') {
          throw new Error('AudioContext failed to transition to running state')
        }

        setIsPlaying(true)
      } catch (err: any) {
        console.error(
          'Playback failed:',
          err instanceof Error ? err.message : 'Unknown error',
        )
        setIsPlaying(false)
        toast({
          title: 'Erro de Reprodução',
          description:
            'Não foi possível iniciar o áudio. O navegador pode ter bloqueado.',
          variant: 'destructive',
        })
      } finally {
        setIsBuffering(false)
      }
    }
  }

  const handleStop = () => {
    if (!bgError) bgAudioRef.current?.pause()
    if (!vocalError) vocalAudioRef.current?.pause()
    if (bgAudioRef.current && !bgError) bgAudioRef.current.currentTime = 0
    if (vocalAudioRef.current && !vocalError)
      vocalAudioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (value: number) => {
    const clampedValue = Math.max(0, Math.min(value, duration))
    setCurrentTime(clampedValue)
    if (bgAudioRef.current && !bgError)
      bgAudioRef.current.currentTime = clampedValue
    if (vocalAudioRef.current && !vocalError)
      vocalAudioRef.current.currentTime = clampedValue
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioStatus === 'error') return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    )
    handleSeek(percent * duration)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(duration)
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const d = e.currentTarget.duration
    if (d && d !== Infinity && !isNaN(d)) {
      setDuration((prev) => Math.max(prev, d))
    }
  }

  const handleRetry = () => {
    setAudioStatus('loading')
    setIsBuffering(true)
    setAudioErrorMsg('')
    setRetryKey((prev) => prev + 1)
  }

  useEffect(() => {
    const bg = bgAudioRef.current
    const voc = vocalAudioRef.current
    if (!bg || !voc) return

    setAudioStatus('loading')
    setIsBuffering(true)

    setBgError(false)
    setVocalError(false)
    bgErrorRef.current = false
    vocalErrorRef.current = false
    readyFlags.current = { bg: false, voc: false }

    const checkReady = () => {
      if (readyFlags.current.bg && readyFlags.current.voc) {
        if (bgErrorRef.current && vocalErrorRef.current) {
          setAudioStatus('error')
          setAudioErrorMsg(
            'Ambas as faixas falharam ao carregar. Verifique sua conexão e os formatos de áudio.',
          )
        } else {
          setAudioStatus('ready')
        }
        setIsBuffering(false)
      }
    }

    const handlers = {
      bg: {
        canplaythrough: () => {
          readyFlags.current.bg = true
          checkReady()
        },
        waiting: () => {
          if (!bgErrorRef.current) setIsBuffering(true)
        },
        playing: () => setIsBuffering(false),
        error: (e: Event) => {
          const audioEl = e.target as HTMLAudioElement
          const isFormatError =
            audioEl?.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          console.warn(
            'BG Track Error:',
            audioEl?.error?.message,
            'Code:',
            audioEl?.error?.code,
          )

          bgErrorRef.current = true
          setBgError(true)
          toast({
            title: isFormatError ? 'Formato Incompatível' : 'Erro de Mídia',
            description:
              'A faixa principal não pôde ser carregada. Tentando continuar o projeto.',
            variant: 'destructive',
          })
          readyFlags.current.bg = true
          checkReady()
        },
      },
      voc: {
        canplaythrough: () => {
          readyFlags.current.voc = true
          checkReady()
        },
        waiting: () => {
          if (!vocalErrorRef.current) setIsBuffering(true)
        },
        playing: () => setIsBuffering(false),
        error: (e: Event) => {
          const audioEl = e.target as HTMLAudioElement
          const isFormatError =
            audioEl?.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          console.warn(
            'Vocal Track Error:',
            audioEl?.error?.message,
            'Code:',
            audioEl?.error?.code,
          )

          vocalErrorRef.current = true
          setVocalError(true)
          toast({
            title: isFormatError ? 'Formato de Voz Inválido' : 'Erro na Voz',
            description:
              'A faixa vocal encontrou um problema e foi silenciada para evitar falhas no sistema.',
            variant: 'destructive',
          })
          readyFlags.current.voc = true
          checkReady()
        },
      },
    }

    bg.addEventListener('canplaythrough', handlers.bg.canplaythrough)
    bg.addEventListener('waiting', handlers.bg.waiting)
    bg.addEventListener('playing', handlers.bg.playing)
    bg.addEventListener('error', handlers.bg.error)

    voc.addEventListener('canplaythrough', handlers.voc.canplaythrough)
    voc.addEventListener('waiting', handlers.voc.waiting)
    voc.addEventListener('playing', handlers.voc.playing)
    voc.addEventListener('error', handlers.voc.error)

    bg.load()
    voc.load()

    return () => {
      bg.removeEventListener('canplaythrough', handlers.bg.canplaythrough)
      bg.removeEventListener('waiting', handlers.bg.waiting)
      bg.removeEventListener('playing', handlers.bg.playing)
      bg.removeEventListener('error', handlers.bg.error)

      voc.removeEventListener('canplaythrough', handlers.voc.canplaythrough)
      voc.removeEventListener('waiting', handlers.voc.waiting)
      voc.removeEventListener('playing', handlers.voc.playing)
      voc.removeEventListener('error', handlers.voc.error)
    }
  }, [primaryUrl, vocalUrl, retryKey])

  useEffect(() => {
    if (masterGainRef.current)
      masterGainRef.current.gain.value = masterVol / 100
    if (bgGainRef.current)
      bgGainRef.current.gain.value = bgMuted ? 0 : bgVol / 100
    if (vocalGainRef.current)
      vocalGainRef.current.gain.value = vocalMuted ? 0 : vocalVol / 100

    if (bgAudioRef.current) bgAudioRef.current.volume = 1
    if (vocalAudioRef.current) vocalAudioRef.current.volume = 1
  }, [masterVol, bgVol, vocalVol, bgMuted, vocalMuted, bgError, vocalError])

  useEffect(() => {
    let frameId: number
    const dataArray = new Uint8Array(256)

    const getRms = (analyser: AnalyserNode) => {
      analyser.getByteTimeDomainData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128
        sum += val * val
      }
      return Math.sqrt(sum / dataArray.length)
    }

    const updatePlayhead = () => {
      let mainTime = 0
      if (!bgError && bgAudioRef.current) {
        mainTime = bgAudioRef.current.currentTime
      } else if (!vocalError && vocalAudioRef.current) {
        mainTime = vocalAudioRef.current.currentTime
      }

      setCurrentTime(mainTime)

      if (
        !vocalError &&
        vocalAudioRef.current &&
        !bgError &&
        bgAudioRef.current
      ) {
        const vocTime = vocalAudioRef.current.currentTime
        if (isPlaying && Math.abs(mainTime - vocTime) > 0.1) {
          vocalAudioRef.current.currentTime = mainTime
        }
      }

      if (isPlaying && audioCtxRef.current?.state === 'running') {
        if (masterAnalyserRef.current && masterVuRef.current) {
          masterVuRef.current.style.width = `${Math.min(100, getRms(masterAnalyserRef.current) * 300)}%`
        }
        if (bgAnalyserRef.current && bgVuRef.current) {
          bgVuRef.current.style.width = `${Math.min(100, getRms(bgAnalyserRef.current) * 300)}%`
        }
        if (vocalAnalyserRef.current && vocalVuRef.current) {
          vocalVuRef.current.style.width = `${Math.min(100, getRms(vocalAnalyserRef.current) * 300)}%`
        }
      } else {
        if (masterVuRef.current) masterVuRef.current.style.width = '0%'
        if (bgVuRef.current) bgVuRef.current.style.width = '0%'
        if (vocalVuRef.current) vocalVuRef.current.style.width = '0%'
      }

      if (isPlaying) {
        frameId = requestAnimationFrame(updatePlayhead)
      }
    }

    if (isPlaying) {
      frameId = requestAnimationFrame(updatePlayhead)
    } else {
      if (!bgError && bgAudioRef.current) {
        setCurrentTime(bgAudioRef.current.currentTime)
      } else if (!vocalError && vocalAudioRef.current) {
        setCurrentTime(vocalAudioRef.current.currentTime)
      }
      if (masterVuRef.current) masterVuRef.current.style.width = '0%'
      if (bgVuRef.current) bgVuRef.current.style.width = '0%'
      if (vocalVuRef.current) vocalVuRef.current.style.width = '0%'
    }

    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, bgError, vocalError])

  useEffect(() => {
    return () => {
      if (bgAudioRef.current) bgAudioRef.current.pause()
      if (vocalAudioRef.current) vocalAudioRef.current.pause()
    }
  }, [])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      <audio
        ref={bgAudioRef}
        src={primaryUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
        crossOrigin="anonymous"
      />
      <audio
        ref={vocalAudioRef}
        src={vocalUrl}
        onLoadedMetadata={handleLoadedMetadata}
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-secondary"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">Voltar aos Projetos</span>
            </Link>
          </Button>
          <div className="flex flex-col border-l pl-4 justify-center">
            <h1 className="font-semibold text-sm leading-tight max-w-[200px] truncate">
              {project.name}
            </h1>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
              <Music className="w-3 h-3" /> Studio Musical
            </span>
          </div>

          <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-lg ml-4">
            <Button
              variant={project.projectType !== 'music' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => update({ projectType: 'video' })}
              className="h-7 text-xs font-semibold px-3"
            >
              <Video className="w-3.5 h-3.5 mr-1.5" /> Vídeo
            </Button>
            <Button
              variant={project.projectType === 'music' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => update({ projectType: 'music' })}
              className="h-7 text-xs font-semibold px-3"
            >
              <Music className="w-3.5 h-3.5 mr-1.5" /> Música
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: 'Projeto Salvo' })}
          >
            <Save className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Salvar</span>
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Exportar MP3</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar */}
        <div className="w-[400px] border-r flex flex-col bg-card z-10 shadow-sm overflow-hidden shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 shrink-0 rounded-none border-b h-14 bg-muted/20 p-0">
              <TabsTrigger
                value="create"
                className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-purple-500 font-semibold"
              >
                <Wand2 className="w-4 h-4 mr-2 text-purple-500" /> Criar
              </TabsTrigger>
              <TabsTrigger
                value="mixer"
                className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 font-semibold"
              >
                <Sliders className="w-4 h-4 mr-2 text-indigo-500" /> Mixer
              </TabsTrigger>
              <TabsTrigger
                value="tracks"
                className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 font-semibold"
              >
                <Layers className="w-4 h-4 mr-2 text-emerald-500" /> Ativos
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="create" className="m-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                      Motor de Composição
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Descreva o que você quer ouvir e a IA fará a produção.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-semibold text-sm">
                      Gênero Musical
                    </Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="bg-background h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop Comercial</SelectItem>
                        <SelectItem value="rock">Rock / Indie</SelectItem>
                        <SelectItem value="hiphop">Hip Hop / Rap</SelectItem>
                        <SelectItem value="eletronic">
                          Eletrônica / EDM
                        </SelectItem>
                        <SelectItem value="lofi">Lo-Fi / Chill</SelectItem>
                        <SelectItem value="acoustic">
                          Acústico / Folk
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-semibold text-sm">
                      Estilo (Prompt)
                    </Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="resize-none h-24 bg-background text-sm shadow-inner"
                      placeholder="Ex: Synthwave relaxante com batida lo-fi e melodia nostálgica..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-sm">
                        Letra da Música
                      </Label>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 uppercase tracking-wider text-[10px]"
                      >
                        Vocais IA
                      </Badge>
                    </div>
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      className="resize-none h-48 bg-background text-sm shadow-inner"
                      placeholder="Deixe em branco para instrumental, ou digite os versos..."
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md font-bold transition-all hover:-translate-y-0.5"
                    onClick={handleGenerate}
                    disabled={isGenerating || (!prompt && !lyrics)}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />{' '}
                        Gerando {genProgress}%
                      </>
                    ) : (
                      <>
                        <Music className="w-5 h-5 mr-2" /> Gerar Música
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="mixer" className="m-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Console de Mixagem
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ajuste o volume e monitore as camadas de áudio do seu
                      projeto.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Master Volume */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="font-bold flex items-center gap-2">
                          <Sliders className="w-4 h-4" /> Master Output
                        </Label>
                        <span className="text-xs font-mono font-bold">
                          {masterVol}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[masterVol]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => setMasterVol(v)}
                          className="py-1"
                        />
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden flex">
                          <div
                            ref={masterVuRef}
                            className="h-full bg-indigo-500 w-0 transition-[width] duration-75 ease-out"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vocal Volume */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="font-semibold flex items-center gap-2">
                          <Mic2 className="w-4 h-4 text-pink-500" /> Melodia /
                          Vocais
                          {vocalError && (
                            <AlertCircle
                              className="w-4 h-4 text-destructive"
                              title="Faixa Indisponível (Erro de Formato)"
                            />
                          )}
                        </Label>
                        <Button
                          variant={
                            vocalMuted || vocalError ? 'destructive' : 'outline'
                          }
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setVocalMuted(!vocalMuted)}
                          disabled={vocalError}
                        >
                          {vocalMuted || vocalError ? (
                            <VolumeX className="w-3 h-3 mr-1" />
                          ) : (
                            <Volume2 className="w-3 h-3 mr-1" />
                          )}
                          {vocalError ? 'Erro' : vocalMuted ? 'Muted' : 'Mute'}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[vocalVol]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => setVocalVol(v)}
                          disabled={vocalMuted || vocalError}
                          className={cn(
                            'py-1',
                            (vocalMuted || vocalError) &&
                              'opacity-50 grayscale',
                          )}
                        />
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                          <div
                            ref={vocalVuRef}
                            className={cn(
                              'h-full bg-pink-500 w-0 transition-[width] duration-75 ease-out',
                              (vocalMuted || vocalError) &&
                                'bg-muted-foreground opacity-30',
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Background Volume */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="font-semibold flex items-center gap-2">
                          <ListMusic className="w-4 h-4 text-emerald-500" />{' '}
                          Instrumental
                          {bgError && (
                            <AlertCircle
                              className="w-4 h-4 text-destructive"
                              title="Faixa Indisponível"
                            />
                          )}
                        </Label>
                        <Button
                          variant={
                            bgMuted || bgError ? 'destructive' : 'outline'
                          }
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setBgMuted(!bgMuted)}
                          disabled={bgError}
                        >
                          {bgMuted || bgError ? (
                            <VolumeX className="w-3 h-3 mr-1" />
                          ) : (
                            <Volume2 className="w-3 h-3 mr-1" />
                          )}
                          {bgError ? 'Erro' : bgMuted ? 'Muted' : 'Mute'}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[bgVol]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => setBgVol(v)}
                          disabled={bgMuted || bgError}
                          className={cn(
                            'py-1',
                            (bgMuted || bgError) && 'opacity-50 grayscale',
                          )}
                        />
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                          <div
                            ref={bgVuRef}
                            className={cn(
                              'h-full bg-emerald-500 w-0 transition-[width] duration-75 ease-out',
                              (bgMuted || bgError) &&
                                'bg-muted-foreground opacity-30',
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tracks" className="m-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      Background Parts
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gerencie as faixas e stems que compõem sua música.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center p-3 border rounded-xl bg-card shadow-sm hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mr-3">
                          <FileAudio className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {track.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 uppercase"
                            >
                              {track.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatTime(track.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-dashed border-2 font-semibold bg-transparent"
                  >
                    + Importar Nova Faixa
                  </Button>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Main Stage */}
        <div className="flex-1 flex flex-col bg-zinc-950 relative min-w-0">
          <div className="flex-1 flex flex-col items-center justify-center relative p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            {audioStatus === 'error' && (
              <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Erro na Reprodução
                </h3>
                <p className="text-zinc-400 mb-6 max-w-md leading-relaxed">
                  {audioErrorMsg}
                </p>
                <Button
                  onClick={handleRetry}
                  className="bg-white text-black hover:bg-zinc-200 shadow-xl px-8 h-12"
                >
                  <RefreshCw className="w-5 h-5 mr-2" /> Tentar Novamente
                </Button>
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-zinc-900/50 border border-white/5 shadow-2xl backdrop-blur-md mb-4 ring-1 ring-white/10 relative">
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-50" />
                  )}
                  {audioStatus === 'loading' ? (
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                  ) : (
                    <Music className="w-12 h-12 text-indigo-400 relative z-10" />
                  )}
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  {project.audioTrack?.name || 'Música do Projeto'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  {audioStatus === 'loading'
                    ? 'Carregando recursos de áudio...'
                    : prompt || 'Estúdio de Composição e Mixagem'}
                </p>
              </div>

              <div
                className={cn(
                  'w-full h-32 flex items-center justify-between gap-[2px] sm:gap-1 px-4 group relative transition-opacity',
                  audioStatus === 'error'
                    ? 'opacity-30 cursor-not-allowed'
                    : 'cursor-pointer',
                  audioStatus === 'loading' && 'opacity-50',
                )}
                onClick={handleWaveformClick}
              >
                {waveform.map((val, i) => {
                  const barPercent = i / waveform.length
                  const playPercent = currentTime / duration
                  const isPlayed = barPercent <= playPercent

                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-full transition-all duration-100',
                        isPlayed && audioStatus !== 'loading'
                          ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                          : 'bg-zinc-800',
                        audioStatus !== 'error' && 'group-hover:bg-zinc-700',
                      )}
                      style={{ height: `${val}%` }}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="h-32 bg-zinc-900 border-t border-white/10 shrink-0 flex flex-col px-6 py-4 z-20">
            <div className="flex items-center gap-4 w-full max-w-5xl mx-auto mb-4 group">
              <span className="text-sm font-mono font-medium text-zinc-300 min-w-[120px] text-right tabular-nums">
                {formatTime(currentTime)}{' '}
                <span className="text-zinc-500 mx-1">/</span>{' '}
                {formatTime(duration)}
              </span>
              <div className="flex-1 relative flex items-center">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={([v]) => handleSeek(v)}
                  disabled={audioStatus === 'error'}
                  className="cursor-pointer py-2 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Button
                size="icon"
                variant="outline"
                className="w-12 h-12 rounded-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white transition-colors disabled:opacity-50"
                onClick={handleStop}
                disabled={audioStatus === 'error' || audioStatus === 'loading'}
                title="Stop"
              >
                <Square className="w-5 h-5 fill-current" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  'w-16 h-16 rounded-full bg-white text-black shadow-xl transition-all',
                  audioStatus === 'loading' || isBuffering
                    ? 'opacity-80 scale-95 pointer-events-none'
                    : 'hover:bg-zinc-200 hover:scale-105 active:scale-95',
                )}
                onClick={togglePlay}
                disabled={
                  audioStatus === 'error' ||
                  audioStatus === 'loading' ||
                  isBuffering
                }
              >
                {audioStatus === 'loading' || isBuffering ? (
                  <Loader2 className="w-7 h-7 text-zinc-800 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 ml-1.5 fill-current" />
                )}
              </Button>
              <div className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
