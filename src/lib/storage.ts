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

  const defaultDraftId = crypto.randomUUID()

  // Provide fully populated mock data by default so the interface is never blank
  const defaultProject: Project = {
    id: 'mock-project-1',
    name: 'História com IA',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoDuration: 10,
    trimStart: 0,
    trimEnd: 10,
    cuts: [],
    elements: [],
    language: 'pt-BR',
    aiClips: [
      {
        id: crypto.randomUUID(),
        start: 0,
        end: 10,
        title: 'Bem-vindo ao Criador de Histórias',
        description:
          'Gere vídeos incríveis baseados em textos com apenas um clique.',
        keywords: ['historia', 'ia', 'educacao'],
        subtitles: [
          {
            id: crypto.randomUUID(),
            start: 0,
            end: 5,
            text: 'Bem-vindo ao Criador de Histórias com IA!',
          },
          {
            id: crypto.randomUUID(),
            start: 5,
            end: 10,
            text: 'Digite um texto (ex: Salmo 21) e veja a mágica.',
          },
        ],
      },
    ],
    targetPlatforms: ['tiktok', 'instagram'],
    aspectRatio: '9:16',
    captions: {
      instagram: 'Nova história gerada com IA! #reels',
      tiktok: 'Criado automaticamente #fyp',
      facebook: 'Vídeo educativo.',
    },
    createdAt: Date.now(),
    drafts: [],
    activeDraftId: defaultDraftId,
  }

  // Populate the default draft with the initial snapshot state
  defaultProject.drafts = [
    {
      id: defaultDraftId,
      name: 'Bem-vindo ao Criador',
      createdAt: Date.now(),
      snapshot: {
        videoUrl: defaultProject.videoUrl,
        videoDuration: defaultProject.videoDuration,
        trimStart: defaultProject.trimStart,
        trimEnd: defaultProject.trimEnd,
        cuts: defaultProject.cuts,
        elements: defaultProject.elements,
        aiClips: defaultProject.aiClips,
        targetPlatforms: defaultProject.targetPlatforms,
        aspectRatio: defaultProject.aspectRatio,
        captions: defaultProject.captions,
        language: defaultProject.language,
      },
    },
  ]

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
    targetPlatforms: ['tiktok', 'instagram'],
    aspectRatio: '9:16',
    captions: { instagram: '', tiktok: '', facebook: '' },
    createdAt: Date.now(),
    language: 'pt-BR',
    drafts: [],
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
