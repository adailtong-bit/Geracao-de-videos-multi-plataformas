import { useState, useEffect, useCallback } from 'react'
import { Project } from '@/types'
import { getProject, updateProject } from '@/lib/storage'

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    setProject(getProject(id) || null)
    const handler = () => setProject(getProject(id) || null)
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
