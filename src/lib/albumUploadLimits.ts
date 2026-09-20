export const ALBUM_MAX_PHOTO_BYTES = 25 * 1024 * 1024
export const ALBUM_MAX_VIDEO_BYTES = 100 * 1024 * 1024

const ALLOWED_PHOTO_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
])

const ALLOWED_VIDEO_MIME = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
])

function extname(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

export function isAlbumVideo(file: File): boolean {
  const mime = (file.type || '').toLowerCase()
  if (mime.startsWith('video/')) return true
  if (mime.startsWith('image/')) return false
  return /\.(mp4|mov|webm|avi)$/i.test(extname(file.name))
}

function isAllowedMime(file: File): boolean {
  const mime = (file.type || '').toLowerCase()
  if (ALLOWED_PHOTO_MIME.has(mime) || ALLOWED_VIDEO_MIME.has(mime)) return true
  const ext = extname(file.name)
  return /\.(jpe?g|png|webp|gif|heic|heif|mp4|mov|webm|avi)$/i.test(ext)
}

export function validateAlbumUpload(file: File): string | null {
  if (!isAllowedMime(file)) {
    return 'Solo podés subir fotos (JPEG, PNG, HEIC…) o videos (MP4, MOV…).'
  }

  const video = isAlbumVideo(file)
  const maxBytes = video ? ALBUM_MAX_VIDEO_BYTES : ALBUM_MAX_PHOTO_BYTES
  const maxMb = Math.round(maxBytes / (1024 * 1024))

  if (file.size > maxBytes) {
    return video
      ? `El video supera ${maxMb} MB. Probá con un clip más corto.`
      : `La foto supera ${maxMb} MB.`
  }

  return null
}

export function albumMediaKind(file: File): 'foto' | 'video' {
  return isAlbumVideo(file) ? 'video' : 'foto'
}
