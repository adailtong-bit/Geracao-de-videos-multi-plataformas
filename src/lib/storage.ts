import { Project } from '@/types'

const KEY = 'multiproject_projects'

export const getProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(KEY, JSON.stringify(projects))
  window.dispatchEvent(new Event('projects_updated'))
}

export const getProject = (id: string) => getProjects().find((p) => p.id === id)

export const updateProject = (id: string, updates: Partial<Project>) => {
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates }
    saveProjects(projects)
  }
}

export const createProject = (name: string): Project => {
  const projects = getProjects()
  // Limit handled in UI now based on plan, but keep this fallback check safe
  if (projects.length >= 100) throw new Error('Maximum absolute limit reached')

  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    videoUrl: null,
    videoDuration: 120,
    trimStart: 0,
    trimEnd: 120,
    elements: [],
    targetPlatforms: ['instagram', 'tiktok', 'facebook'],
    aspectRatio: '9:16',
    captions: { instagram: '', tiktok: '', facebook: '' },
    createdAt: Date.now(),
  }
  projects.push(newProject)
  saveProjects(projects)
  return newProject
}

export const deleteProject = (id: string) => {
  const projects = getProjects().filter((p) => p.id !== id)
  saveProjects(projects)
}
