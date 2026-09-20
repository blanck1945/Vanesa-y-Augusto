import { useRef, useState, type ChangeEvent } from 'react'
import { uploadAlbumFoto } from '../data/api'
import { albumMediaKind, validateAlbumUpload } from '../lib/albumUploadLimits'

type AlbumUploadProps = {
  label: string
  token?: string
  onSuccess?: () => void
}

/** Botón + input file oculto para que los invitados suban fotos/videos al álbum colaborativo. */
export function AlbumUpload({ label, token, onSuccess }: AlbumUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState(false)

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const validationError = validateAlbumUpload(file)
    if (validationError) {
      setError(true)
      setMessage(validationError)
      return
    }

    setUploading(true)
    setMessage(null)
    setError(false)

    try {
      await uploadAlbumFoto(file, token)
      setMessage(`¡Gracias! Tu ${albumMediaKind(file)} se subió correctamente`)
      onSuccess?.()
    } catch (err) {
      setError(true)
      setMessage(err instanceof Error ? err.message : 'No se pudo subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="inv-album-input"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <button
        type="button"
        className={`inv-album-btn${uploading ? ' inv-album-btn--pending' : ''}`}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Subiendo…' : label}
      </button>
      <p
        className={`inv-guest-meta inv-album-feedback${error ? ' inv-album-feedback--error' : ''}${message ? '' : ' inv-album-feedback--empty'}`}
        role="status"
        aria-live="polite"
      >
        {message ?? '\u00a0'}
      </p>
    </>
  )
}
