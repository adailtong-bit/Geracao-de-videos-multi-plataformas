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

export interface ScheduledPost {
  id: string
  platform: Platform
  date: string
  status: 'scheduled' | 'published'
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
  scheduledPosts?: ScheduledPost[]
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
