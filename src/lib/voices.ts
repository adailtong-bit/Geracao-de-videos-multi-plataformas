export interface Voice {
  id: string
  name: string
  language: string
  region: string
  sampleUrl: string
  isOrganic?: boolean
  fidelity?: 'standard' | 'high-fidelity'
}

export const VOICES: Voice[] = [
  // BR High-Fidelity Neural (Organic)
  {
    id: 'br-sp-joao-neural',
    name: 'Paulista Neural (João) - Alta Fidelidade',
    language: 'Português',
    region: 'Brasil - SP',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'br-rj-ana-neural',
    name: 'Carioca Neural (Ana) - Alta Fidelidade',
    language: 'Português',
    region: 'Brasil - RJ',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'br-deep-neural',
    name: 'Profunda Neural (Solenidade / Bíblico)',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'br-nature-neural',
    name: 'Suave Neural (Natureza / Meditação)',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'br-urban-neural',
    name: 'Dinâmica Neural (Urbano / Vlog)',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },

  // BR Standard
  {
    id: 'br-sp-joao',
    name: 'Paulista (João) - Padrão',
    language: 'Português',
    region: 'Brasil - SP',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'br-sp-maria',
    name: 'Paulista (Maria) - Padrão',
    language: 'Português',
    region: 'Brasil - SP',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'br-rj-carlos',
    name: 'Carioca (Carlos) - Padrão',
    language: 'Português',
    region: 'Brasil - RJ',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'br-ne-pedro',
    name: 'Nordestino (Pedro) - Padrão',
    language: 'Português',
    region: 'Brasil - Nordeste',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'br-s-luiza',
    name: 'Sulista (Luiza) - Padrão',
    language: 'Português',
    region: 'Brasil - Sul',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },

  // US / UK Neural
  {
    id: 'en-us-michael-neural',
    name: 'American Neural (Michael) - High Fidelity',
    language: 'Inglês',
    region: 'Estados Unidos',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'en-uk-emma-neural',
    name: 'British Neural (Emma) - High Fidelity',
    language: 'Inglês',
    region: 'Reino Unido',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },

  // US / UK Standard
  {
    id: 'en-us-michael',
    name: 'American (Michael)',
    language: 'Inglês',
    region: 'Estados Unidos',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'en-uk-emma',
    name: 'British (Emma)',
    language: 'Inglês',
    region: 'Reino Unido',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },

  // ES
  {
    id: 'es-es-carmen-neural',
    name: 'Castellano Neural (Carmen) - Alta Fidelidad',
    language: 'Espanhol',
    region: 'Espanha',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    isOrganic: true,
    fidelity: 'high-fidelity',
  },
  {
    id: 'es-es-carmen',
    name: 'Castellano (Carmen)',
    language: 'Espanhol',
    region: 'Espanha',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'es-mx-juan',
    name: 'Mexicano (Juan)',
    language: 'Espanhol',
    region: 'México',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },

  // FR
  {
    id: 'fr-fr-julien',
    name: 'Francês (Julien)',
    language: 'Francês',
    region: 'França',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },

  // Default Fallbacks
  {
    id: 'deep',
    name: 'Profunda / Solene (Padrão)',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'soft',
    name: 'Suave / Meditação',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
  },
  {
    id: 'announcer',
    name: 'Comercial / Locutor',
    language: 'Geral',
    region: 'Global',
    sampleUrl:
      'https://actions.google.com/sounds/v1/human_voices/human_clearing_throat.ogg',
    fidelity: 'standard',
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
