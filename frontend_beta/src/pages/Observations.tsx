import { useEffect, useState } from 'react'
import { observationLogsApi, testSessionsApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, Trash2, Eye, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function Observations() {
    const [logs, setLogs] = useState<any[]>([])
    const [sessions, setSessions] = useState<any[]>([])
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [logToDelete, setLogToDelete] = useState<any | null>(null)
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const emptyForm = {
        testSessionId: '',
        testTaskId: '',
        taskSuccess: true,
        timeSeconds: 60,
        errorCount: 0,
        comments: '',
        detectedProblem: '',
        severity: 'Medium',
        proposedImprovement: '',
    }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async (planId: string) => {
        if (!planId) { setLogs([]); setSessions([]); setTasks([]); setLoading(false); return }
        setLoading(true)
        try {
            const [sessionsRes, tasksRes, logsRes] = await Promise.all([
                testSessionsApi.getAll(planId),
                testTasksApi.getByPlan(planId),
                observationLogsApi.getAll(),
            ])

            const planSessions = sessionsRes.data ?? []
            const planTasks = tasksRes.data ?? []
            const allLogs = logsRes.data ?? []
            const sessionIds = new Set(planSessions.map((s: any) => s.id))

            setSessions(planSessions)
            setTasks(planTasks)
            setLogs(allLogs.filter((l: any) => sessionIds.has(l.testSessionId)))

            setForm(f => ({
                ...f,
                testSessionId: f.testSessionId || planSessions[0]?.id || '',
                testTaskId: f.testTaskId || planTasks[0]?.id || '',
            }))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(activePlanId)
    }, [activePlanId])

    const resetForm = () => {
        setForm({
            ...emptyForm,
            testSessionId: sessions[0]?.id ?? '',
            testTaskId: tasks[0]?.id ?? '',
        })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (log: any) => {
        setForm({
            testSessionId: log.testSessionId,
            testTaskId: log.testTaskId,
            taskSuccess: log.taskSuccess,
            timeSeconds: log.timeSeconds,
            errorCount: log.errorCount,
            comments: log.comments || '',
            detectedProblem: log.detectedProblem || '',
            severity: log.severity || 'Medium',
            proposedImprovement: log.proposedImprovement || '',
        })
        setEditId(log.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        if (!form.testSessionId || !form.testTaskId) {
            addToast('Debe seleccionar sesión y tarea', 'error')
            return
        }

        if (form.timeSeconds <= 0) { addToast('El tiempo debe ser mayor a 0', 'error'); return }
        if (form.errorCount < 0) { addToast('Los errores no pueden ser negativos', 'error'); return }

        if ((!form.taskSuccess || form.errorCount > 0) && !form.detectedProblem.trim()) {
            addToast('El problema detectado es obligatorio cuando hay errores o la tarea no tuvo éxito', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            if (editId) {
                await observationLogsApi.update(editId, {
                    taskSuccess: form.taskSuccess,
                    timeSeconds: form.timeSeconds,
                    errorCount: form.errorCount,
                    comments: form.comments,
                    detectedProblem: form.detectedProblem,
                    severity: form.severity,
                    proposedImprovement: form.proposedImprovement,
                })
                addToast('Registro actualizado', 'success')
            } else {
                await observationLogsApi.create(form)
                addToast('Registro creado', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar el registro'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await observationLogsApi.delete(id)
            addToast('Registro eliminado', 'success')
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar el registro'), 'error')
        } finally {
            setLogToDelete(null)
        }
    }

    const getSessionName = (sessionId: string) => {
        const session = sessions.find((s: any) => s.id === sessionId)
        return session?.participantName ?? `Sesión ${String(sessionId).slice(0, 8)}`
    }

    const getTaskLabel = (taskId: string) => {
        const task = tasks.find((t: any) => t.id === taskId)
        return task ? `T${task.taskNumber}` : `T${String(taskId).slice(0, 4)}`
    }

    // SEC-04: Handle error count input clearing
    const handleErrorCountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (Number(e.target.value) === 0) {
            setForm(f => ({ ...f, errorCount: '' as any }))
        }
    }
    const handleErrorCountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '' || e.target.value === undefined) {
            setForm(f => ({ ...f, errorCount: 0 }))
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Registro de Observación</h2>
                    <p className="page-header-subtitle">Registra resultados por sesión y tarea: éxito, tiempo, errores y severidad</p>
                </div>
                <button
                    onClick={() => { setEditId(null); resetForm(); setShowForm(true) }}
                    className="btn btn-primary"
                    disabled={!activePlanId || isReadOnly || sessions.length === 0 || tasks.length === 0}
                    aria-label="Nuevo Registro"
                >
                    <Plus size={18} aria-hidden="true" /> Nuevo Registro
                </button>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner" role="status">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar observaciones.</span>
                </div>
            )}

            {/* Blocking banner for missing dependencies */}
            {!isReadOnly && activePlan && !loading && (sessions.length === 0 || tasks.length === 0) && (
                <div className="warning-banner" role="alert">
                    <AlertTriangle size={20} className="flex-shrink-0" aria-hidden="true" />
                    <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)' }}>
                        <strong>No se pueden registrar observaciones:</strong> Es necesario contar con al menos una <strong>Tarea</strong> y una <strong>Sesión de Prueba</strong> registradas en este plan. Ve a dichas secciones para programarlas primero.
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Registro' : 'Nuevo Registro'}>
                <form onSubmit={handleSubmit} className="form-layout">
                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="obsTestSessionId" className="form-label">Sesión <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <select id="obsTestSessionId" value={form.testSessionId} onChange={e => setForm(f => ({ ...f, testSessionId: e.target.value }))} className="form-input" required>
                                {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.participantName} · {new Date(s.date).toLocaleDateString()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="obsTestTaskId" className="form-label">Tarea <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <select id="obsTestTaskId" value={form.testTaskId} onChange={e => setForm(f => ({ ...f, testTaskId: e.target.value }))} className="form-input" required>
                                {tasks.map((t: any) => <option key={t.id} value={t.id}>T{t.taskNumber} — {String(t.scenario).substring(0, 40)}...</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-3">
                        <div>
                            <label htmlFor="obsTaskSuccess" className="form-label">¿Éxito?</label>
                            <select id="obsTaskSuccess" value={form.taskSuccess ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, taskSuccess: e.target.value === 'true' }))} className="form-input">
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="obsTimeSeconds" className="form-label">Tiempo (seg) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="obsTimeSeconds" type="number" value={form.timeSeconds} onChange={e => setForm(f => ({ ...f, timeSeconds: Number(e.target.value) }))} className="form-input" min={1} required />
                        </div>
                        <div>
                            <label htmlFor="obsErrorCount" className="form-label">Errores <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input
                                id="obsErrorCount"
                                type="number"
                                value={form.errorCount}
                                onChange={e => setForm(f => ({ ...f, errorCount: e.target.value === '' ? '' as any : Number(e.target.value) }))}
                                onFocus={handleErrorCountFocus}
                                onBlur={handleErrorCountBlur}
                                className="form-input"
                                min={0}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="obsSeverity" className="form-label">Severidad</label>
                        <select id="obsSeverity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="form-input">
                            <option value="Critical">Crítica</option>
                            <option value="High">Alta</option>
                            <option value="Medium">Media</option>
                            <option value="Low">Baja</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="obsDetectedProblem" className="form-label">Problema detectado {(!form.taskSuccess || form.errorCount > 0) && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
                        <textarea id="obsDetectedProblem" value={form.detectedProblem} onChange={e => setForm(f => ({ ...f, detectedProblem: e.target.value }))} className={`form-input ${(!form.taskSuccess || form.errorCount > 0) && !form.detectedProblem.trim() ? 'field-error' : ''}`} rows={2} placeholder="Describe el problema observado" required={!form.taskSuccess || form.errorCount > 0} />
                    </div>

                    <div>
                        <label htmlFor="obsProposedImprovement" className="form-label">Mejora propuesta</label>
                        <textarea id="obsProposedImprovement" value={form.proposedImprovement} onChange={e => setForm(f => ({ ...f, proposedImprovement: e.target.value }))} className="form-input" rows={2} placeholder="Propuesta de mejora" />
                    </div>

                    <div>
                        <label htmlFor="obsComments" className="form-label">Comentarios</label>
                        <textarea id="obsComments" value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} className="form-input" rows={3} placeholder="Notas del moderador" />
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

            {loading ? (
                <div className="dashboard-loader">
                    <div className="dashboard-spinner" aria-label="Cargando..." />
                </div>
            ) : logs.length === 0 ? (
                <div className="empty-state-card" style={{ padding: 'var(--space-10) var(--space-6)' }}>
                    <Eye size={48} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin registros de observación</h3>
                    <p className="empty-state-subtitle">Comienza a registrar observaciones de las sesiones de prueba.</p>
                </div>
            ) : (
                <div className="observations-table-card">
                    <div className="overflow-x-auto soft-scrollbar" style={{ overflowX: 'auto' }}>
                        <table className="observations-table">
                            <thead className="observations-thead">
                                <tr>
                                    <th className="observations-th">Sesión</th>
                                    <th className="observations-th">Tarea</th>
                                    <th className="observations-th">Éxito</th>
                                    <th className="observations-th">Tiempo</th>
                                    <th className="observations-th">Errores</th>
                                    <th className="observations-th">Severidad</th>
                                    <th className="observations-th">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any, i: number) => (
                                    <tr key={log.id} className={`observations-tr ${i % 2 === 0 ? 'observations-tr--even' : 'observations-tr--odd'}`}>
                                        <td className="observations-td">
                                            <div className="observations-session-name">{getSessionName(log.testSessionId)}</div>
                                        </td>
                                        <td className="observations-td">
                                            <span className="observations-task-badge">{getTaskLabel(log.testTaskId)}</span>
                                        </td>
                                        <td className="observations-td">
                                            {log.taskSuccess
                                                ? <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} aria-label="Éxito" />
                                                : <XCircle size={18} style={{ color: 'var(--color-error)' }} aria-label="Fallo" />}
                                        </td>
                                        <td className="observations-td">
                                            <span className="observations-mono-badge">{log.timeSeconds}s</span>
                                        </td>
                                        <td className="observations-td">
                                            <span className="observations-mono-badge">{log.errorCount}</span>
                                        </td>
                                        <td className="observations-td">
                                            <span className={`badge ${log.severity === 'Critical' ? 'badge-critica' : log.severity === 'High' ? 'badge-alta' : log.severity === 'Medium' ? 'badge-media' : 'badge-baja'}`}>
                                                {log.severity === 'Critical' && <XCircle size={12} aria-hidden="true" style={{ color: '#991b1b', marginRight: 4 }} />}
                                                {log.severity === 'High' && <AlertTriangle size={12} aria-hidden="true" style={{ color: 'var(--color-error-text)', marginRight: 4 }} />}
                                                {log.severity === 'Medium' && <AlertTriangle size={12} aria-hidden="true" style={{ color: 'var(--color-primary-hover)', marginRight: 4 }} />}
                                                {log.severity === 'Low' && <CheckCircle2 size={12} aria-hidden="true" style={{ color: 'var(--color-success-text)', marginRight: 4 }} />}
                                                <span>{log.severity === 'Critical' ? 'Crítica' : log.severity === 'High' ? 'Alta' : log.severity === 'Medium' ? 'Media' : 'Baja'}</span>
                                            </span>
                                        </td>
                                        <td className="observations-td">
                                            <div className="observations-actions">
                                                <button onClick={() => handleEdit(log)} className="btn-table-edit" aria-label={`Editar observación de ${getSessionName(log.testSessionId)}`} disabled={isReadOnly}>
                                                    Editar
                                                </button>
                                                <button onClick={() => setLogToDelete(log)} className="btn-table-delete" aria-label={`Eliminar observación de ${getSessionName(log.testSessionId)}`} disabled={isReadOnly}>
                                                    <Trash2 size={14} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            <Modal isOpen={!!logToDelete} onClose={() => setLogToDelete(null)} title="Eliminar Observación" maxWidth="480px">
                <div className="modal-body">
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                        ¿Estás seguro de que deseas eliminar la observación de la sesión <strong>{logToDelete && getSessionName(logToDelete.testSessionId)}</strong> (Tarea {logToDelete && getTaskLabel(logToDelete.testTaskId)})? Esta acción no se puede deshacer.
                    </p>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setLogToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => logToDelete && confirmDelete(logToDelete.id)} className="btn btn-danger">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
