import { Project } from '@/types'
import { useState, useRef, useEffect } from 'react'
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

  // Sidebar & Form State (Persistent across tab switches)
  const [activeTab, setActiveTab] = useState('create')
  const [prompt, setPrompt] = useState(project.musicPrompt || '')
  const [lyrics, setLyrics] = useState(project.draftPrompt || '')
  const [genre, setGenre] = useState(project.musicGenre || 'pop')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)

  // Transport & Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120) // Default mock duration

  // Mixer State
  const [masterVol, setMasterVol] = useState(100)
  const [bgVol, setBgVol] = useState(80)
  const [vocalVol, setVocalVol] = useState(100)
  const [bgMuted, setBgMuted] = useState(false)
  const [vocalMuted, setVocalMuted] = useState(false)

  // Audio Elements Refs
  const bgAudioRef = useRef<HTMLAudioElement>(null)
  const vocalAudioRef = useRef<HTMLAudioElement>(null)

  // Generate a realistic looking static waveform for interaction
  const [waveform] = useState(() =>
    Array.from({ length: 80 }, (_, i) => {
      const base = 15
      const variance = 60 * Math.abs(Math.sin(i * 0.15) * Math.cos(i * 0.05))
      return Math.min(100, Math.max(5, base + variance + Math.random() * 20))
    }),
  )

  // Example / Placeholder Tracks
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

  // Mock Generation
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

  // Audio Sync & Controls
  const togglePlay = () => {
    if (isPlaying) {
      bgAudioRef.current?.pause()
      vocalAudioRef.current?.pause()
      setIsPlaying(false)
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0)
        if (bgAudioRef.current) bgAudioRef.current.currentTime = 0
        if (vocalAudioRef.current) vocalAudioRef.current.currentTime = 0
      }
      bgAudioRef.current?.play().catch(() => {})
      vocalAudioRef.current?.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    bgAudioRef.current?.pause()
    vocalAudioRef.current?.pause()
    if (bgAudioRef.current) bgAudioRef.current.currentTime = 0
    if (vocalAudioRef.current) vocalAudioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (value: number) => {
    const clampedValue = Math.max(0, Math.min(value, duration))
    setCurrentTime(clampedValue)
    if (bgAudioRef.current) bgAudioRef.current.currentTime = clampedValue
    if (vocalAudioRef.current) vocalAudioRef.current.currentTime = clampedValue
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
      setDuration(d)
    }
  }

  // Sync Volume Levels
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgMuted
        ? 0
        : (bgVol / 100) * (masterVol / 100)
    }
    if (vocalAudioRef.current) {
      vocalAudioRef.current.volume = vocalMuted
        ? 0
        : (vocalVol / 100) * (masterVol / 100)
    }
  }, [masterVol, bgVol, vocalVol, bgMuted, vocalMuted])

  // Track Time Update via RequestAnimationFrame for smooth UI
  useEffect(() => {
    let frameId: number
    const updatePlayhead = () => {
      if (bgAudioRef.current) {
        setCurrentTime(bgAudioRef.current.currentTime)
      }
      if (isPlaying) {
        frameId = requestAnimationFrame(updatePlayhead)
      }
    }

    if (isPlaying) {
      frameId = requestAnimationFrame(updatePlayhead)
    } else {
      // Sync one last time when paused
      if (bgAudioRef.current) {
        setCurrentTime(bgAudioRef.current.currentTime)
      }
    }

    return () => cancelAnimationFrame(frameId)
  }, [isPlaying])

  // Clean up audio on unmount to prevent memory leaks or stray playing audio
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
      {/* Hidden Audio Elements for Playback Mock */}
      <audio
        ref={bgAudioRef}
        src="https://actions.google.com/sounds/v1/water/rain_on_roof.ogg"
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />
      <audio
        ref={vocalAudioRef}
        src="https://actions.google.com/sounds/v1/human_voices/human_singing_choir.ogg"
        preload="auto"
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
                {/* Tab: Criar (Create) */}
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

                {/* Tab: Mixer */}
                <TabsContent value="mixer" className="m-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Console de Mixagem
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ajuste o volume das camadas de áudio do seu projeto.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Master Channel */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold flex items-center gap-2">
                          <Sliders className="w-4 h-4" /> Master
                        </Label>
                        <span className="text-xs font-mono font-bold">
                          {masterVol}%
                        </span>
                      </div>
                      <Slider
                        value={[masterVol]}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setMasterVol(v)}
                        className="py-2"
                      />
                    </div>

                    {/* Vocals Channel */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold flex items-center gap-2">
                          <Mic2 className="w-4 h-4 text-pink-500" /> Melodia /
                          Vocais
                        </Label>
                        <Button
                          variant={vocalMuted ? 'destructive' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setVocalMuted(!vocalMuted)}
                        >
                          {vocalMuted ? (
                            <VolumeX className="w-3 h-3 mr-1" />
                          ) : (
                            <Volume2 className="w-3 h-3 mr-1" />
                          )}
                          {vocalMuted ? 'Muted' : 'Mute'}
                        </Button>
                      </div>
                      <Slider
                        value={[vocalVol]}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setVocalVol(v)}
                        disabled={vocalMuted}
                        className={cn(
                          'py-2',
                          vocalMuted && 'opacity-50 grayscale',
                        )}
                      />
                    </div>

                    {/* Background Channel */}
                    <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold flex items-center gap-2">
                          <ListMusic className="w-4 h-4 text-emerald-500" />{' '}
                          Background
                        </Label>
                        <Button
                          variant={bgMuted ? 'destructive' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setBgMuted(!bgMuted)}
                        >
                          {bgMuted ? (
                            <VolumeX className="w-3 h-3 mr-1" />
                          ) : (
                            <Volume2 className="w-3 h-3 mr-1" />
                          )}
                          {bgMuted ? 'Muted' : 'Mute'}
                        </Button>
                      </div>
                      <Slider
                        value={[bgVol]}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setBgVol(v)}
                        disabled={bgMuted}
                        className={cn(
                          'py-2',
                          bgMuted && 'opacity-50 grayscale',
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Ativos (Tracks/Stems) */}
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

        {/* Main Stage (Right Side) */}
        <div className="flex-1 flex flex-col bg-zinc-950 relative min-w-0">
          {/* Main Visualizer Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl space-y-12">
              {/* Central Track Info */}
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-zinc-900/50 border border-white/5 shadow-2xl backdrop-blur-md mb-4 ring-1 ring-white/10 relative">
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-50" />
                  )}
                  <Music className="w-12 h-12 text-indigo-400 relative z-10" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  {project.audioTrack?.name || 'Música do Projeto'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  {prompt || 'Estúdio de Composição e Mixagem'}
                </p>
              </div>

              {/* Interactive Waveform Display */}
              <div
                className="w-full h-32 flex items-center justify-between gap-[2px] sm:gap-1 px-4 cursor-pointer group relative"
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
                        isPlayed
                          ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                          : 'bg-zinc-800 group-hover:bg-zinc-700',
                      )}
                      style={{ height: `${val}%` }}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Transport Controls Bottom Bar */}
          <div className="h-32 bg-zinc-900 border-t border-white/10 shrink-0 flex flex-col px-6 py-4 z-20">
            {/* Seek Bar and Time Display */}
            <div className="flex items-center gap-4 w-full max-w-5xl mx-auto mb-4 group">
              <span className="text-sm font-mono font-medium text-zinc-300 min-w-[120px] text-right">
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
                  className="cursor-pointer py-2 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:shadow-md"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-6">
              <Button
                size="icon"
                variant="outline"
                className="w-12 h-12 rounded-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-white transition-colors"
                onClick={handleStop}
                title="Stop"
              >
                <Square className="w-5 h-5 fill-current" />
              </Button>
              <Button
                size="icon"
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-zinc-200 shadow-xl transition-transform hover:scale-105 active:scale-95"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 ml-1.5 fill-current" />
                )}
              </Button>
              <div className="w-12 h-12" /> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
