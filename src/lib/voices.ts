export interface Voice {
  id: string
  name: string
  language: string
  region: string
  sampleUrl: string
}

export const VOICES: Voice[] = [
  // BR
  {
    id: 'br-sp-joao',
    name: 'Paulista (João)',
    language: 'Português',
    region: 'Brasil - SP',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'br-sp-maria',
    name: 'Paulista (Maria)',
    language: 'Português',
    region: 'Brasil - SP',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'br-rj-carlos',
    name: 'Carioca (Carlos)',
    language: 'Português',
    region: 'Brasil - RJ',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'br-rj-ana',
    name: 'Carioca (Ana)',
    language: 'Português',
    region: 'Brasil - RJ',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'br-ne-pedro',
    name: 'Nordestino (Pedro)',
    language: 'Português',
    region: 'Brasil - Nordeste',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'br-s-luiza',
    name: 'Sulista (Luiza)',
    language: 'Português',
    region: 'Brasil - Sul',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },

  // US / UK
  {
    id: 'en-us-michael',
    name: 'American (Michael)',
    language: 'Inglês',
    region: 'Estados Unidos',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'en-uk-emma',
    name: 'British (Emma)',
    language: 'Inglês',
    region: 'Reino Unido',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },

  // ES
  {
    id: 'es-es-carmen',
    name: 'Castellano (Carmen)',
    language: 'Espanhol',
    region: 'Espanha',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'es-mx-juan',
    name: 'Mexicano (Juan)',
    language: 'Espanhol',
    region: 'México',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },

  // FR
  {
    id: 'fr-fr-julien',
    name: 'Francês (Julien)',
    language: 'Francês',
    region: 'França',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },

  // Default Fallbacks
  {
    id: 'deep',
    name: 'Profunda / Solene (Padrão)',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'soft',
    name: 'Suave / Meditação',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
  {
    id: 'announcer',
    name: 'Comercial / Locutor',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
  },
]

export const getGroupedVoices = () => {
  const groups: Record<string, Voice[]> = {}
  for (const v of VOICES) {
    const key = `${v.region} (${v.language})`
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  }
  return groups
}
