import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testSessionsApi, participantsApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, CalendarRange, MonitorPlay, Calendar, Play, AlertTriangle } from 'lucide-react'

export default function TestSessions() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState<any[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [tasksCount, setTasksCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [sessionToDelete, setSessionToDelete] = useState<any | null>(null)
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const emptyForm = { testPlanId: '', participantId: '', date: new Date().toISOString().split('T')[0], platformTested: '' }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async (planId: string) => {
        if (!planId) { setSessions([]); setParticipants([]); setLoading(false); return }
        setLoading(true)
        try {
            const [sessionsRes, participantsRes, tasksRes] = await Promise.all([
                testSessionsApi.getAll(planId),
                participantsApi.getAll(),
                testTasksApi.getByPlan(planId)
            ])
            setSessions(sessionsRes.data ?? [])
            setParticipants(participantsRes.data ?? [])
            setTasksCount((tasksRes.data ?? []).length)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(activePlanId)
    }, [activePlanId])

    const resetForm = () => {
        setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (s: any) => {
        setForm({ testPlanId: s.testPlanId, participantId: s.participantId, date: s.date.split('T')[0], platformTested: s.platformTested })
        setEditId(s.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.participantId) { addToast('Debe seleccionar un participante', 'error'); return }
        if (!form.platformTested.trim()) { addToast('La plataforma evaluada es obligatoria', 'error'); return }

        setIsSubmitting(true)
        try {
            if (editId) {
                await testSessionsApi.update(editId, {
                    participantId: form.participantId,
                    date: new Date(form.date).toISOString(),
                    platformTested: form.platformTested,
                })
                addToast('Sesión actualizada', 'success')
            } else {
                await testSessionsApi.create({
                    testPlanId: activePlanId,
                    participantId: form.participantId,
                    date: new Date(form.date).toISOString(),
                    platformTested: form.platformTested,
                })
                addToast('Sesión programada', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al programar sesión'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testSessionsApi.delete(id)
            addToast('Sesión eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar'), 'error')
        } finally {
            setSessionToDelete(null)
        }
    }

    const getParticipantName = (id: string) => {
        return participants.find(p => p.id === id)?.name || 'Desconocido'
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Sesiones de Prueba</h2>
                    <p className="page-header-subtitle">Organiza y agenda el trabajo de campo con los usuarios</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' }); setShowForm(true) }}
                    disabled={!activePlanId || isReadOnly}
                    aria-label="Programar Sesión"
                >
                    <Plus size={18} aria-hidden="true" /> Programar Sesión
                </button>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner" role="status">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar sesiones.</span>
                </div>
            )}

            <div className="sessions-context-card">
                <div style={{ minWidth: 0 }}>
                    <label className="form-label">Plan de prueba activo</label>
                    <div className="sessions-plan-value">
                        {activePlan ? activePlan.projectName : 'Seleccione en el menú principal'}
                    </div>
                </div>
                <p className="sessions-context-info">Las sesiones nuevas se asignarán a este plan.</p>
            </div>

            {!loading && activePlan && tasksCount === 0 && sessions.length > 0 && (
                <div className="warning-banner" role="alert">
                    <AlertTriangle size={18} className="flex-shrink-0" aria-hidden="true" />
                    <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)' }}>
                        <strong>Atención:</strong> No hay <strong>tareas</strong> registradas en este plan. Debes crear tareas antes de poder iniciar la ejecución de una sesión.
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Sesión' : 'Programar Sesión'} maxWidth="480px">
                <form onSubmit={handleSubmit} className="form-layout">
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input form-input--disabled" style={{ cursor: 'not-allowed', background: 'var(--neutral-100)', color: 'var(--text-muted)' }}>
                            {activePlan?.projectName || 'Sin plan seleccionado'}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="participantId" className="form-label">
                            Participante <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        {participants.length === 0 ? (
                            <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
                                No hay participantes registrados. Registra uno antes de programar sesiones.
                            </div>
                        ) : (
                            <select id="participantId" value={form.participantId} onChange={e => setForm(f => ({ ...f, participantId: e.target.value }))} className="form-input" required>
                                <option value="" disabled>Selecciona un participante</option>
                                {participants.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.profile})</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label htmlFor="date" className="form-label">
                            Fecha de la sesión <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <input id="date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                        <label htmlFor="platformTested" className="form-label">
                            Plataforma a evaluar <span style={{ color: 'var(--color-error)' }}>*</span>
                        </label>
                        <input id="platformTested" type="text" value={form.platformTested} onChange={e => setForm(f => ({ ...f, platformTested: e.target.value }))} className="form-input" placeholder="Ej: iOS App, Android, Desktop Web..." required />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={participants.length === 0 || isSubmitting}>
                            <Save size={16} aria-hidden="true" /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {loading ? (
                <div className="dashboard-loader">
                    <div className="dashboard-spinner" aria-label="Cargando..." />
                </div>
            ) : sessions.length === 0 ? (
                <div className="empty-state-card">
                    <CalendarRange size={40} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin sesiones programadas</h3>
                    <p className="empty-state-subtitle">Agenda tu primera sesión en el campo</p>
                </div>
            ) : (
                <div className="sessions-grid">
                    {sessions.map((session: any) => (
                        <div key={session.id} className="session-card">
                            <div>
                                <h3 className="session-card-title">{getParticipantName(session.participantId)}</h3>
                                <div className="session-card-meta-list">
                                    <div className="session-card-meta-item">
                                        <Calendar size={14} aria-hidden="true" />
                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="session-card-meta-item">
                                        <MonitorPlay size={14} aria-hidden="true" />
                                        <span>Plataforma: {session.platformTested || 'No definida'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="session-card-actions">
                                <button
                                    onClick={() => navigate(`/sesiones/${session.id}/ejecutar`)}
                                    disabled={tasksCount === 0}
                                    title={tasksCount === 0 ? "Requiere crear tareas primero" : ""}
                                    className="btn btn-primary"
                                    aria-label={`Iniciar sesión con ${getParticipantName(session.participantId)}`}
                                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 12, height: 'auto', minHeight: 'unset', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Play size={12} aria-hidden="true" /> Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => handleEdit(session)}
                                    className="btn btn-secondary"
                                    disabled={isReadOnly}
                                    aria-label={`Modificar sesión de ${getParticipantName(session.participantId)}`}
                                    style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }}
                                >
                                    Modificar
                                </button>
                                <button
                                    onClick={() => setSessionToDelete(session)}
                                    className="btn btn-danger"
                                    disabled={isReadOnly}
                                    aria-label={`Eliminar sesión de ${getParticipantName(session.participantId)}`}
                                    style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            <Modal isOpen={!!sessionToDelete} onClose={() => setSessionToDelete(null)} title="Eliminar Sesión" maxWidth="480px">
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                        ¿Estás seguro de que deseas eliminar la sesión del participante <strong>{sessionToDelete && getParticipantName(sessionToDelete.participantId)}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setSessionToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => sessionToDelete && confirmDelete(sessionToDelete.id)} className="btn btn-danger">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
