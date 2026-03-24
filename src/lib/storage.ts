import { Project } from '@/types'

const KEY = 'multiproject_projects'

export const getProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.length > 0) return parsed
    }
  } catch {
    // Ignore error and fall back to mock data
  }

  // Provide fully populated mock data by default so the interface is never blank
  const defaultProject: Project = {
    id: 'mock-project-1',
    name: 'Projeto de Demonstração',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoDuration: 10,
    trimStart: 0,
    trimEnd: 10,
    cuts: [],
    elements: [],
    aiClips: [
      {
        id: crypto.randomUUID(),
        start: 0,
        end: 5,
        title: 'Como fazer vídeos virais em 2024',
        description:
          'Dicas essenciais para crescer nas redes sociais! #viral #dicas #crescimento',
        keywords: ['viral', 'dicas', 'crescimento'],
        subtitles: [
          {
            id: crypto.randomUUID(),
            start: 0,
            end: 2.5,
            text: 'Quer saber o segredo?',
          },
          {
            id: crypto.randomUUID(),
            start: 2.5,
            end: 5,
            text: 'Fique até o final!',
          },
        ],
      },
    ],
    targetPlatforms: ['instagram', 'tiktok', 'facebook'],
    aspectRatio: '9:16',
    captions: {
      instagram: 'Veja isso! #reels',
      tiktok: 'Viral! #fyp',
      facebook: 'Incrível',
    },
    createdAt: Date.now(),
  }

  localStorage.setItem(KEY, JSON.stringify([defaultProject]))
  return [defaultProject]
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

export const createProject = (
  name: string,
  options?: Partial<Project>,
): Project => {
  const projects = getProjects()
  if (projects.length >= 100) throw new Error('Maximum absolute limit reached')

  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoDuration: 10,
    trimStart: 0,
    trimEnd: 10,
    cuts: [],
    elements: [],
    targetPlatforms: ['instagram', 'tiktok', 'facebook'],
    aspectRatio: '9:16',
    captions: { instagram: '', tiktok: '', facebook: '' },
    createdAt: Date.now(),
    ...options,
  }
  projects.push(newProject)
  saveProjects(projects)
  return newProject
}

export const deleteProject = (id: string) => {
  const projects = getProjects().filter((p) => p.id !== id)
  saveProjects(projects)
}
