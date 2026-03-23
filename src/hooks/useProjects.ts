import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { getProjects, createProject, deleteProject } from '@/lib/storage'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(getProjects())
    const handler = () => setProjects(getProjects())
    window.addEventListener('projects_updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('projects_updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return {
    projects,
    addProject: (name: string, options?: Partial<Project>) => {
      const p = createProject(name, options)
      return p
    },
    removeProject: deleteProject,
  }
}
