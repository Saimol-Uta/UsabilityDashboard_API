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
    color: 'tool-wave-color',
    bg: 'tool-wave-bg',
    border: 'tool-wave-border',
    icon: <Eye size={18} />,
    desc: 'Errores estructurales y ARIA'
  },
  Lighthouse: {
    color: 'tool-lighthouse-color',
    bg: 'tool-lighthouse-bg',
    border: 'tool-lighthouse-border',
    icon: <Zap size={18} />,
    desc: 'Score de accesibilidad (0-100)'
  },
  Stark: {
    color: 'tool-stark-color',
    bg: 'tool-stark-bg',
    border: 'tool-stark-border',
    icon: <Palette size={18} />,
    desc: 'Contraste y daltonismo'
  },
  'Observación manual': {
    color: 'tool-manual-color',
    bg: 'tool-manual-bg',
    border: 'tool-manual-border',
    icon: <BookCheck size={18} />,
    desc: 'Navegación por teclado y lector de pantalla'
  }
}

const SEVERITY_STYLES: Record<string, { badge: string; bar: string; label: string }> = {
  Critical: { badge: 'badge-critica', bar: 'acc-row-bar--critical', label: 'Crítica' },
  High:     { badge: 'badge-alta', bar: 'acc-row-bar--high', label: 'Alta' },
  Medium:   { badge: 'badge-media', bar: 'acc-row-bar--medium', label: 'Media' },
  Low:      { badge: 'badge-baja', bar: 'acc-row-bar--low', label: 'Baja' },
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
    <div className="page-container animate-rise" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* ── Encabezado ── */}
      <div className="page-header">
        <div>
          <div className="page-header-title-container">
            <div className="page-header-icon-box">
              <ShieldCheck size={20} className="page-header-icon text-white" aria-hidden="true" />
            </div>
            <h2 className="page-header-title">
              Módulo de Accesibilidad
            </h2>
          </div>
          <p className="page-header-subtitle">
            Auditorías con WAVE, Lighthouse y Stark — seguimiento de hallazgos y correcciones
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
          disabled={!activePlanId || isReadOnly}
          aria-label="Registrar nueva auditoría de accesibilidad"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Nueva Auditoría</span>
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
        <div className="warning-banner text-center" style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary-border)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldCheck size={32} className="mx-auto mb-3" aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
            Selecciona un plan de prueba para ver y registrar auditorías de accesibilidad
          </p>
        </div>
      )}

      {/* ── KPI Cards con Metáforas ── */}
      {activePlanId && (
        <div
          className="dashboard-kpi-row"
          role="region"
          aria-label="Resumen de auditorías de accesibilidad"
        >
          {/* KPI 1 — Radar de Barreras */}
          <div className="kpi-card kpi-card-meta">
            {/* Decoración de radar animado */}
            <div className="radar-container">
              <div className="radar-ring-outer radar-ping" />
              <div className="radar-ring-inner" />
            </div>
            <div className="kpi-card-meta-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="kpi-card-meta-icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
              <p className="kpi-card-meta-title">
                Radar de Barreras
              </p>
            </div>
            <p
              className="kpi-card-meta-value"
              aria-label={`${total} hallazgos de accesibilidad registrados en total`}
            >
              {total}
            </p>
            <p className="kpi-card-meta-sublabel">
              barreras detectadas
            </p>
            <p className="kpi-card-meta-footnote">
              Como un radar, las herramientas revelan obstáculos ocultos
            </p>
          </div>

          {/* KPI 2 — Puertas Cerradas */}
          <div className={`kpi-card kpi-card-meta ${open > 0 ? 'kpi-card-meta--alert-open' : ''}`}>
            <div className="kpi-card-meta-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="kpi-card-meta-icon" style={open > 0 ? { color: 'var(--color-warning)' } : undefined}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="15" cy="12" r="1.2" fill="currentColor"/>
              </svg>
              <p className="kpi-card-meta-title">
                Puertas Cerradas
              </p>
            </div>
            <p
              className="kpi-card-meta-value"
              aria-label={`${open} hallazgos de accesibilidad pendientes de corrección`}
              style={open > 0 ? { color: 'var(--color-warning-text)' } : undefined}
            >
              {open}
            </p>
            <p className="kpi-card-meta-sublabel">
              {open === 0 ? '¡Sin accesos bloqueados!' : 'accesos bloqueados'}
            </p>
            <p className="kpi-card-meta-footnote">
              Barreras que aún impiden el acceso a todos los usuarios
            </p>
          </div>

          {/* KPI 3 — Rutas Habilitadas */}
          <div className={`kpi-card kpi-card-meta ${resolved > 0 ? 'kpi-card-meta--alert-resolved' : ''}`}>
            <div className="kpi-card-meta-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="kpi-card-meta-icon" style={resolved > 0 ? { color: 'var(--color-success)' } : undefined}>
                <path d="M3 20 L21 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 4 L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M21 4 L15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
                <circle cx="13" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
              </svg>
              <p className="kpi-card-meta-title">
                Rutas Habilitadas
              </p>
            </div>
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
              <p
                className="kpi-card-meta-value"
                aria-label={`${resolved} hallazgos corregidos de ${total} totales`}
                style={resolved > 0 ? { color: 'var(--color-success-text)' } : undefined}
              >
                {resolved}
              </p>
              {total > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <div style={{ height: '8px', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{ height: '100%', backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-full)', width: `${Math.round((resolved / total) * 100)}%`, transition: 'width 0.7s ease' }}
                      role="progressbar"
                      aria-valuenow={Math.round((resolved / total) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Porcentaje de barreras eliminadas"
                    />
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success-text)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                    {Math.round((resolved / total) * 100)}% del camino habilitado
                  </p>
                </div>
              ) : (
                <p className="kpi-card-meta-sublabel">accesos desbloqueados</p>
              )}
            </div>
            <p className="kpi-card-meta-footnote">
              Rampas construidas — acceso garantizado para todos
            </p>
          </div>

          {/* KPI 4 — Señales de Alerta */}
          <div className={`kpi-card kpi-card-meta ${critical > 0 ? 'kpi-card-meta--alert-critical' : ''}`}>
            {critical > 0 && (
              <div className="absolute top-3 right-3 w-3 h-3" style={{ position: 'absolute', top: '12px', right: '12px', width: '12px', height: '12px' }}>
                <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-error)', opacity: 0.75 }} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" style={{ position: 'relative', display: 'inline-flex', borderRadius: 'var(--radius-full)', height: '12px', width: '12px', backgroundColor: 'var(--color-error)' }} />
              </div>
            )}
            <div className="kpi-card-meta-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="kpi-card-meta-icon" style={critical > 0 ? { color: 'var(--color-error)' } : undefined}>
                <path d="M12 3 L22 20 H2 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <line x1="12" y1="10" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="18" r="1" fill="currentColor"/>
              </svg>
              <p className="kpi-card-meta-title">
                Alertas Activas
              </p>
            </div>
            <p
              className="kpi-card-meta-value"
              aria-label={`${critical} hallazgos críticos de accesibilidad sin corregir`}
              style={critical > 0 ? { color: 'var(--color-error-text)' } : undefined}
            >
              {critical}
            </p>
            <p className="kpi-card-meta-sublabel">
              {critical === 0 ? '¡Vía despejada!' : 'bloqueos críticos activos'}
            </p>
            <p className="kpi-card-meta-footnote">
              Señales de peligro que requieren acción inmediata
            </p>
          </div>
        </div>
      )}

      {/* ── Resumen por herramienta ── */}
      {activePlanId && auditGroups.length > 0 && (
        <section aria-label="Resumen por herramienta" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Cobertura por herramienta
          </h3>
          <div className="form-grid-4">
            {auditGroups.map(g => {
              const meta = TOOL_META[g.tool] ?? TOOL_META['Observación manual']
              const pct = g.findings.length > 0
                ? Math.round((g.resolved / g.findings.length) * 100)
                : 0
              return (
                <div
                  key={g.tool}
                  className={`card-layout ${meta.bg} ${meta.border}`}
                  style={{ borderWidth: '1px', borderStyle: 'solid', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className={meta.color} aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>{meta.icon}</span>
                    <span className={meta.color} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }}>{g.tool}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0 }}>{meta.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>{g.findings.length}</span>
                    <span className={meta.color} style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {g.resolved}/{g.findings.length} corregidos
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.7s ease',
                        width: `${pct}%`,
                        backgroundColor:
                          g.tool === 'WAVE' ? 'var(--color-primary)' :
                          g.tool === 'Lighthouse' ? 'var(--color-warning)' :
                          g.tool === 'Stark' ? '#6b21a8' : 'var(--color-success)'
                      }}
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
        <div className="card-layout" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', padding: 'var(--space-3) var(--space-4)' }} role="toolbar" aria-label="Filtros de hallazgos">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Filter size={14} className="text-slate-400" aria-hidden="true" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>Herramienta:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
              {['', ...ACCESSIBILITY_TOOLS].map(t => (
                <button
                  key={t || 'all-tools'}
                  onClick={() => setFilterTool(t)}
                  className={`btn ${filterTool === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-3)' }}
                  aria-pressed={filterTool === t}
                  aria-label={`Filtrar por herramienta: ${t || 'Todas'}`}
                >
                  {t || 'Todas'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>Severidad:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
              {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                <button
                  key={s || 'all-sev'}
                  onClick={() => setFilterSev(s)}
                  className={`btn ${filterSev === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-3)' }}
                  aria-pressed={filterSev === s}
                  aria-label={`Filtrar por severidad: ${s || 'Todas'}`}
                >
                  {s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {filtered.length} de {findings.length} hallazgos
          </span>
        </div>
      )}

      {/* ── Lista de hallazgos ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12) 0' }} aria-label="Cargando hallazgos de accesibilidad">
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }} />
        </div>

      ) : !activePlanId ? null

      : findings.length === 0 ? (
        <div className="card-layout" style={{ borderStyle: 'dashed', borderWidth: '2px', padding: 'var(--space-12) var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-2xl)', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', marginTop: 0 }}>Sin auditorías registradas</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center', marginBottom: 'var(--space-4)', marginTop: 0 }}>
            Corra WAVE, Lighthouse o Stark sobre el proyecto evaluado y registre los hallazgos aquí.
          </p>
          {!isReadOnly && (
            <button onClick={openCreate} className="btn btn-primary">
              <Plus size={16} aria-hidden="true" />
              <span>Primera auditoría</span>
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-layout" style={{ borderStyle: 'dashed', borderWidth: '1px', padding: 'var(--space-8)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>No hay hallazgos que coincidan con los filtros seleccionados.</p>
          <button
            onClick={() => { setFilterTool(''); setFilterSev('') }}
            className="btn btn-link btn-sm"
            style={{ marginTop: 'var(--space-2)', color: 'var(--color-primary)' }}
          >
            Limpiar filtros
          </button>
        </div>

      ) : (
        <section aria-label="Lista de hallazgos de accesibilidad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Vista agrupada por herramienta si no hay filtro de herramienta */}
          {!filterTool ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {ACCESSIBILITY_TOOLS.filter(t => filtered.some(f => f.tool === t)).map(tool => {
                const meta    = TOOL_META[tool] ?? TOOL_META['Observación manual']
                const toolFindings = filtered.filter(f => f.tool === tool)
                const isExpanded   = expandedTool === null || expandedTool === tool
                return (
                  <div key={tool} className={`card-layout ${meta.border}`} style={{ borderWidth: '1px', borderStyle: 'solid', overflow: 'hidden', padding: 0 }}>
                    {/* Tool header */}
                    <button
                      className={`${meta.bg} ${meta.color}`}
                      style={{ width: '100%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                      onClick={() => setExpandedTool(expandedTool === tool ? null : tool)}
                      aria-expanded={isExpanded}
                      aria-controls={`section-${tool.replace(/\s+/g, '-')}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>{meta.icon}</span>
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{tool}</span>
                        <span className="badge badge-pendiente" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                          {toolFindings.length} hallazgo{toolFindings.length !== 1 ? 's' : ''}
                        </span>
                        {toolFindings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length > 0 && (
                          <span className="badge badge-completada">
                            ✓ {toolFindings.filter(f => f.status === 'Resolved' || f.status === 'Closed').length} corregido{toolFindings.filter(f => f.status === 'Resolved').length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronUp size={16} aria-hidden="true" />
                        : <ChevronDown size={16} aria-hidden="true" />
                      }
                    </button>

                    {/* Tool findings */}
                    {isExpanded && (
                      <div id={`section-${tool.replace(/\s+/g, '-')}`} style={{ display: 'flex', flexDirection: 'column' }} className="divide-y">
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
            <div className="card-layout divide-y" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
          className="form-layout"
          noValidate
          aria-label={editId ? 'Formulario de edición de hallazgo de accesibilidad' : 'Formulario de nuevo hallazgo de accesibilidad'}
        >
          <div className="modal-body">
            {/* Plan (solo lectura) */}
            <div className="form-group">
              <p className="form-label" id="label-plan-acc">Plan asignado</p>
              <div
                className="form-input"
                aria-labelledby="label-plan-acc"
                tabIndex={-1}
                style={{ backgroundColor: 'var(--neutral-50)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
              >
                {activePlan?.projectName || 'Sin plan seleccionado'}
              </div>
            </div>

            {/* Herramienta y nivel WCAG */}
            <div className="form-grid-2">
              <div className="form-group">
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
              <div className="form-group">
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
            <div className="form-group">
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
                placeholder="Ej: El botón Guardar tiene contraste insuficiente (ratio 2.1:1 sobre fondo blanco)"
              />
            </div>

            {/* Clasificación */}
            <fieldset className="form-fieldset" style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Clasificación del hallazgo</legend>
              <div className="form-grid-3-acc">
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
            <div className="form-group">
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
          </div>

          {/* Acciones */}
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <Save size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar hallazgo')}</span>
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
        <div className="modal-body">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', marginTop: 0 }}>
            ¿Estás seguro de que deseas eliminar este hallazgo de accesibilidad? Esta acción no se puede deshacer.
          </p>
          {deleteTarget && (
            <p style={{ fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginBottom: 'var(--space-4)', fontStyle: 'italic', marginTop: 0 }}>
              "{deleteTarget.description}"
            </p>
          )}
        </div>
        <div className="modal-footer">
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
            <Trash2 size={16} aria-hidden="true" />
            <span>Eliminar</span>
          </button>
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
      className={`acc-finding-article ${
        isDone ? 'acc-finding-article--resolved' : 'acc-finding-article--pending'
      }`}
      aria-label={`Hallazgo: ${f.description}`}
    >
      {/* Barra lateral de severidad */}
      <div
        className={`acc-row-bar ${sev.bar}`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className={`badge ${sev.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            {f.severity === 'Critical' || f.severity === 'High'
              ? <AlertCircle size={10} aria-hidden="true" />
              : <AlertTriangle size={10} aria-hidden="true" />
            }
            <span>{sev.label}</span>
          </span>
          {f.category && (
            <span className="badge badge-pendiente">
              {f.category}
            </span>
          )}
          {isDone && (
            <span className="badge badge-completada" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <CheckCircle2 size={10} aria-hidden="true" />
              <span>Corregido</span>
            </span>
          )}
          <span className={`badge ${meta.bg} ${meta.color} ${meta.border}`} style={{ borderWidth: '1px', borderStyle: 'solid' }}>
            {f.tool}
          </span>
        </div>

        {/* Descripción */}
        <p
          style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.5, margin: 0 }}
          className={isDone ? 'text-slate-400 line-through' : 'text-slate-800'}
        >
          {f.description}
        </p>

        {/* Recomendación */}
        {f.recommendation && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true">→</span>
            <span>{f.recommendation}</span>
          </p>
        )}
      </div>

      {/* Acciones */}
      {!isReadOnly && (
        <div className="acc-finding-actions">
          {isDone ? (
            <button
              onClick={onMarkOpen}
              className="btn btn-secondary btn-sm"
              aria-label={`Reabrir hallazgo: ${f.description.substring(0, 40)}`}
            >
              Reabrir
            </button>
          ) : (
            <button
              onClick={onMarkResolved}
              className="btn btn-success btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
              aria-label={`Marcar como corregido: ${f.description.substring(0, 40)}`}
            >
              <CheckCircle2 size={12} aria-hidden="true" />
              <span>Corregido</span>
            </button>
          )}
          <button
            onClick={onEdit}
            className="btn btn-primary btn-sm"
            aria-label={`Editar hallazgo: ${f.description.substring(0, 40)}`}
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="btn btn-danger btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label={`Eliminar hallazgo: ${f.description.substring(0, 40)}`}
          >
            <XIcon size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  )
}
