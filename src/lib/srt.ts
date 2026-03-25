import { Project } from '@/types'

function formatSrtTime(seconds: number): string {
  const date = new Date(0)
  date.setUTCMilliseconds(seconds * 1000)
  const pad = (num: number, size: number) => String(num).padStart(size, '0')
  return `${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)}:${pad(date.getUTCSeconds(), 2)},${pad(date.getUTCMilliseconds(), 3)}`
}

export function exportSrt(project: Project) {
  let srtContent = ''
  let counter = 1

  if (!project.aiClips || project.aiClips.length === 0) {
    alert('Nenhuma legenda gerada para exportar.')
    return
  }

  project.aiClips.forEach((clip) => {
    clip.subtitles.forEach((sub) => {
      srtContent += `${counter}\n`
      srtContent += `${formatSrtTime(sub.start)} --> ${formatSrtTime(sub.end)}\n`
      srtContent += `${sub.text}\n\n`
      counter++
    })
  })

  if (!srtContent) {
    alert('Nenhuma legenda encontrada para exportar.')
    return
  }

  const blob = new Blob([srtContent], { type: 'text/srt' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name || 'legenda'}.srt`
  a.click()
  URL.revokeObjectURL(url)
}
