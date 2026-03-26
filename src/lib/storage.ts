import { Project } from '@/types'

const STORAGE_KEY = 'multiproject_projects'

export function getProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id)
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  window.dispatchEvent(new Event('projects_updated'))
}

export function createProject(project: Project) {
  const current = getProjects()
  saveProjects([project, ...current])
}

export function updateProject(id: string, updates: Partial<Project>) {
  const current = getProjects()
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p))
  saveProjects(updated)
}

export function deleteProject(id: string) {
  const current = getProjects()
  const updated = current.filter((p) => p.id !== id)
  saveProjects(updated)
}
