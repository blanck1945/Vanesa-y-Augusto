import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getSesionAdmin, loginUsuario, setSesionAdmin } from '../data/api'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Text } from '../components/ui/Text'

export function LoginPage() {
  const navigate = useNavigate()
  const sesion = getSesionAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (sesion) return <Navigate to="/dashboard" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const usuario = await loginUsuario(email.trim(), password)
      setSesionAdmin(usuario)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6">
      <div>
        <Text as="h1" className="text-2xl text-bp-body">
          Dashboard del casamiento
        </Text>
        <Text muted className="mt-1">
          Ingresá para ver confirmaciones y copiar links de invitación.
        </Text>
      </div>
      <Card className="p-5">
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error ? <Text className="text-red-700">{error}</Text> : null}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
