import { Project } from '@/types'

const KEY = 'multiproject_projects_v3'

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

  // Clear old versions to reset data
  localStorage.removeItem('multiproject_projects')
  localStorage.removeItem('multiproject_projects_v2')

  const defaultDraftId1 = crypto.randomUUID()
  const defaultDraftId2 = crypto.randomUUID()

  const aiClips1 = [
    {
      id: crypto.randomUUID(),
      start: 0,
      end: 12,
      title: 'A História do Universo',
      description: 'Uma breve introdução sobre as maravilhas do cosmos.',
      keywords: ['universo', 'espaço', 'estrelas'],
      subtitles: [
        {
          id: crypto.randomUUID(),
          start: 0,
          end: 4,
          text: 'O universo é vasto e cheio de maravilhas.',
        },
        {
          id: crypto.randomUUID(),
          start: 4,
          end: 8,
          text: 'Bilhões de galáxias se espalham pelo infinito vazio.',
        },
        {
          id: crypto.randomUUID(),
          start: 8,
          end: 12,
          text: 'Somos todos exploradores deste grande cosmos.',
        },
      ],
    },
  ]

  const project1: Project = {
    id: 'example-1',
    name: 'Vídeo 1: Com Legendas',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: 12,
    trimStart: 0,
    trimEnd: 12,
    cuts: [],
    elements: [],
    sourceLanguage: 'pt-BR',
    subtitleLanguage: 'none',
    avatar: {
      enabled: false,
      mode: 'preset',
      position: 'custom',
      positionX: 50,
      positionY: 80,
      scale: 1,
    },
    subtitleStyle: {
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.6)',
      fontSize: 11,
      enabled: true,
    },
    glossary: [],
    aiClips: aiClips1,
    targetPlatforms: ['tiktok', 'instagram'],
    aspectRatio: '9:16',
    captions: {
      instagram: 'A beleza do universo explicada. 🌌 #cosmos',
      tiktok: 'Nós somos poeira estelar ✨ #universo',
      facebook: 'Uma jornada pelo cosmos.',
    },
    createdAt: Date.now(),
    drafts: [],
    activeDraftId: defaultDraftId1,
  }

  project1.drafts = [
    {
      id: defaultDraftId1,
      name: 'Versão 1',
      createdAt: Date.now(),
      snapshot: {
        videoUrl: project1.videoUrl,
        videoDuration: project1.videoDuration,
        trimStart: project1.trimStart,
        trimEnd: project1.trimEnd,
        cuts: project1.cuts,
        elements: project1.elements,
        aiClips: project1.aiClips,
        targetPlatforms: project1.targetPlatforms,
        aspectRatio: project1.aspectRatio,
        captions: project1.captions,
        sourceLanguage: project1.sourceLanguage,
        subtitleLanguage: project1.subtitleLanguage,
        avatar: project1.avatar,
        subtitleStyle: project1.subtitleStyle,
        glossary: project1.glossary,
      },
    },
  ]

  const aiClips2 = [
    {
      id: crypto.randomUUID(),
      start: 0,
      end: 10,
      title: 'Meditação e Foco',
      description: 'Um vídeo calmo para relaxamento.',
      keywords: ['foco', 'meditacao', 'paz'],
      subtitles: [
        {
          id: crypto.randomUUID(),
          start: 0,
          end: 5,
          text: 'Respire fundo e encontre o seu centro.',
        },
        {
          id: crypto.randomUUID(),
          start: 5,
          end: 10,
          text: 'Deixe as preocupações de lado e foque no agora.',
        },
      ],
    },
  ]

  const project2: Project = {
    id: 'example-2',
    name: 'Vídeo 2: Sem Legendas (Voz)',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    videoDuration: 10,
    trimStart: 0,
    trimEnd: 10,
    cuts: [],
    elements: [],
    sourceLanguage: 'pt-BR',
    subtitleLanguage: 'none',
    avatar: {
      enabled: false,
      mode: 'preset',
      position: 'custom',
      positionX: 50,
      positionY: 80,
      scale: 1,
    },
    subtitleStyle: {
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.6)',
      fontSize: 11,
      enabled: false,
    },
    glossary: [],
    aiClips: aiClips2,
    targetPlatforms: ['tiktok', 'instagram'],
    aspectRatio: '9:16',
    captions: {
      instagram: 'Momento de paz. 🧘 #meditacao',
      tiktok: 'Respire fundo 🍃 #foco',
      facebook: 'Relaxamento guiado.',
    },
    createdAt: Date.now() - 1000,
    drafts: [],
    activeDraftId: defaultDraftId2,
  }

  project2.drafts = [
    {
      id: defaultDraftId2,
      name: 'Versão 1',
      createdAt: Date.now(),
      snapshot: {
        videoUrl: project2.videoUrl,
        videoDuration: project2.videoDuration,
        trimStart: project2.trimStart,
        trimEnd: project2.trimEnd,
        cuts: project2.cuts,
        elements: project2.elements,
        aiClips: project2.aiClips,
        targetPlatforms: project2.targetPlatforms,
        aspectRatio: project2.aspectRatio,
        captions: project2.captions,
        sourceLanguage: project2.sourceLanguage,
        subtitleLanguage: project2.subtitleLanguage,
        avatar: project2.avatar,
        subtitleStyle: project2.subtitleStyle,
        glossary: project2.glossary,
      },
    },
  ]

  const initialProjects = [project1, project2]
  localStorage.setItem(KEY, JSON.stringify(initialProjects))
  return initialProjects
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
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoDuration: 10,
    trimStart: 0,
    trimEnd: 10,
    cuts: [],
    elements: [],
    targetPlatforms: ['tiktok', 'instagram'],
    aspectRatio: '9:16',
    captions: { instagram: '', tiktok: '', facebook: '' },
    createdAt: Date.now(),
    sourceLanguage: 'pt-BR',
    subtitleLanguage: 'none',
    drafts: [],
    avatar: {
      enabled: false,
      mode: 'preset',
      position: 'custom',
      positionX: 50,
      positionY: 80,
      scale: 1,
    },
    subtitleStyle: {
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.6)',
      fontSize: 11,
      enabled: true,
    },
    glossary: [],
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
