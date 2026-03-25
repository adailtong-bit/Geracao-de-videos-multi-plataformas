export const VIDEO_FORMATS = [
  {
    id: 'yt_long',
    label: 'YouTube (Long-form)',
    max: undefined,
    min: 480, // 8 minutes for mid-roll
    group: 'YouTube',
  },
  {
    id: 'yt_shorts',
    label: 'YouTube Shorts',
    max: 60,
    min: undefined,
    group: 'YouTube',
  },
  {
    id: 'tk_standard',
    label: 'TikTok',
    max: 180,
    min: undefined,
    group: 'TikTok',
  },
  {
    id: 'ig_reels',
    label: 'Instagram Reels',
    max: 90,
    min: undefined,
    group: 'Instagram',
  },
  {
    id: 'custom',
    label: 'Personalizado Livre',
    max: undefined,
    min: undefined,
    group: 'Outros',
  },
]
