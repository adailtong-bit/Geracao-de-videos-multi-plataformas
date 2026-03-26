export type Platform =
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5'
export type Language = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT'
export type VoiceProfile = string
export type VisualStyle = 'realistic' | 'cinematic-dark' | 'artistic'
export type Mood = 'inspirational' | 'dramatic' | 'calm'
export type TransitionStyle = 'none' | 'fade' | 'slide' | 'zoom'
export type MediaType = 'image-sequence' | 'context-video'
export type NarrativeTone =
  | 'neutral'
  | 'suspense'
  | 'joy'
  | 'fear'
  | 'inspirational'
export type AtmosphereEnv = 'none' | 'campfire' | 'neon' | 'studio'
export type ListenerReaction = 'gasp' | 'nod' | 'fear'
export type AvatarType = 'preset' | 'custom'
export type AvatarStatus =
  | 'processing_bg'
  | 'training_motion'
  | 'ready'
  | 'failed'

export interface AvatarModel {
  id: string
  name: string
  type: AvatarType
  imageUrl: string
  status: AvatarStatus
  createdAt: number
}

export interface ProjectElement {
  id: string
  type: 'text' | 'banner' | 'caption'
  content: string
  x: number
  y: number
  color?: string
  bgColor?: string
  animationStyle?: 'pop-up' | 'highlight' | 'none'
}

export interface CutSegment {
  id: string
  start: number
  end: number
  sourceStart?: number
  sourceEnd?: number
}
export interface Subtitle {
  id: string
  start: number
  end: number
  text: string
}
export interface AiClip {
  id: string
  start: number
  end: number
  title: string
  description: string
  keywords: string[]
  subtitles: Subtitle[]
}
export interface EnergyPoint {
  time: number
  value: number
}
export interface BRoll {
  id: string
  start: number
  end: number
  url: string
  keyword?: string
  transitionStyle?: TransitionStyle
}
export interface AudioTrack {
  id: string
  name: string
  mood: string
  url?: string
  adaptiveLeveling?: boolean
}
export interface SFXTrack {
  id: string
  sfxId: string
  name: string
  category: string
  start: number
}
export interface ScheduledPost {
  id: string
  platform: Platform
  date: string
  status: 'scheduled' | 'published'
}
export interface ListenerPersona {
  id: string
  imageUrl: string
  positionX: number
  positionY: number
  scale: number
  reactionTime: number
  reactionType: ListenerReaction
}

export interface AvatarSettings {
  enabled: boolean
  mode: 'upload' | 'generate' | 'preset'
  imageUrl?: string
  prompt?: string
  position: 'bottom-left' | 'bottom-right' | 'center' | 'custom'
  positionX?: number
  positionY?: number
  scale?: number
  tone?: NarrativeTone
  atmosphere?: AtmosphereEnv
  listeners?: ListenerPersona[]
  zIndex?: number
}

export interface SubtitleStyle {
  color: string
  backgroundColor: string
  fontSize: number
  enabled?: boolean
  fontFamily?: string
}
export interface Draft {
  id: string
  name: string
  createdAt: number
  snapshot: Partial<Project>
}
export interface TeamMember {
  id: string
  email: string
  role: 'viewer' | 'editor'
  avatar?: string
}
export interface ColorSettings {
  brightness: number
  contrast: number
  saturation: number
  preset:
    | 'none'
    | 'grayscale'
    | 'sepia'
    | 'vintage'
    | 'film-grain'
    | 'candle-light'
    | 'noir'
}
export type ApprovalStatus = 'review' | 'revised' | 'approved'
export interface GlossaryTerm {
  id: string
  source: string
  target: string
}
export interface AudioSettings {
  organicProsody?: boolean
  removeArtifacts?: boolean
  tailSilenceEnforcement?: boolean
  clearAudioBuffer?: boolean
}

export type ProjectType = 'video' | 'music'

export interface Project {
  id: string
  name: string
  projectType?: ProjectType
  draftPrompt?: string
  musicPrompt?: string
  videoUrl: string | null
  videoDuration: number
  trimStart: number
  trimEnd: number
  cuts?: CutSegment[]
  aiClips?: AiClip[]
  elements: ProjectElement[]
  targetPlatforms: Platform[]
  aspectRatio: AspectRatio
  captions: Record<string, string>
  createdAt: number
  energyData?: EnergyPoint[]
  bRolls?: BRoll[]
  audioTrack?: AudioTrack | null
  sfx?: SFXTrack[]
  globalCaptionStyle?: 'pop-up' | 'highlight' | 'none'
  scheduledPosts?: ScheduledPost[]
  drafts?: Draft[]
  activeDraftId?: string | null
  language?: Language
  sourceLanguage?: Language
  subtitleLanguage?: Language | 'none'
  voiceProfile?: VoiceProfile
  visualStyle?: VisualStyle
  mood?: Mood
  teamMembers?: TeamMember[]
  targetFormat?: string
  mediaType?: MediaType
  avatar?: AvatarSettings
  subtitleStyle?: SubtitleStyle
  colorSettings?: ColorSettings
  approvalStatus?: ApprovalStatus
  glossary?: GlossaryTerm[]
  collaborationMode?: boolean
  imageCategory?: string
  audioSettings?: AudioSettings
}

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro'
  role?: 'admin' | 'user'
  videosGenerated?: number
  paymentStatus?: 'paid' | 'overdue' | 'pending'
  isBlocked?: boolean
  linkedAccounts: {
    instagram?: string
    tiktok?: string
    facebook?: string
    youtube?: string
    linkedin?: string
  }
  lastActivity?: string
}

export interface GatewayConfig {
  provider: 'stripe' | 'mercadopago'
  publicKey: string
  privateKey: string
  env: 'sandbox' | 'production'
  enabled: boolean
}
export interface CostEntry {
  id: string
  date: string
  description: string
  amount: number
  type: 'hosting' | 'api' | 'other'
}
export interface AdminTransaction {
  id: string
  date: string
  user: string
  type: 'revenue' | 'cost'
  description: string
  value: number
  status: 'paid' | 'pending'
}

export interface PlatformSettings {
  freeVideoLimit: number
  pricePerVideo: number
  subscriptionPrice: number
  paymentMethods: { stripe: boolean; paypal: boolean; pix: boolean }
  gateways: GatewayConfig[]
  costs: CostEntry[]
}
