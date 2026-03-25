import { useState, useEffect, useCallback } from 'react'
import { Project } from '@/types'
import { getProject, updateProject } from '@/lib/storage'

function sanitizeProject(p: Project | null): Project | null {
  if (!p) return p

  const cleanUrl = (url: string | undefined | null) => {
    // Strip ephemeral blob URLs that don't persist across sessions
    // to prevent fetching errors during image capture and preview generation
    if (url && url.startsWith('blob:')) return ''
    return url
  }

  // Deep clone to avoid mutating local storage cache accidentally
  const clean = JSON.parse(JSON.stringify(p)) as Project

  if (clean.videoUrl) clean.videoUrl = cleanUrl(clean.videoUrl) || undefined
  if (clean.audioTrack?.url)
    clean.audioTrack.url = cleanUrl(clean.audioTrack.url) || ''

  if (clean.avatar?.imageUrl) {
    clean.avatar.imageUrl = cleanUrl(clean.avatar.imageUrl) || ''
  }

  if (clean.bRolls) {
    clean.bRolls.forEach((br) => {
      br.url = cleanUrl(br.url) || ''
    })
  }

  if (clean.drafts) {
    clean.drafts.forEach((draft) => {
      if (draft.snapshot.videoUrl) {
        draft.snapshot.videoUrl = cleanUrl(draft.snapshot.videoUrl) || undefined
      }
      if (draft.snapshot.audioTrack?.url) {
        draft.snapshot.audioTrack.url =
          cleanUrl(draft.snapshot.audioTrack.url) || ''
      }
      if (draft.snapshot.avatar?.imageUrl) {
        draft.snapshot.avatar.imageUrl =
          cleanUrl(draft.snapshot.avatar.imageUrl) || ''
      }
      if (draft.snapshot.bRolls) {
        draft.snapshot.bRolls.forEach((br) => {
          br.url = cleanUrl(br.url) || ''
        })
      }
    })
  }

  return clean
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    setProject(sanitizeProject(getProject(id) || null))
    const handler = () => setProject(sanitizeProject(getProject(id) || null))
    window.addEventListener('projects_updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('projects_updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [id])

  const update = useCallback(
    (updates: Partial<Project>) => {
      updateProject(id, updates)
    },
    [id],
  )

  return [project, update] as const
}
