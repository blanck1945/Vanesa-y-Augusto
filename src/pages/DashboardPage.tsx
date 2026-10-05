import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CSV_PLANTILLA_INVITADOS,
  createInvitacion,
  deleteInvitacion,
  getSesionAdmin,
  confirmarImportacionCsv,
  previewInvitacionesCsv,
  getInvitePublicBaseUrl,
  invitacionLinkFor,
  listInvitaciones,
  resetRespuestaInvitacion,
  sortInvitaciones,
  type InvitacionSortDir,
  type InvitacionSortKey,
  sendInvitacionEmail,
  sendInvitacionesPendientes,
  updateInvitacion,
  type ImportacionCsvResultado,
  type Invitacion,
  type LadoInvitacion,
  type PreviewImportacionCsv,
} from '../data/api'
import { formatDateTimeArgentina } from '../lib/fechaArgentina'
import { invitacionPath } from '../lib/invitacionLink'
import { mensajeInvitacionWhatsApp, whatsappHref } from '../lib/invitacionState'
import {
  DashSortHeader,
  estadoClass,
  estadoLabel,
  invitaLabel,
  ladoLabel,
  personasConfirmadas,
  personasEnTabla,
  personasInvitadas,
  restriccionesLabel,
} from '../lib/dashboardInvitacionDisplay'
import { DashboardRatioPersonasSi } from '../components/dashboard/DashboardRatioPersonasSi'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Text } from '../components/ui/Text'

const OPCIONES_LADO: { value: LadoInvitacion; label: string }[] = [
  { value: 'vanesa', label: 'Vanesa' },
  { value: 'augusto', label: 'Augusto' },
  { value: 'patricia', label: 'Patricia' },
]

type EdicionInvitacion = {
  nombre: string
  lado: LadoInvitacion
  permitePareja: boolean
  email: string
  celular: string
}

function draftFromInvitacion(inv: Invitacion): EdicionInvitacion {
  return {
    nombre: inv.nombre,
    lado: inv.lado ?? 'vanesa',
    permitePareja: inv.permitePareja,
    email: inv.email ?? '',
    celular: inv.celular ?? '',
  }
}

type ResumenInvitadosLado = {
  invitaciones: number
  invitacionesSolo: number
  invitacionesConPareja: number
  personas: number
}

function resumenInvitadosPorLado(items: Invitacion[], lado: LadoInvitacion): ResumenInvitadosLado {
  const list = items.filter((i) => i.lado === lado)
  const invitacionesSolo = list.filter((i) => !i.permitePareja).length
  const invitacionesConPareja = list.filter((i) => i.permitePareja).length
  return {
    invitaciones: list.length,
    invitacionesSolo,
    invitacionesConPareja,
    personas: list.reduce((acc, i) => acc + personasInvitadas(i), 0),
  }
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
  const [reseteandoId, setReseteandoId] = useState<number | null>(null)
  const [tablaSortKey, setTablaSortKey] = useState<InvitacionSortKey>('nombre')
  const [tablaSortDir, setTablaSortDir] = useState<InvitacionSortDir>('asc')
  const csvInputRef = useRef<HTMLInputElement>(null)
  const nombreInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!usuario) return
    let cancelado = false
    void getInvitePublicBaseUrl()
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

  async function whatsappUrlFor(inv: Invitacion): Promise<string | null> {
    const celular = inv.celular?.trim()
    if (!celular) return null
    await getInvitePublicBaseUrl()
    const link = invitacionLinkFor(inv)
    return whatsappHref(celular, mensajeInvitacionWhatsApp(inv.nombre, link))
  }

  async function onCopiar(inv: Invitacion) {
    await getInvitePublicBaseUrl()
    const link = invitacionLinkFor(inv)
    try {
      await navigator.clipboard.writeText(link)
      setCopiedToken(inv.token)
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
        editDraft.celular.trim() || null,
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

  async function onResetearRespuesta(inv: Invitacion) {
    if (inv.estado === 'pendiente') return
    const ok = window.confirm(
      `¿Resetear la respuesta de «${inv.nombre}»? Volverá a «Sin respuesta» y podrá confirmar de nuevo desde su link.`,
    )
    if (!ok) return
    setReseteandoId(inv.id)
    setError(null)
    try {
      await resetRespuestaInvitacion(inv.id)
      const data = await listInvitaciones()
      setInvitaciones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setReseteandoId(null)
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

  const onTablaSort = (key: InvitacionSortKey) => {
    if (key === tablaSortKey) {
      setTablaSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setTablaSortKey(key)
      setTablaSortDir(key === 'respondidoAt' ? 'desc' : 'asc')
    }
  }

  const invitacionesOrdenadas = useMemo(
    () => sortInvitaciones(invitaciones, tablaSortKey, tablaSortDir),
    [invitaciones, tablaSortKey, tablaSortDir],
  )

  const confSi = invitaciones.filter((i) => i.estado === 'si').length
  const pendientes = invitaciones.filter((i) => i.estado === 'pendiente').length
  const talVez = invitaciones.filter((i) => i.estado === 'aun_no_lo_se').length
  const confNo = invitaciones.filter((i) => i.estado === 'no').length
  const totalPersonasInvitadas = invitaciones.reduce((acc, i) => acc + personasInvitadas(i), 0)
  const personasConfirmaronSi = invitaciones.reduce((acc, i) => acc + personasConfirmadas(i), 0)
  const emailsPendientes = invitaciones.filter((i) => i.email && !i.emailEnviadoAt).length

  const resumenVanesa = useMemo(
    () => resumenInvitadosPorLado(invitaciones, 'vanesa'),
    [invitaciones],
  )
  const resumenAugusto = useMemo(
    () => resumenInvitadosPorLado(invitaciones, 'augusto'),
    [invitaciones],
  )
  const resumenPatricia = useMemo(
    () => resumenInvitadosPorLado(invitaciones, 'patricia'),
    [invitaciones],
  )

  return (
    <div className="dash-panel mx-auto flex flex-col gap-6">
      <div>
        <Text as="h1" className="text-2xl text-bp-body">
          Invitaciones
        </Text>
        <Text muted className="mt-1">
          Hola, {usuario.nombre}. Creá invitados, importá CSV/Excel o mandá invitaciones por email.
        </Text>
      </div>

      {!loading && invitaciones.length > 0 ? <DashboardRatioPersonasSi invitaciones={invitaciones} /> : null}

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
          <Text className="text-2xl text-bp-body">
            {personasConfirmaronSi}
            <span className="text-lg text-bp-muted">/{totalPersonasInvitadas}</span>
          </Text>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <Text muted>Lado Vanesa</Text>
          <Text className="text-2xl text-bp-body">{resumenVanesa.personas}</Text>
          <Text muted className="text-sm">
            {resumenVanesa.personas === 1 ? 'persona invitada' : 'personas invitadas'} ·{' '}
            {resumenVanesa.invitaciones}{' '}
            {resumenVanesa.invitaciones === 1 ? 'invitación' : 'invitaciones'}
          </Text>
          <Text muted className="mt-2 text-sm">
            {resumenVanesa.invitacionesSolo} solo
            {resumenVanesa.invitacionesSolo === 1 ? '' : 's'} · {resumenVanesa.invitacionesConPareja}{' '}
            con pareja
          </Text>
        </Card>
        <Card className="p-4">
          <Text muted>Lado Augusto</Text>
          <Text className="text-2xl text-bp-body">{resumenAugusto.personas}</Text>
          <Text muted className="text-sm">
            {resumenAugusto.personas === 1 ? 'persona invitada' : 'personas invitadas'} ·{' '}
            {resumenAugusto.invitaciones}{' '}
            {resumenAugusto.invitaciones === 1 ? 'invitación' : 'invitaciones'}
          </Text>
          <Text muted className="mt-2 text-sm">
            {resumenAugusto.invitacionesSolo} solo
            {resumenAugusto.invitacionesSolo === 1 ? '' : 's'} · {resumenAugusto.invitacionesConPareja}{' '}
            con pareja
          </Text>
        </Card>
        <Card className="p-4">
          <Text muted>Lado Patricia</Text>
          <Text className="text-2xl text-bp-body">{resumenPatricia.personas}</Text>
          <Text muted className="text-sm">
            {resumenPatricia.personas === 1 ? 'persona invitada' : 'personas invitadas'} ·{' '}
            {resumenPatricia.invitaciones}{' '}
            {resumenPatricia.invitaciones === 1 ? 'invitación' : 'invitaciones'}
          </Text>
          <Text muted className="mt-2 text-sm">
            {resumenPatricia.invitacionesSolo} solo
            {resumenPatricia.invitacionesSolo === 1 ? '' : 's'} · {resumenPatricia.invitacionesConPareja}{' '}
            con pareja
          </Text>
        </Card>
      </div>

      {talVez > 0 ? (
        <Text muted className="text-sm">
          Todavía no saben: {talVez}
        </Text>
      ) : null}

      <Card className="p-5 dash-import-card">
        <Text as="h2" className="mb-2 text-lg text-bp-body">
          Importar CSV o Excel
        </Text>
        <Text muted className="mb-3 text-sm">
          Archivo <span className="font-mono">.csv</span> o <span className="font-mono">.xlsx</span> (primera hoja).
          Columnas: <span className="font-mono">nombre, email, lado, invita</span> — lado: vanesa, augusto o patricia;
          invita: si/no
          o pareja/solo.
        </Text>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={csvInputRef}
            id="dash-csv-file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="dash-csv-input-hidden"
            disabled={csvPreviewLoading || importando}
            onChange={onCsvSelected}
          />
          <label
            htmlFor="dash-csv-file"
            className={`dash-csv-picker${csvPreviewLoading || importando ? ' dash-csv-picker--busy' : ''}`}
          >
            {csvPreviewLoading ? 'Analizando archivo…' : 'Elegir CSV o Excel'}
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
              options={OPCIONES_LADO}
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
                <DashSortHeader label="Nombre" sortKey="nombre" activeKey={tablaSortKey} dir={tablaSortDir} onSort={onTablaSort} />
                <DashSortHeader label="Email" sortKey="email" activeKey={tablaSortKey} dir={tablaSortDir} onSort={onTablaSort} />
                <th>Celular</th>
                <DashSortHeader label="Lado" sortKey="lado" activeKey={tablaSortKey} dir={tablaSortDir} onSort={onTablaSort} />
                <th>Invita</th>
                <th>Respuesta</th>
                <th>Pareja</th>
                <th>Restricciones</th>
                <DashSortHeader
                  label="Respondió"
                  sortKey="respondidoAt"
                  activeKey={tablaSortKey}
                  dir={tablaSortDir}
                  onSort={onTablaSort}
                />
                <th className="dash-table-num">Personas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitacionesOrdenadas.map((inv) => {
                const editando = editandoId === inv.id && editDraft != null
                const puedeEnviar = !!inv.email?.trim()
                const puedeWhatsApp = !!inv.celular?.trim()
                const enviando = enviandoId === inv.id
                const reseteando = reseteandoId === inv.id
                const tieneRespuesta = inv.estado !== 'pendiente'
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
                            <span className="dash-email-badge">
                              Enviado {formatDateTimeArgentina(inv.emailEnviadoAt)}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <Field
                          type="tel"
                          value={editDraft.celular}
                          onChange={(e) => setEditDraft({ ...editDraft, celular: e.target.value })}
                          placeholder="54911…"
                          aria-label="Celular WhatsApp"
                        />
                      ) : (
                        inv.celular || '—'
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <Select
                          value={editDraft.lado}
                          onChange={(e) => setEditDraft({ ...editDraft, lado: e.target.value as LadoInvitacion })}
                          options={OPCIONES_LADO}
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
                    <td>{formatDateTimeArgentina(inv.respondidoAt)}</td>
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
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={!puedeWhatsApp}
                              onClick={() => {
                                void whatsappUrlFor(inv).then((url) => {
                                  if (url) window.open(url, '_blank', 'noopener,noreferrer')
                                  else setError('Agregá un celular válido para WhatsApp')
                                })
                              }}
                            >
                              WhatsApp
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => void onCopiar(inv)}>
                              {copiedToken === inv.token ? 'Copiado' : 'Copiar link'}
                            </Button>
                            {tieneRespuesta ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={reseteando}
                                onClick={() => void onResetearRespuesta(inv)}
                              >
                                {reseteando ? 'Reseteando…' : 'Resetear respuesta'}
                              </Button>
                            ) : null}
                            <Button href={invitacionPath(inv)} size="sm" variant="secondary">
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
