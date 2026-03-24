export type Platform = 'tiktok' | 'instagram' | 'facebook'
export type AspectRatio = '9:16' | '1:1' | '4:5'

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
}

export interface AudioTrack {
  id: string
  name: string
  mood: string
  url?: string
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

export interface Draft {
  id: string
  name: string
  createdAt: number
  snapshot: Partial<Project>
}

export interface Project {
  id: string
  name: string
  videoUrl: string | null
  videoDuration: number
  trimStart: number
  trimEnd: number
  cuts?: CutSegment[]
  aiClips?: AiClip[]
  elements: ProjectElement[]
  targetPlatforms: Platform[]
  aspectRatio: AspectRatio
  captions: Record<Platform, string>
  createdAt: number
  energyData?: EnergyPoint[]
  bRolls?: BRoll[]
  audioTrack?: AudioTrack | null
  sfx?: SFXTrack[]
  globalCaptionStyle?: 'pop-up' | 'highlight' | 'none'
  scheduledPosts?: ScheduledPost[]
  drafts?: Draft[]
  activeDraftId?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro'
  linkedAccounts: {
    instagram?: string
    tiktok?: string
    facebook?: string
  }
}

export interface Asset {
  id: string
  name: string
  type: 'banner' | 'cta'
  bgColor: string
  content: string
}
