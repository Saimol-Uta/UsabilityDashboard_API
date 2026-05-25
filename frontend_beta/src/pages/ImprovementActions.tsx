import { useEffect, useState } from 'react'
import { improvementActionsApi, findingsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, Trash2, Lightbulb, CheckCircle2, Clock, Circle, AlertTriangle, AlertCircle } from 'lucide-react'

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
    Closed: { label: 'Cerrada', badge: 'badge-completada', icon: CheckCircle2 },
    Resolved: { label: 'Resuelta', badge: 'badge-completada', icon: CheckCircle2 },
    InProgress: { label: 'En Progreso', badge: 'badge-enprogreso', icon: Clock },
    Open: { label: 'Abierta', badge: 'badge-pendiente', icon: Circle },
}

const statusLabelEs: Record<string, string> = {
    Open: 'Abierta',
    InProgress: 'En Progreso',
    Resolved: 'Resuelta',
    Closed: 'Cerrada',
}

const nextActionLabel: Record<string, string> = {
    Open: 'Iniciar',
    InProgress: 'Resolver',
    Resolved: 'Cerrar',
}

const nextStatus: Record<string, string> = {
    Open: 'InProgress',
    InProgress: 'Resolved',
    Resolved: 'Closed',
}

export default function ImprovementActions() {
    const [actions, setActions] = useState<any[]>([])
    const [findingsList, setFindingsList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [actionToDelete, setActionToDelete] = useState<any | null>(null)
    const [statusChangeConfirm, setStatusChangeConfirm] = useState<{ id: string; newStatus: string } | null>(null)
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const emptyForm = { findingId: '', description: '', status: 'Open', priority: 'Medium' }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async (planId: string) => {
        setActions([])
        setFindingsList([])

        if (!planId) { setLoading(false); return }

        setLoading(true)
        let cancelled = false

        try {
            const findingsRes = await findingsApi.getByPlan(planId)
            if (cancelled) return

            const findings = findingsRes.data ?? []
            setFindingsList(findings)
            setForm(f => ({ ...f, findingId: findings[0]?.id ?? '' }))

            if (findings.length === 0) return

            const actionResponses = await Promise.all(
                findings.map((f: any) => improvementActionsApi.getByFinding(f.id))
            )
            if (cancelled) return

            setActions(actionResponses.flatMap(r => r.data ?? []))
        } finally {
            if (!cancelled) setLoading(false)
        }

        return () => { cancelled = true }
    }

    useEffect(() => {
        fetchData(activePlanId)
    }, [activePlanId])

    const resetForm = () => {
        setForm({ ...emptyForm, findingId: findingsList[0]?.id ?? '' })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (a: any) => {
        setForm({ findingId: a.findingId, description: a.description, status: a.status, priority: a.priority })
        setEditId(a.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.description.trim()) { addToast('La descripción es requerida', 'error'); return }
        setIsSubmitting(true)
        try {
            if (editId) {
                await improvementActionsApi.update(editId, {
                    description: form.description,
                    status: form.status,
                    priority: form.priority,
                    implementedDate: form.status === 'Resolved' || form.status === 'Closed' ? new Date().toISOString() : null,
                })
                addToast('Acción actualizada', 'success')
            } else {
                await improvementActionsApi.create({
                    findingId: form.findingId,
                    description: form.description,
                    priority: form.priority,
                })
                addToast('Acción creada', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar la acción'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStatusChangeRequest = (id: string, currentStatus: string) => {
        const newSt = nextStatus[currentStatus]
        if (newSt) {
            setStatusChangeConfirm({ id, newStatus: newSt })
        }
    }

    const confirmStatusChange = async () => {
        if (!statusChangeConfirm) return
        try {
            await improvementActionsApi.updateStatus(statusChangeConfirm.id, statusChangeConfirm.newStatus)
            addToast(`Estado actualizado a ${statusLabelEs[statusChangeConfirm.newStatus] || statusChangeConfirm.newStatus}`, 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al actualizar estado'), 'error')
        } finally {
            setStatusChangeConfirm(null)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await improvementActionsApi.delete(id)
            addToast('Acción eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar la acción'), 'error')
        } finally {
            setActionToDelete(null)
        }
    }

    const filtered = actions.filter(a => filter === '' || a.status === filter)
    const completedCount = actions.filter(a => a.status === 'Resolved' || a.status === 'Closed').length
    const inProgressCount = actions.filter(a => a.status === 'InProgress').length
    const pendingCount = actions.filter(a => a.status === 'Open').length

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Acciones de Mejora</h2>
                    <p className="page-header-subtitle">Seguimiento de las acciones correctivas derivadas de los hallazgos</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditId(null); setForm({ ...emptyForm, findingId: findingsList[0]?.id ?? '' }); setShowForm(true) }}
                    disabled={!activePlanId || isReadOnly || findingsList.length === 0}
                    aria-label="Nueva Acción de Mejora"
                >
                    <Plus size={18} aria-hidden="true" /> Nueva Acción
                </button>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner" role="status">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar acciones de mejora.</span>
                </div>
            )}

            {/* Status Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="kpi-card kpi-card--emerald" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div className="kpi-value" style={{ fontSize: 32, fontWeight: 'var(--font-weight-extrabold)' }}>{completedCount}</div>
                    <div className="kpi-label" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', fontWeight: 'var(--font-weight-bold)' }}>Completadas</div>
                </div>
                <div className="kpi-card kpi-card--amber" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div className="kpi-value" style={{ fontSize: 32, fontWeight: 'var(--font-weight-extrabold)' }}>{inProgressCount}</div>
                    <div className="kpi-label" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', fontWeight: 'var(--font-weight-bold)' }}>En Progreso</div>
                </div>
                <div className="kpi-card kpi-card--slate" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div className="kpi-value" style={{ fontSize: 32, fontWeight: 'var(--font-weight-extrabold)' }}>{pendingCount}</div>
                    <div className="kpi-label" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', fontWeight: 'var(--font-weight-bold)' }}>Pendientes</div>
                </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {['', 'Resolved', 'InProgress', 'Open', 'Closed'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`tab-pill ${filter === s ? 'is-active' : ''}`}
                        aria-label={`Filtrar por estado: ${s === '' ? 'Todas' : statusLabelEs[s] || s}`}>
                        {s === '' ? 'Todas' : statusConfig[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Acción' : 'Nueva Acción'}>
                <form onSubmit={handleSubmit} className="form-layout">
                    <div>
                        <label className="form-label">Evaluación / Plan asignado</label>
                        <div className="form-input form-input--disabled" style={{ cursor: 'not-allowed', background: 'var(--neutral-100)', color: 'var(--text-muted)' }}>
                            {activePlan?.projectName || 'Sin plan'}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="actionFindingId" className="form-label">
                            Hallazgo asociado <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <select id="actionFindingId" value={form.findingId} onChange={e => setForm(f => ({ ...f, findingId: e.target.value }))} className="form-input" required>
                            {findingsList.map((f: any) => <option key={f.id} value={f.id}>{f.description.length > 80 ? f.description.substring(0, 80) + '...' : f.description}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="actionDescription" className="form-label">
                            Descripción <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <textarea id="actionDescription" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" rows={3} required />
                    </div>
                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="actionStatus" className="form-label">
                                Estado <span style={{ color: 'var(--color-error)' }}>*</span>
                            </label>
                            <select id="actionStatus" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input" required>
                                <option value="Open">Abierta</option>
                                <option value="InProgress">En Progreso</option>
                                <option value="Resolved">Resuelta</option>
                                <option value="Closed">Cerrada</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="actionPriority" className="form-label">
                                Prioridad <span style={{ color: 'var(--color-error)' }}>*</span>
                            </label>
                            <select id="actionPriority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input" required>
                                <option value="High">Alta</option>
                                <option value="Medium">Media</option>
                                <option value="Low">Baja</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Save size={16} aria-hidden="true" /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary text-center" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Actions List */}
            {loading ? (
                <div className="dashboard-loader">
                    <div className="dashboard-spinner" aria-label="Cargando..." />
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state-card">
                    <Lightbulb size={40} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin acciones de mejora</h3>
                    <p className="empty-state-subtitle">Crea una nueva acción para realizar su seguimiento</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {filtered.map((action: any) => {
                        const config = statusConfig[action.status] || statusConfig.Open
                        const Icon = config.icon
                        const isResolved = action.status === 'Resolved' || action.status === 'Closed'
                        const isInProgress = action.status === 'InProgress'

                        return (
                            <div key={action.id} className="action-card">
                                <div className="action-card-layout">
                                    <div className={`action-card-status-box ${isResolved ? 'action-card-status-box--success' : isInProgress ? 'action-card-status-box--warning' : 'action-card-status-box--pending'}`}>
                                        <Icon size={20} aria-hidden="true" />
                                    </div>
                                    <div className="action-card-body">
                                        <div className="action-card-meta-row">
                                            <span className={`badge ${config.badge} font-bold`}>{config.label}</span>
                                            <span className={`badge ${action.priority === 'High' ? 'badge-alta' : action.priority === 'Medium' ? 'badge-media' : 'badge-baja'}`}>
                                                {action.priority === 'High' && <AlertCircle size={11} aria-hidden="true" />}
                                                {action.priority === 'Medium' && <AlertTriangle size={11} aria-hidden="true" />}
                                                {action.priority === 'Low' && <CheckCircle2 size={11} aria-hidden="true" />}
                                                <span>Prioridad: {action.priority === 'High' ? 'Alta' : action.priority === 'Medium' ? 'Media' : 'Baja'}</span>
                                            </span>
                                        </div>
                                        <p className="action-card-title">{action.description}</p>
                                        <p className="action-card-sub">
                                            Hallazgo: {findingsList.find((f: any) => f.id === action.findingId)?.description || 'Desconocido'}
                                        </p>
                                        {action.implementedDate && (
                                            <p className="action-card-sub action-card-sub--resolved">
                                                ✓ Implementado: {new Date(action.implementedDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="action-card-actions">
                                        {action.status !== 'Closed' && !isReadOnly && (
                                            <button
                                                onClick={() => handleStatusChangeRequest(action.id, action.status)}
                                                className="btn btn-primary"
                                                style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }}
                                                aria-label={`${nextActionLabel[action.status] || 'Avanzar'} acción: ${action.description?.substring(0, 30)}`}
                                            >
                                                {nextActionLabel[action.status] || 'Avanzar'}
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(action)} className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }} aria-label={`Editar acción: ${action.description?.substring(0, 30)}`} disabled={isReadOnly}>
                                            Editar
                                        </button>
                                        <button onClick={() => setActionToDelete(action)} className="btn btn-danger" style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }} aria-label={`Eliminar acción: ${action.description?.substring(0, 30)}`} disabled={isReadOnly}>
                                            <Trash2 size={12} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ACM-01: Status change confirmation in Spanish */}
            <Modal isOpen={!!statusChangeConfirm} onClose={() => setStatusChangeConfirm(null)} title="Confirmar Cambio de Estado" maxWidth="480px">
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                        ¿Confirma cambiar el estado a <strong>{statusChangeConfirm ? statusLabelEs[statusChangeConfirm.newStatus] : ''}</strong>?
                    </p>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setStatusChangeConfirm(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={confirmStatusChange} className="btn btn-primary">Confirmar</button>
                    </div>
                </div>
            </Modal>

            {/* Delete confirmation */}
            <Modal isOpen={!!actionToDelete} onClose={() => setActionToDelete(null)} title="Eliminar Acción de Mejora" maxWidth="480px">
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                        ¿Estás seguro de que deseas eliminar esta acción de mejora? Esta acción no se puede deshacer.
                    </p>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setActionToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => actionToDelete && confirmDelete(actionToDelete.id)} className="btn btn-danger">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}