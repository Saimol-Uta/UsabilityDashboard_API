import { useEffect, useState } from 'react'
import { findingsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, Trash2, Search, AlertCircle, AlertTriangle, ArrowRight, Filter, XCircle, CheckCircle2, Sparkles } from 'lucide-react'

export default function Findings() {
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [findingToDelete, setFindingToDelete] = useState<any | null>(null)
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const emptyForm = {
        testPlanId: '', description: '', frequency: '', severity: 'Medium',
        priority: 'Medium', status: 'Open', category: '', recommendation: '', tool: 'WAVE'
    }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchFindings = (planId: string) => {
        if (!planId) { setFindings([]); setLoading(false); return }
        setLoading(true)
        findingsApi.getByPlan(planId).then(res => setFindings(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => {
        if (activePlanId) {
            setForm(f => ({ ...f, testPlanId: activePlanId }))
            fetchFindings(activePlanId)
        } else {
            setFindings([])
            setLoading(false)
        }
    }, [activePlanId])

    useEffect(() => {
        const handleFindingsUpdate = () => {
            if (activePlanId) {
                fetchFindings(activePlanId)
            }
        }
        window.addEventListener('findings-updated', handleFindingsUpdate)
        return () => window.removeEventListener('findings-updated', handleFindingsUpdate)
    }, [activePlanId])

    const resetForm = () => {
        setForm({ ...emptyForm, testPlanId: activePlanId })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (f: any) => {
        setForm({
            testPlanId: f.testPlanId, description: f.description, frequency: f.frequency,
            severity: f.severity, priority: f.priority, status: f.status ?? 'Open',
            category: f.category, recommendation: f.recommendation, tool: f.tool
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
            if (editId) {
                await findingsApi.update(editId, {
                    description: form.description,
                    frequency: form.frequency,
                    severity: form.severity,
                    priority: form.priority,
                    status: form.status,
                    recommendation: form.recommendation,
                    category: form.category,
                    tool: form.tool,
                })
                addToast('Hallazgo actualizado', 'success')
            } else {
                await findingsApi.create({
                    testPlanId: form.testPlanId,
                    description: form.description,
                    frequency: form.frequency,
                    severity: form.severity,
                    priority: form.priority,
                    recommendation: form.recommendation,
                    category: form.category,
                    tool: form.tool,
                })
                addToast('Hallazgo creado', 'success')
            }
            resetForm();
            if (form.testPlanId) fetchFindings(form.testPlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar el hallazgo'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await findingsApi.delete(id)
            addToast('Hallazgo eliminado', 'success')
            if (activePlanId) fetchFindings(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar el hallazgo'), 'error')
        } finally {
            setFindingToDelete(null)
        }
    }

    const filtered = findings.filter(f =>
        filter === '' || f.severity === filter
    )

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Síntesis de Hallazgos</h2>
                    <p className="page-header-subtitle">Problemas de usabilidad detectados con frecuencia, severidad y recomendaciones</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('copilot-trigger', {
                                detail: {
                                    action: 'suggest-findings',
                                    projectName: activePlan?.projectName,
                                    product: activePlan?.product,
                                    evaluatedModule: activePlan?.evaluatedModule,
                                    objective: activePlan?.objective
                                }
                            }))
                        }}
                        disabled={!activePlanId || isReadOnly}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        aria-label="Sugerir hallazgos con IA"
                    >
                        <Sparkles size={16} aria-hidden="true" style={{ color: 'var(--color-primary)' }} /> Sugerir hallazgos con IA
                    </button>

                    <button onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId }); setShowForm(true) }}
                        className="btn btn-primary"
                        disabled={!activePlanId || isReadOnly}
                        aria-label="Nuevo Hallazgo">
                        <Plus size={18} aria-hidden="true" /> Nuevo Hallazgo
                    </button>
                </div>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner" role="status">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar hallazgos.</span>
                </div>
            )}

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Filter size={14} style={{ color: 'var(--text-disabled)' }} aria-hidden="true" />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-semibold)' }}>Severidad:</span>
                {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`tab-pill ${filter === s ? 'is-active' : ''}`}
                        aria-label={`Filtrar por severidad: ${s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}`}>
                        {s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}
                    </button>
                ))}
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-disabled)', marginLeft: 'auto' }}>{filtered.length} de {findings.length} hallazgos</span>
            </div>

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}>
                <form onSubmit={handleSubmit} className="form-layout" noValidate aria-label={editId ? 'Formulario de edición de hallazgo' : 'Formulario de nuevo hallazgo'}>
                    {/* Plan as read-only text */}
                    <div>
                        <p className="form-label" id="label-plan">Plan asignado</p>
                        <div className="form-input form-input--disabled" style={{ cursor: 'not-allowed', background: 'var(--neutral-100)', color: 'var(--text-muted)' }} aria-labelledby="label-plan" tabIndex={-1}>
                            {activePlan?.projectName || 'Sin plan seleccionado'}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="findingDescription" className="form-label">
                            Descripción <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                            <span className="sr-only">(requerido)</span>
                        </label>
                        <textarea
                            id="findingDescription"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="form-input"
                            rows={3}
                            required
                            aria-required="true"
                        />
                    </div>

                    {/* ACCESIBILIDAD: fieldset agrupa campos relacionados semánticamente (WCAG 1.3.1) */}
                    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                        <legend className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Clasificación del hallazgo</legend>
                        <div className="form-grid-4">
                            <div>
                                <label htmlFor="findingSeverity" className="form-label">
                                    Severidad <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                                    <span className="sr-only">(requerido)</span>
                                </label>
                                <select id="findingSeverity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="form-input" required aria-required="true">
                                    <option value="Critical">Crítica</option>
                                    <option value="High">Alta</option>
                                    <option value="Medium">Media</option>
                                    <option value="Low">Baja</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="findingPriority" className="form-label">
                                    Prioridad <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                                    <span className="sr-only">(requerido)</span>
                                </label>
                                <select id="findingPriority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input" required aria-required="true">
                                    <option value="High">Alta</option>
                                    <option value="Medium">Media</option>
                                    <option value="Low">Baja</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="findingStatus" className="form-label">
                                    Estado <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
                                    <span className="sr-only">(requerido)</span>
                                </label>
                                <select id="findingStatus" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input" required aria-required="true">
                                    <option value="Open">Abierta</option>
                                    <option value="Resolved">Resuelta</option>
                                    <option value="Closed">Cerrada</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="findingFrequency" className="form-label">Frecuencia</label>
                                <input id="findingFrequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="form-input" placeholder="Ej: 2/3" />
                            </div>
                        </div>
                    </fieldset>

                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="findingCategory" className="form-label">Categoría</label>
                            <input id="findingCategory" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input" placeholder="Ej: Formularios" />
                        </div>
                        <div>
                            <label htmlFor="findingTool" className="form-label">Herramienta</label>
                            <select id="findingTool" value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} className="form-input">
                                <option value="WAVE">WAVE</option>
                                <option value="Lighthouse">Lighthouse</option>
                                <option value="Stark">Stark</option>
                                <option value="WAVE + Lighthouse">WAVE + Lighthouse</option>
                                <option value="Observación manual">Observación manual</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="findingRecommendation" className="form-label">Recomendación</label>
                        <textarea id="findingRecommendation" value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} className="form-input" rows={3} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
                            <Save size={16} aria-hidden="true" /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary text-center" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Findings Cards */}
            {loading ? (
                <div className="dashboard-loader">
                    <div className="dashboard-spinner" aria-label="Cargando..." />
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state-card">
                    <Search size={48} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin hallazgos</h3>
                    <p className="empty-state-subtitle">No se encontraron hallazgos que coincidan con el filtro seleccionado.</p>
                </div>
            ) : (
                <div className="page-grid-2">
                    {filtered.map((finding: any) => (
                        <div key={finding.id} className="finding-card">
                            <div className={`finding-card-bar finding-card-bar--${finding.severity === 'Critical' ? 'critical' : finding.severity === 'High' ? 'high' : finding.severity === 'Medium' ? 'medium' : 'low'}`} />
                            <div className="finding-card-body">
                                <div className="finding-card-header">
                                    <div className="finding-card-meta-list">
                                        {finding.category && <span className="finding-card-meta-pill finding-card-meta-pill--blue">{finding.category}</span>}
                                        <span className="finding-card-meta-pill finding-card-meta-pill--purple">{finding.tool}</span>
                                    </div>
                                    <span className={`badge ${finding.severity === 'Critical' ? 'badge-critica' : finding.severity === 'High' ? 'badge-alta' : finding.severity === 'Medium' ? 'badge-media' : 'badge-baja'}`}>
                                        {finding.severity === 'Critical' && <XCircle size={12} aria-hidden="true" style={{ color: '#991b1b' }} />}
                                        {finding.severity === 'High' && <AlertCircle size={12} aria-hidden="true" style={{ color: 'var(--color-error-text)' }} />}
                                        {finding.severity === 'Medium' && <AlertTriangle size={12} aria-hidden="true" style={{ color: 'var(--color-primary-hover)' }} />}
                                        {finding.severity === 'Low' && <CheckCircle2 size={12} aria-hidden="true" style={{ color: 'var(--color-success-text)' }} />}
                                        <span>{finding.severity === 'Critical' ? 'Crítica' : finding.severity === 'High' ? 'Alta' : finding.severity === 'Medium' ? 'Media' : 'Baja'}</span>
                                    </span>
                                </div>
                                <h3 className="finding-card-title">{finding.description}</h3>
                                {finding.recommendation && (
                                    <div className="finding-card-recommendation">
                                        <ArrowRight size={14} className="text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{finding.recommendation}</span>
                                    </div>
                                )}
                                <div className="finding-card-footer">
                                    <div className="finding-card-details-row">
                                        {finding.frequency && <span className="finding-card-details-pill">Frecuencia: {finding.frequency}</span>}
                                        <span className="finding-card-details-pill">Prioridad: {finding.priority === 'High' ? 'Alta' : finding.priority === 'Medium' ? 'Media' : 'Baja'}</span>
                                        {finding.improvementActions?.length > 0 && (
                                            <span className="finding-card-details-pill finding-card-details-pill--emerald">{finding.improvementActions.length} acciones</span>
                                        )}
                                    </div>
                                    <div className="finding-card-actions">
                                        <button onClick={() => handleEdit(finding)} className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }} aria-label={`Editar hallazgo: ${finding.description?.substring(0, 40)}`} disabled={isReadOnly}>
                                            Editar
                                        </button>
                                        <button onClick={() => setFindingToDelete(finding)} className="btn btn-danger" style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }} aria-label={`Eliminar hallazgo: ${finding.description?.substring(0, 40)}`} disabled={isReadOnly}>
                                            <Trash2 size={12} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            <Modal isOpen={!!findingToDelete} onClose={() => setFindingToDelete(null)} title="Eliminar Hallazgo" maxWidth="480px">
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                        ¿Estás seguro de que deseas eliminar este hallazgo? Esta acción no se puede deshacer.
                    </p>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setFindingToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => findingToDelete && confirmDelete(findingToDelete.id)} className="btn btn-danger">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}