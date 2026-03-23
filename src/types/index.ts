export type Platform = 'tiktok' | 'instagram' | 'facebook'
export type AspectRatio = '9:16' | '1:1' | '4:5'

export interface ProjectElement {
  id: string
  type: 'text' | 'banner'
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
