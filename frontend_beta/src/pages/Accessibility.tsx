import { useEffect, useState, useCallback } from 'react'
import { findingsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import {
  ShieldCheck, Plus, Save, Trash2, AlertCircle, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle as WarnIcon,
  Zap, Eye, Palette, BookCheck, Filter, X as XIcon
} from 'lucide-react'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface AccessibilityFinding {
  id: string
  testPlanId: string
  description: string
  category: string
  severity: string      // 'Critical' | 'High' | 'Medium' | 'Low'
  priority: string
  status: string        // 'Open' | 'Resolved' | 'Closed'
  tool: string          // 'WAVE' | 'Lighthouse' | 'Stark' | 'Observación manual'
  recommendation: string
  frequency: string
}

interface AuditGroup {
  tool: string
  findings: AccessibilityFinding[]
  resolved: number
}

// ── Constantes ────────────────────────────────────────────────────────────────

const ACCESSIBILITY_TOOLS = ['WAVE', 'Lighthouse', 'Stark', 'Observación manual']

const TOOL_META: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; desc: string }> = {
  WAVE: {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Eye size={18} />,
    desc: 'Errores estructurales y ARIA'
  },
  Lighthouse: {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Zap size={18} />,
    desc: 'Score de accesibilidad (0-100)'
  },
  Stark: {
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: <Palette size={18} />,
    desc: 'Contraste y daltonismo'
  },
  'Observación manual': {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <BookCheck size={18} />,
    desc: 'Navegación por teclado y lector de pantalla'
  }
}

const SEVERITY_STYLES: Record<string, { badge: string; bar: string; label: string }> = {
  Critical: { badge: 'bg-red-100 text-red-800 border-red-300', bar: 'bg-red-500', label: 'Crítica' },
  High:     { badge: 'bg-orange-100 text-orange-800 border-orange-300', bar: 'bg-orange-500', label: 'Alta' },
  Medium:   { badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', bar: 'bg-yellow-500', label: 'Media' },
  Low:      { badge: 'bg-green-100 text-green-800 border-green-300', bar: 'bg-green-500', label: 'Baja' },
}

const WCAG_LEVELS = ['A', 'AA', 'AAA', 'N/A']
const WCAG_CATEGORIES = [
  'Contraste de color', 'Estructura semántica', 'ARIA / Roles',
  'Navegación por teclado', 'Formularios', 'Imágenes / Alt text',
  'Foco visible', 'Landmarks', 'Otro'
]

// ── Formulario vacío ──────────────────────────────────────────────────────────

const makeEmpty = (planId: string) => ({
  testPlanId: planId,
  description: '',
  category: 'Contraste de color',
  severity: 'Medium',
  priority: 'Medium',
  status: 'Open',
  tool: 'WAVE',
  recommendation: '',
  frequency: '',
  wcagLevel: 'AA',
})

// ── Componente principal ──────────────────────────────────────────────────────

export default function Accessibility() {
  const [findings, setFindings]     = useState<AccessibilityFinding[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterTool, setFilterTool] = useState('')
  const [filterSev, setFilterSev]   = useState('')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccessibilityFinding | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm]             = useState(() => makeEmpty(''))

  const { addToast }                                     = useToast()
  const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchFindings = useCallback((planId: string) => {
    if (!planId) { setFindings([]); setLoading(false); return }
    setLoading(true)
    findingsApi.getByPlan(planId)
      .then(res => {
        // Filtrar solo los hallazgos de herramientas de accesibilidad
        const all: AccessibilityFinding[] = res.data ?? []
        setFindings(
          all.filter(f => ACCESSIBILITY_TOOLS.includes(f.tool))
        )
      })
      .catch(() => setFindings([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activePlanId) {
      setForm(makeEmpty(activePlanId))
      fetchFindings(activePlanId)
    } else {
      setFindings([])
      setLoading(false)
    }
  }, [activePlanId, fetchFindings])

  // ── Acciones ───────────────────────────────────────────────────────────────

  const resetForm = () => {
    setForm(makeEmpty(activePlanId))
    setEditId(null)
    setShowForm(false)
  }

  const openCreate = () => {
    setForm(makeEmpty(activePlanId))
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (f: AccessibilityFinding) => {
    setForm({
      testPlanId: f.testPlanId,
      description: f.description,
      category: f.category,
      severity: f.severity,
      priority: f.priority,
      status: f.status,
      tool: f.tool,
      recommendation: f.recommendation,
      frequency: f.frequency,
      wcagLevel: (f as any).wcagLevel ?? 'AA',
    })
    setEditId(f.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!form.testPlanId) { addToast('Selecciona un plan de prueba', 'error'); return }
    if (!form.description.trim()) { addToast('La descripción es requerida', 'error'); return }

    setIsSubmitting(true)
    try {
      const payload = {
        testPlanId: form.testPlanId,
        description: form.description,
        category: form.category,
        severity: form.severity,
        priority: form.priority,
        status: form.status,
        tool: form.tool,
        recommendation: form.recommendation,
        frequency: form.frequency,
      }
      if (editId) {
        await findingsApi.update(editId, payload)
        addToast('Hallazgo de accesibilidad actualizado', 'success')
      } else {
        await findingsApi.create(payload)
        addToast('Hallazgo de accesibilidad registrado', 'success')
      }
      resetForm()
      fetchFindings(activePlanId)
      refreshGates()
    } catch (err) {
      addToast(extractErrorMessage(err, 'Error al guardar el hallazgo'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkResolved = async (f: AccessibilityFinding) => {
    try {
      await findingsApi.update(f.id, {
        description: f.description, category: f.category, severity: f.severity,
        priority: f.priority, status: 'Resolved', tool: f.tool,
        recommendation: f.recommendation, frequency: f.frequency,
      })
      addToast('Hallazgo marcado como corregido ✓', 'success')
      fetchFindings(activePlanId)
    } catch (err) {
      addToast(extractErrorMessage(err, 'Error al actualizar'), 'error')
    }
  }

  const handleMarkOpen = async (f: AccessibilityFinding) => {
    try {
      await findingsApi.update(f.id, {
        description: f.description, category: f.category, severity: f.severity,
        priority: f.priority, status: 'Open', tool: f.tool,
        recommendation: f.recommendation, frequency: f.frequency,
      })
      addToast('Hallazgo reabierto', 'success')
      fetchFindings(activePlanId)
    } catch (err) {
      addToast(extractErrorMessage(err, 'Error al actualizar'), 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await findingsApi.delete(id)
      addToast('Hallazgo eliminado', 'success')
      fetchFindings(activePlanId)
      refreshGates()
    } catch (err) {
      addToast(extractErrorMessage(err, 'Error al eliminar'), 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────

  const total    = findings.length
  const resolved = findings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length
  const open     = total - resolved
  const critical = findings.filter(f => f.severity === 'Critical' && f.status !== 'Resolved').length

  // Grupos por herramienta
  const auditGroups: AuditGroup[] = ACCESSIBILITY_TOOLS
    .map(tool => {
      const fs = findings.filter(f => f.tool === tool)
      return { tool, findings: fs, resolved: fs.filter(f => f.status === 'Resolved' || f.status === 'Closed').length }
    })
    .filter(g => g.findings.length > 0)

  // Filtrado para la vista de lista plana
  const filtered = findings.filter(f => {
    if (filterTool && f.tool !== filterTool) return false
    if (filterSev && f.severity !== filterSev) return false
    return true
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 animate-rise">

      {/* ── Encabezado ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <ShieldCheck size={16} className="text-white" aria-hidden="true" />
            </div>
            <h2 className="text-[20px] font-semibold text-slate-900">
              Módulo de Accesibilidad
            </h2>
          </div>
          <p className="text-[13px] text-slate-500 ml-10">
            Auditorías con WAVE, Lighthouse y Stark — seguimiento de hallazgos y correcciones
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!activePlanId || isReadOnly}
          aria-label="Registrar nueva auditoría de accesibilidad"
        >
          <Plus size={14} aria-hidden="true" />
          Nueva Auditoría
        </button>
      </div>

      {/* ── Banner read-only ── */}
      {isReadOnly && activePlan && (
        <div className="readonly-banner" role="alert">
          <WarnIcon size={16} className="flex-shrink-0" aria-hidden="true" />
          <span>
            El plan "<strong>{activePlan.projectName}</strong>" está{' '}
            {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}.
            No se pueden crear ni modificar hallazgos.
          </span>
        </div>
      )}

      {/* ── Banner sin plan ── */}
      {!activePlanId && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <ShieldCheck size={32} className="text-blue-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[14px] text-blue-700 font-medium">
            Selecciona un plan de prueba para ver y registrar auditorías de accesibilidad
          </p>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {activePlanId && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="Resumen de auditorías de accesibilidad"
        >
          {/* Total */}
          <div className="kpi-card p-4 flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total hallazgos</p>
            <p className="text-[28px] font-bold text-slate-900 leading-none">{total}</p>
            <p className="text-[12px] text-slate-400">registrados</p>
          </div>

          {/* Abiertos */}
          <div className={`kpi-card p-4 flex flex-col gap-1.5 ${open > 0 ? 'border-l-4 border-orange-400' : ''}`}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
            <p className={`text-[28px] font-bold leading-none ${open > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
              {open}
            </p>
            <p className="text-[12px] text-slate-400">sin corregir</p>
          </div>

          {/* Corregidos */}
          <div className={`kpi-card p-4 flex flex-col gap-1.5 ${resolved > 0 ? 'border-l-4 border-emerald-400' : ''}`}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Corregidos</p>
            <p className={`text-[28px] font-bold leading-none ${resolved > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {resolved}
            </p>
            {total > 0 && (
              <div className="mt-1">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((resolved / total) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  {Math.round((resolved / total) * 100)}% resuelto
                </p>
              </div>
            )}
          </div>

          {/* Críticos */}
          <div className={`kpi-card p-4 flex flex-col gap-1.5 ${critical > 0 ? 'border-l-4 border-red-500' : ''}`}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Críticos abiertos</p>
            <p className={`text-[28px] font-bold leading-none ${critical > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {critical}
            </p>
            <p className="text-[12px] text-slate-400">
              {critical === 0 ? '¡Sin críticos pendientes!' : 'requieren atención'}
            </p>
          </div>
        </div>
      )}

      {/* ── Resumen por herramienta ── */}
      {auditGroups.length > 0 && (
        <section aria-label="Resumen por herramienta">
          <h3 className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Cobertura por herramienta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {auditGroups.map(g => {
              const meta = TOOL_META[g.tool] ?? TOOL_META['Observación manual']
              const pct = g.findings.length > 0
                ? Math.round((g.resolved / g.findings.length) * 100)
                : 0
              return (
                <div
                  key={g.tool}
                  className={`rounded-xl border p-4 flex flex-col gap-2 ${meta.bg} ${meta.border}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={meta.color} aria-hidden="true">{meta.icon}</span>
                    <span className={`text-[13px] font-bold ${meta.color}`}>{g.tool}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{meta.desc}</p>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-[22px] font-bold text-slate-800">{g.findings.length}</span>
                    <span className={`text-[12px] font-semibold ${meta.color}`}>
                      {g.resolved}/{g.findings.length} corregidos
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        g.tool === 'WAVE' ? 'bg-blue-500' :
                        g.tool === 'Lighthouse' ? 'bg-amber-500' :
                        g.tool === 'Stark' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Filtros ── */}
      {activePlanId && findings.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Filtros de hallazgos">
          <Filter size={13} className="text-slate-400" aria-hidden="true" />

          {/* filtro por herramienta */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold">Herramienta:</span>
            {['', ...ACCESSIBILITY_TOOLS].map(t => (
              <button
                key={t || 'all-tools'}
                onClick={() => setFilterTool(t)}
                className={`text-[12px] px-3 py-1.5 rounded-full border transition-all font-medium ${
                  filterTool === t
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                aria-pressed={filterTool === t}
                aria-label={`Filtrar por herramienta: ${t || 'Todas'}`}
              >
                {t || 'Todas'}
              </button>
            ))}
          </div>

          <span className="text-slate-200 hidden sm:block">|</span>

          {/* filtro por severidad */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold">Severidad:</span>
            {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
              <button
                key={s || 'all-sev'}
                onClick={() => setFilterSev(s)}
                className={`text-[12px] px-3 py-1.5 rounded-full border transition-all font-medium ${
                  filterSev === s
                    ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                aria-pressed={filterSev === s}
                aria-label={`Filtrar por severidad: ${s || 'Todas'}`}
              >
                {s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 ml-auto">
            {filtered.length} de {findings.length} hallazgos
          </span>
        </div>
      )}

      {/* ── Lista de hallazgos ── */}
      {loading ? (
        <div className="flex justify-center py-14" aria-label="Cargando hallazgos de accesibilidad">
          <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>

      ) : !activePlanId ? null

      : findings.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-indigo-400" aria-hidden="true" />
          </div>
          <h3 className="text-[16px] font-semibold text-slate-700 mb-1">Sin auditorías registradas</h3>
          <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
            Corra WAVE, Lighthouse o Stark sobre el proyecto evaluado y registre los hallazgos aquí.
          </p>
          {!isReadOnly && (
            <button onClick={openCreate} className="btn btn-primary mt-5 mx-auto">
              <Plus size={14} aria-hidden="true" /> Primera auditoría
            </button>
          )}
        </div>

      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-[14px] text-slate-500">No hay hallazgos que coincidan con los filtros seleccionados.</p>
          <button
            onClick={() => { setFilterTool(''); setFilterSev('') }}
            className="mt-3 text-[13px] text-blue-600 hover:underline font-medium"
          >
            Limpiar filtros
          </button>
        </div>

      ) : (
        <section aria-label="Lista de hallazgos de accesibilidad">
          {/* Vista agrupada por herramienta si no hay filtro de herramienta */}
          {!filterTool ? (
            <div className="flex flex-col gap-4">
              {ACCESSIBILITY_TOOLS.filter(t => filtered.some(f => f.tool === t)).map(tool => {
                const meta    = TOOL_META[tool] ?? TOOL_META['Observación manual']
                const toolFindings = filtered.filter(f => f.tool === tool)
                const isExpanded   = expandedTool === null || expandedTool === tool
                return (
                  <div key={tool} className={`rounded-2xl border overflow-hidden ${meta.border}`}>
                    {/* Tool header */}
                    <button
                      className={`w-full flex items-center justify-between px-5 py-3.5 ${meta.bg} hover:brightness-95 transition-all`}
                      onClick={() => setExpandedTool(expandedTool === tool ? null : tool)}
                      aria-expanded={isExpanded}
                      aria-controls={`section-${tool}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={meta.color} aria-hidden="true">{meta.icon}</span>
                        <span className={`text-[14px] font-bold ${meta.color}`}>{tool}</span>
                        <span className="text-[12px] font-medium bg-white/70 px-2 py-0.5 rounded-full text-slate-600 border border-white/80">
                          {toolFindings.length} hallazgo{toolFindings.length !== 1 ? 's' : ''}
                        </span>
                        {toolFindings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length > 0 && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ {toolFindings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length} corregido{toolFindings.filter(f => f.status === 'Resolved').length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronUp size={16} className={meta.color} aria-hidden="true" />
                        : <ChevronDown size={16} className={meta.color} aria-hidden="true" />
                      }
                    </button>

                    {/* Tool findings */}
                    {isExpanded && (
                      <div id={`section-${tool}`} className="divide-y divide-slate-100">
                        {toolFindings.map(f => (
                          <FindingRow
                            key={f.id}
                            finding={f}
                            isReadOnly={isReadOnly}
                            onEdit={() => openEdit(f)}
                            onDelete={() => setDeleteTarget(f)}
                            onMarkResolved={() => handleMarkResolved(f)}
                            onMarkOpen={() => handleMarkOpen(f)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            /* Vista plana cuando hay filtro */
            <div className="flex flex-col gap-3">
              {filtered.map(f => (
                <FindingRow
                  key={f.id}
                  finding={f}
                  isReadOnly={isReadOnly}
                  onEdit={() => openEdit(f)}
                  onDelete={() => setDeleteTarget(f)}
                  onMarkResolved={() => handleMarkResolved(f)}
                  onMarkOpen={() => handleMarkOpen(f)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══ Modal: Formulario de hallazgo de accesibilidad ══ */}
      <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Hallazgo de Accesibilidad' : 'Nuevo Hallazgo de Accesibilidad'}>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
          noValidate
          aria-label={editId ? 'Formulario de edición de hallazgo de accesibilidad' : 'Formulario de nuevo hallazgo de accesibilidad'}
        >
          {/* Plan (solo lectura) */}
          <div>
            <p className="form-label" id="label-plan-acc">Plan asignado</p>
            <div
              className="form-input bg-slate-50 text-slate-700 cursor-not-allowed"
              aria-labelledby="label-plan-acc"
              tabIndex={-1}
            >
              {activePlan?.projectName || 'Sin plan seleccionado'}
            </div>
          </div>

          {/* Herramienta y nivel WCAG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acc-tool" className="form-label">
                Herramienta <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(requerido)</span>
              </label>
              <select
                id="acc-tool"
                value={form.tool}
                onChange={e => setForm(f => ({ ...f, tool: e.target.value }))}
                className="form-input"
                required
                aria-required="true"
              >
                {ACCESSIBILITY_TOOLS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="acc-wcag" className="form-label">Criterio WCAG</label>
              <select
                id="acc-wcag"
                value={(form as any).wcagLevel ?? 'AA'}
                onChange={e => setForm(f => ({ ...f, wcagLevel: e.target.value }))}
                className="form-input"
              >
                {WCAG_LEVELS.map(l => (
                  <option key={l} value={l}>Nivel {l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="acc-description" className="form-label">
              Descripción del hallazgo <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only">(requerido)</span>
            </label>
            <textarea
              id="acc-description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="form-input"
              rows={3}
              required
              aria-required="true"
              placeholder="Ej: El botón &quot;Guardar&quot; tiene contraste insuficiente (ratio 2.1:1 sobre fondo blanco)"
            />
          </div>

          {/* Clasificación */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="form-label mb-3">Clasificación del hallazgo</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="acc-category" className="form-label">Categoría</label>
                <select
                  id="acc-category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="form-input"
                >
                  {WCAG_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="acc-severity" className="form-label">
                  Severidad <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(requerido)</span>
                </label>
                <select
                  id="acc-severity"
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                  className="form-input"
                  required
                  aria-required="true"
                >
                  <option value="Critical">Crítica</option>
                  <option value="High">Alta</option>
                  <option value="Medium">Media</option>
                  <option value="Low">Baja</option>
                </select>
              </div>
              <div>
                <label htmlFor="acc-status" className="form-label">Estado</label>
                <select
                  id="acc-status"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="form-input"
                >
                  <option value="Open">Abierta</option>
                  <option value="Resolved">Resuelta / Corregida</option>
                  <option value="Closed">Cerrada</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Recomendación */}
          <div>
            <label htmlFor="acc-recommendation" className="form-label">Corrección recomendada</label>
            <textarea
              id="acc-recommendation"
              value={form.recommendation}
              onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))}
              className="form-input"
              rows={2}
              placeholder="Ej: Cambiar color de texto a #1e40af para alcanzar ratio 7:1"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <Save size={14} aria-hidden="true" />
              {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar hallazgo')}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* ══ Modal: Confirmación de eliminación ══ */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar Hallazgo"
        maxWidth="480px"
      >
        <div className="p-5">
          <p className="text-[14px] text-slate-600 mb-5">
            ¿Estás seguro de que deseas eliminar este hallazgo de accesibilidad? Esta acción no se puede deshacer.
          </p>
          {deleteTarget && (
            <p className="text-[13px] bg-slate-50 rounded-lg px-3 py-2 text-slate-700 border border-slate-200 mb-5 italic">
              "{deleteTarget.description}"
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className="btn btn-danger"
            >
              <Trash2 size={14} aria-hidden="true" /> Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Subcomponente: Fila de hallazgo ──────────────────────────────────────────

interface FindingRowProps {
  finding: AccessibilityFinding
  isReadOnly: boolean
  onEdit: () => void
  onDelete: () => void
  onMarkResolved: () => void
  onMarkOpen: () => void
}

function FindingRow({ finding: f, isReadOnly, onEdit, onDelete, onMarkResolved, onMarkOpen }: FindingRowProps) {
  const sev  = SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.Medium
  const isDone = f.status === 'Resolved' || f.status === 'Closed'
  const meta   = TOOL_META[f.tool] ?? TOOL_META['Observación manual']

  return (
    <article
      className={`p-4 flex flex-col sm:flex-row sm:items-start gap-3 transition-colors ${
        isDone ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50/70'
      }`}
      aria-label={`Hallazgo: ${f.description}`}
    >
      {/* Barra lateral de severidad */}
      <div
        className={`w-1.5 rounded-full flex-shrink-0 self-stretch hidden sm:block ${sev.bar}`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`badge border text-[10px] ${sev.badge}`}>
            {f.severity === 'Critical' || f.severity === 'High'
              ? <AlertCircle size={10} aria-hidden="true" />
              : <AlertTriangle size={10} aria-hidden="true" />
            }
            {sev.label}
          </span>
          {f.category && (
            <span className="badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
              {f.category}
            </span>
          )}
          {isDone && (
            <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px]">
              <CheckCircle2 size={10} aria-hidden="true" /> Corregido
            </span>
          )}
          <span className={`badge text-[10px] ${meta.bg} ${meta.color} ${meta.border} border`}>
            {f.tool}
          </span>
        </div>

        {/* Descripción */}
        <p className={`text-[14px] font-medium leading-snug mb-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {f.description}
        </p>

        {/* Recomendación */}
        {f.recommendation && (
          <p className="text-[12px] text-slate-500 mt-1 flex items-start gap-1.5">
            <span className="text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true">→</span>
            {f.recommendation}
          </p>
        )}
      </div>

      {/* Acciones */}
      {!isReadOnly && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
          {isDone ? (
            <button
              onClick={onMarkOpen}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-medium"
              aria-label={`Reabrir hallazgo: ${f.description.substring(0, 40)}`}
            >
              Reabrir
            </button>
          ) : (
            <button
              onClick={onMarkResolved}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-semibold flex items-center gap-1"
              aria-label={`Marcar como corregido: ${f.description.substring(0, 40)}`}
            >
              <CheckCircle2 size={12} aria-hidden="true" /> Corregido
            </button>
          )}
          <button
            onClick={onEdit}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium"
            aria-label={`Editar hallazgo: ${f.description.substring(0, 40)}`}
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="text-[11px] p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            aria-label={`Eliminar hallazgo: ${f.description.substring(0, 40)}`}
          >
            <XIcon size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  )
}
