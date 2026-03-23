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

export interface Project {
  id: string
  name: string
  videoUrl: string | null
  videoDuration: number
  trimStart: number
  trimEnd: number
  elements: ProjectElement[]
  targetPlatforms: Platform[]
  aspectRatio: AspectRatio
  captions: Record<Platform, string>
  createdAt: number
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
