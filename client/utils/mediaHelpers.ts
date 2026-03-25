export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com/embed')
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function buildAltText(word: string, panelType: string): string {
  const labels: Record<string, string> = {
    LIP_READING_VIDEO: `Lip reading demonstration for the word ${word}`,
    CONCEPT_IMAGE: `Image representing the word ${word}`,
    SIGN_LANGUAGE_VIDEO: `Sign language demonstration for the word ${word}`,
  }
  return labels[panelType] ?? word
}