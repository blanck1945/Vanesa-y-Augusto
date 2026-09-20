import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CSV_PLANTILLA_INVITADOS,
  clearSesionAdmin,
  createInvitacion,
  deleteInvitacion,
  getSesionAdmin,
  confirmarImportacionCsv,
  previewInvitacionesCsv,
  invitacionLinkFor,
  listInvitaciones,
  sendInvitacionEmail,
  sendInvitacionesPendientes,
  updateInvitacion,
  type ImportacionCsvResultado,
  type Invitacion,
  type LadoInvitacion,
  type PreviewImportacionCsv,
} from '../data/api'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Text } from '../components/ui/Text'

function estadoLabel(estado: Invitacion['estado']): string {
  if (estado === 'si') return 'Confirmó que sí'
  if (estado === 'no') return 'Confirmó que no'
  if (estado === 'aun_no_lo_se') return 'Aún no lo sabe'
  return 'Sin respuesta'
}

function estadoClass(estado: Invitacion['estado']): string {
  if (estado === 'si') return 'dash-estado dash-estado--si'
  if (estado === 'no') return 'dash-estado dash-estado--no'
  if (estado === 'aun_no_lo_se') return 'dash-estado dash-estado--talvez'
  return 'dash-estado dash-estado--pendiente'
}

function invitaLabel(inv: Invitacion): string {
  return inv.permitePareja ? 'Invitado + pareja' : 'Solo invitado'
}

function ladoLabel(lado: Invitacion['lado']): string {
  if (lado === 'vanesa') return 'Vanesa'
  if (lado === 'augusto') return 'Augusto'
  return '—'
}

function restriccionesLabel(inv: Invitacion): string {
  if (inv.restriccionesAlimentariasSi == null) return '—'
  if (!inv.restriccionesAlimentariasSi) return 'No'
  return inv.restriccionesAlimentarias ? `Sí · ${inv.restriccionesAlimentarias}` : 'Sí'
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type EdicionInvitacion = {
  nombre: string
  lado: LadoInvitacion
  permitePareja: boolean
  email: string
}

function draftFromInvitacion(inv: Invitacion): EdicionInvitacion {
  return {
    nombre: inv.nombre,
    lado: inv.lado ?? 'vanesa',
    permitePareja: inv.permitePareja,
    email: inv.email ?? '',
  }
}

/** Cupos de la invitación: 2 si incluye pareja, 1 si es solo invitado. */
function personasInvitadas(inv: Invitacion): number {
  return inv.permitePareja ? 2 : 1
}

/** Personas que confirmaron asistir (0 si no respondió sí). */
function personasConfirmadas(inv: Invitacion): number {
  if (inv.estado !== 'si') return 0
  return inv.nombreAcompanante ? 2 : 1
}

function personasEnTabla(inv: Invitacion): string {
  if (inv.estado === 'si') return String(personasConfirmadas(inv))
  return String(personasInvitadas(inv))
}

function descargarPlantillaCsv() {
  const blob = new Blob([CSV_PLANTILLA_INVITADOS], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla-invitados.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function DashboardPage() {
  const [usuario] = useState(() => getSesionAdmin())
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [lado, setLado] = useState<LadoInvitacion>('vanesa')
  const [permitePareja, setPermitePareja] = useState(false)
  const [creando, setCreando] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<EdicionInvitacion | null>(null)
  const [guardandoId, setGuardandoId] = useState<number | null>(null)
  const [csvPreview, setCsvPreview] = useState<PreviewImportacionCsv | null>(null)
  const [csvPreviewLoading, setCsvPreviewLoading] = useState(false)
  const [importando, setImportando] = useState(false)
  const [importResult, setImportResult] = useState<ImportacionCsvResultado | null>(null)
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [enviandoPendientes, setEnviandoPendientes] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const nombreInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!usuario) return
    let cancelado = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listInvitaciones()
        if (!cancelado) setInvitaciones(data)
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelado) setLoading(false)
      }
    })()
    return () => {
      cancelado = true
    }
  }, [usuario])

  if (!usuario) return <Navigate to="/login" replace />

  async function onCrear(e: React.FormEvent) {
    e.preventDefault()
    const val = nombre.trim()
    if (!val) return
    setCreando(true)
    setError(null)
    try {
      const creada = await createInvitacion(val, permitePareja, lado)
      setNombre('')
      setLado('vanesa')
      setPermitePareja(false)
      setInvitaciones((prev) => [creada, ...prev])
      nombreInputRef.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreando(false)
    }
  }

  async function onCopiar(token: string) {
    const link = invitacionLinkFor(token)
    try {
      await navigator.clipboard.writeText(link)
      setCopiedToken(token)
      window.setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      setError('No se pudo copiar el link')
    }
  }

  async function onBorrar(id: number) {
    setError(null)
    try {
      await deleteInvitacion(id)
      setInvitaciones((prev) => prev.filter((i) => i.id !== id))
      if (editandoId === id) {
        setEditandoId(null)
        setEditDraft(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  function onEmpezarEditar(inv: Invitacion) {
    setError(null)
    setEditandoId(inv.id)
    setEditDraft(draftFromInvitacion(inv))
  }

  function onCancelarEditar() {
    setEditandoId(null)
    setEditDraft(null)
  }

  async function onGuardarEditar(id: number) {
    if (!editDraft) return
    const val = editDraft.nombre.trim()
    if (!val) return
    setGuardandoId(id)
    setError(null)
    try {
      const actualizada = await updateInvitacion(
        id,
        val,
        editDraft.permitePareja,
        editDraft.lado,
        editDraft.email.trim() || null,
      )
      setInvitaciones((prev) => prev.map((i) => (i.id === id ? actualizada : i)))
      setEditandoId(null)
      setEditDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGuardandoId(null)
    }
  }

  function resetCsvInput() {
    setCsvPreview(null)
    if (csvInputRef.current) csvInputRef.current.value = ''
  }

  async function onCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvPreviewLoading(true)
    setError(null)
    setImportResult(null)
    setCsvPreview(null)
    try {
      const preview = await previewInvitacionesCsv(file)
      setCsvPreview(preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      resetCsvInput()
    } finally {
      setCsvPreviewLoading(false)
    }
  }

  async function onConfirmarImportacion() {
    if (!csvPreview || csvPreview.nuevos.length === 0) return
    setImportando(true)
    setError(null)
    setImportResult(null)
    try {
      const result = await confirmarImportacionCsv(csvPreview.nuevos)
      setImportResult(result)
      if (result.creados.length > 0) {
        setInvitaciones((prev) => [...result.creados, ...prev])
      }
      resetCsvInput()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setImportando(false)
    }
  }

  async function onEnviarEmail(id: number) {
    setEnviandoId(id)
    setError(null)
    try {
      const actualizada = await sendInvitacionEmail(id)
      setInvitaciones((prev) => prev.map((i) => (i.id === id ? actualizada : i)))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviandoId(null)
    }
  }

  async function onEnviarPendientes() {
    setEnviandoPendientes(true)
    setError(null)
    try {
      const result = await sendInvitacionesPendientes()
      if (result.enviados.length > 0) {
        const refreshed = await listInvitaciones()
        setInvitaciones(refreshed)
        if (result.errores.length > 0) {
          setError(
            `Enviados ${result.resumen.ok}, fallidos ${result.resumen.fallidos}. Primer error: ${result.errores[0]?.mensaje ?? ''}`,
          )
        }
      } else if (result.errores.length > 0) {
        setError(result.errores[0]?.mensaje ?? 'No se pudo enviar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviandoPendientes(false)
    }
  }

  const confSi = invitaciones.filter((i) => i.estado === 'si').length
  const pendientes = invitaciones.filter((i) => i.estado === 'pendiente').length
  const talVez = invitaciones.filter((i) => i.estado === 'aun_no_lo_se').length
  const confNo = invitaciones.filter((i) => i.estado === 'no').length
  const totalPersonasInvitadas = invitaciones.reduce((acc, i) => acc + personasInvitadas(i), 0)
  const personasConfirmaronSi = invitaciones.reduce((acc, i) => acc + personasConfirmadas(i), 0)
  const emailsPendientes = invitaciones.filter((i) => i.email && !i.emailEnviadoAt).length

  return (
    <div className="dash-panel mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text as="h1" className="text-2xl text-bp-body">
            Invitaciones
          </Text>
          <Text muted className="mt-1">
            Hola, {usuario.nombre}. Creá invitados, importá un CSV o mandá invitaciones por email.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => {
            clearSesionAdmin()
            window.location.href = '/login'
          }}
        >
          Salir
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-4">
          <Text muted>Personas invitadas</Text>
          <Text className="text-2xl text-bp-body">{totalPersonasInvitadas}</Text>
          <Text muted className="text-sm">
            {invitaciones.length} {invitaciones.length === 1 ? 'invitación' : 'invitaciones'}
          </Text>
        </Card>
        <Card className="p-4">
          <Text muted>Sin respuesta</Text>
          <Text className="text-2xl text-bp-body">{pendientes}</Text>
        </Card>
        <Card className="p-4">
          <Text muted>Confirmó sí</Text>
          <Text className="text-2xl text-bp-body">{confSi}</Text>
        </Card>
        <Card className="p-4">
          <Text muted>Confirmó no</Text>
          <Text className="text-2xl text-bp-body">{confNo}</Text>
        </Card>
        <Card className="p-4">
          <Text muted>Personas (sí)</Text>
          <Text className="text-2xl text-bp-body">{personasConfirmaronSi}</Text>
        </Card>
      </div>

      {talVez > 0 ? (
        <Text muted className="text-sm">
          Todavía no saben: {talVez}
        </Text>
      ) : null}

      <Card className="p-5 dash-import-card">
        <Text as="h2" className="mb-2 text-lg text-bp-body">
          Importar CSV
        </Text>
        <Text muted className="mb-3 text-sm">
          Columnas: <span className="font-mono">nombre, email, lado, invita</span> — lado: vanesa o augusto; invita: si/no
          o pareja/solo.
        </Text>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={csvInputRef}
            id="dash-csv-file"
            type="file"
            accept=".csv,text/csv,text/plain,application/vnd.ms-excel"
            className="dash-csv-input-hidden"
            disabled={csvPreviewLoading || importando}
            onChange={onCsvSelected}
          />
          <label
            htmlFor="dash-csv-file"
            className={`dash-csv-picker${csvPreviewLoading || importando ? ' dash-csv-picker--busy' : ''}`}
          >
            {csvPreviewLoading ? 'Analizando CSV…' : 'Elegir CSV'}
          </label>
          <Button type="button" variant="secondary" size="sm" onClick={descargarPlantillaCsv}>
            Descargar plantilla
          </Button>
          {emailsPendientes > 0 ? (
            <Button
              type="button"
              variant="secondary"
              disabled={enviandoPendientes}
              onClick={() => void onEnviarPendientes()}
            >
              {enviandoPendientes ? 'Enviando…' : `Enviar pendientes (${emailsPendientes})`}
            </Button>
          ) : null}
        </div>
        {importResult ? (
          <div className="dash-import-result mt-3">
            <Text className="text-sm">
              <strong>{importResult.resumen.ok}</strong> creados,{' '}
              <strong>{importResult.resumen.fallidos}</strong> errores
            </Text>
            {importResult.errores.length > 0 ? (
              <ul className="dash-import-errors">
                {importResult.errores.map((e) => (
                  <li key={`${e.fila}-${e.mensaje}`}>
                    Fila {e.fila}: {e.mensaje}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Modal
        open={csvPreview != null}
        title="Revisá la importación"
        onClose={resetCsvInput}
        footer={
          csvPreview ? (
            <>
              <Button
                type="button"
                disabled={importando || csvPreview.nuevos.length === 0}
                onClick={() => void onConfirmarImportacion()}
              >
                {importando
                  ? 'Importando…'
                  : csvPreview.nuevos.length > 0
                    ? `Importar ${csvPreview.nuevos.length} nuevos`
                    : 'Nada nuevo para importar'}
              </Button>
              <Button type="button" variant="secondary" disabled={importando} onClick={resetCsvInput}>
                Cancelar
              </Button>
            </>
          ) : null
        }
      >
        {csvPreview ? (
          <>
            <Text className="mb-4 text-sm text-bp-body">
              <strong>{csvPreview.resumen.nuevos}</strong>{' '}
              {csvPreview.resumen.nuevos === 1 ? 'invitado nuevo' : 'invitados nuevos'}
              {' · '}
              <strong>{csvPreview.resumen.existentes}</strong>{' '}
              {csvPreview.resumen.existentes === 1 ? 'ya existe' : 'ya existen'}
              {csvPreview.resumen.invalidos > 0 ? (
                <>
                  {' · '}
                  <strong>{csvPreview.resumen.invalidos}</strong> con error
                </>
              ) : null}
            </Text>

            {csvPreview.nuevos.length > 0 ? (
              <div className="dash-import-preview-block">
                <Text as="h3" className="dash-import-preview-title">
                  Se van a crear ({csvPreview.nuevos.length})
                </Text>
                <ul className="dash-import-preview-list">
                  {csvPreview.nuevos.map((f) => (
                    <li key={`nuevo-${f.fila}-${f.nombre}`}>
                      {f.nombre}
                      <span className="dash-import-preview-meta">
                        {ladoLabel(f.lado)} · {f.permitePareja ? 'con pareja' : 'solo'}
                        {f.email ? ` · ${f.email}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {csvPreview.existentes.length > 0 ? (
              <div className="dash-import-preview-block dash-import-preview-block--skip">
                <Text as="h3" className="dash-import-preview-title">
                  Ya existen — se omiten ({csvPreview.existentes.length})
                </Text>
                <ul className="dash-import-preview-list">
                  {csvPreview.existentes.map((f) => (
                    <li key={`exist-${f.fila}-${f.nombre}`}>
                      {f.nombre}
                      <span className="dash-import-preview-meta">coincide con «{f.existenteNombre}»</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {csvPreview.errores.length > 0 ? (
              <ul className="dash-import-errors mt-3">
                {csvPreview.errores.map((e) => (
                  <li key={`err-${e.fila}-${e.mensaje}`}>
                    Fila {e.fila}: {e.mensaje}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </Modal>

      <Card className="p-5">
        <Text as="h2" className="mb-3 text-lg text-bp-body">
          Nueva invitación
        </Text>
        <form onSubmit={(e) => void onCrear(e)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field
              ref={nombreInputRef}
              label="Nombre del invitado"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. María López"
              required
            />
          </div>
          <div className="sm:w-44">
            <Select
              label="Lado"
              value={lado}
              onChange={(e) => setLado(e.target.value as LadoInvitacion)}
              options={[
                { value: 'vanesa', label: 'Vanesa' },
                { value: 'augusto', label: 'Augusto' },
              ]}
            />
          </div>
          <div className="sm:w-56">
            <Select
              label="Invita"
              value={permitePareja ? 'pareja' : 'solo'}
              onChange={(e) => setPermitePareja(e.target.value === 'pareja')}
              options={[
                { value: 'solo', label: 'Invitado' },
                { value: 'pareja', label: 'Invitado + pareja' },
              ]}
            />
          </div>
          <Button type="submit" disabled={creando}>
            {creando ? 'Creando…' : 'Crear link'}
          </Button>
        </form>
      </Card>

      {error ? <Text className="text-red-700">{error}</Text> : null}

      {loading ? (
        <Text muted>Cargando…</Text>
      ) : invitaciones.length === 0 ? (
        <Text muted>Todavía no hay invitaciones.</Text>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Lado</th>
                <th>Invita</th>
                <th>Respuesta</th>
                <th>Pareja</th>
                <th>Restricciones</th>
                <th>Respondió</th>
                <th className="dash-table-num">Personas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitaciones.map((inv) => {
                const editando = editandoId === inv.id && editDraft != null
                const puedeEnviar = !!inv.email?.trim()
                const enviando = enviandoId === inv.id
                return (
                  <tr key={inv.id} className={editando ? 'dash-table-row--editing' : undefined}>
                    <td>
                      {editando ? (
                        <Field
                          value={editDraft.nombre}
                          onChange={(e) => setEditDraft({ ...editDraft, nombre: e.target.value })}
                          aria-label="Nombre del invitado"
                        />
                      ) : (
                        <span className="font-medium text-bp-body">{inv.nombre}</span>
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <Field
                          type="email"
                          value={editDraft.email}
                          onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                          placeholder="email@ejemplo.com"
                          aria-label="Email"
                        />
                      ) : (
                        <div className="dash-email-cell">
                          <span>{inv.email || '—'}</span>
                          {inv.emailEnviadoAt ? (
                            <span className="dash-email-badge">Enviado {formatFecha(inv.emailEnviadoAt)}</span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <Select
                          value={editDraft.lado}
                          onChange={(e) => setEditDraft({ ...editDraft, lado: e.target.value as LadoInvitacion })}
                          options={[
                            { value: 'vanesa', label: 'Vanesa' },
                            { value: 'augusto', label: 'Augusto' },
                          ]}
                          aria-label="Lado"
                        />
                      ) : (
                        ladoLabel(inv.lado)
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <Select
                          value={editDraft.permitePareja ? 'pareja' : 'solo'}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, permitePareja: e.target.value === 'pareja' })
                          }
                          options={[
                            { value: 'solo', label: 'Invitado' },
                            { value: 'pareja', label: 'Invitado + pareja' },
                          ]}
                          aria-label="Invita"
                        />
                      ) : (
                        invitaLabel(inv)
                      )}
                    </td>
                    <td>
                      <span className={estadoClass(inv.estado)}>{estadoLabel(inv.estado)}</span>
                    </td>
                    <td>{(inv.permitePareja && inv.nombreAcompanante) || '—'}</td>
                    <td>{restriccionesLabel(inv)}</td>
                    <td>{formatFecha(inv.respondidoAt)}</td>
                    <td className="dash-table-num">{personasEnTabla(inv)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {editando ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              disabled={guardandoId === inv.id || !editDraft.nombre.trim()}
                              onClick={() => void onGuardarEditar(inv.id)}
                            >
                              {guardandoId === inv.id ? 'Guardando…' : 'Guardar'}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={guardandoId === inv.id}
                              onClick={onCancelarEditar}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button type="button" size="sm" variant="secondary" onClick={() => onEmpezarEditar(inv)}>
                              Editar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={!puedeEnviar || enviando}
                              onClick={() => void onEnviarEmail(inv.id)}
                            >
                              {enviando ? 'Enviando…' : inv.emailEnviadoAt ? 'Reenviar' : 'Enviar email'}
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => void onCopiar(inv.token)}>
                              {copiedToken === inv.token ? 'Copiado' : 'Copiar link'}
                            </Button>
                            <Button href={`/i/${inv.token}`} size="sm" variant="secondary">
                              Abrir
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => void onBorrar(inv.id)}>
                              Borrar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
