import { useEffect, useState } from 'react'
import { testTasksApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, Trash2, ListChecks, Clock, AlertTriangle, Sparkles } from 'lucide-react'

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [taskToDelete, setTaskToDelete] = useState<any | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({
        testPlanId: '', taskNumber: 0, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '', maxTimeSeconds: 120
    })
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const fetchTasks = (planId: string) => {
        if (!planId) { setTasks([]); setLoading(false); return }
        setLoading(true)
        testTasksApi.getByPlan(planId).then(res => setTasks(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => {
        if (activePlanId) {
            fetchTasks(activePlanId)
        } else {
            setTasks([])
            setLoading(false)
        }
    }, [activePlanId])

    useEffect(() => {
        const handleTasksUpdated = () => {
            if (activePlanId) fetchTasks(activePlanId)
        }
        window.addEventListener('tasks-updated', handleTasksUpdated)
        return () => window.removeEventListener('tasks-updated', handleTasksUpdated)
    }, [activePlanId])

    const resetForm = () => {
        setForm({ testPlanId: activePlanId, taskNumber: tasks.length + 1, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '', maxTimeSeconds: 120 })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (task: any) => {
        setForm({
            testPlanId: task.testPlanId, taskNumber: task.taskNumber, scenario: task.scenario,
            expectedResult: task.expectedResult || '', mainMetric: task.mainMetric,
            successCriteria: task.successCriteria || '', maxTimeSeconds: task.maxTimeSeconds
        })
        setEditId(task.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.testPlanId) { addToast('Selecciona un plan de prueba', 'error'); return }
        if (!form.scenario.trim()) { addToast('El escenario es requerido', 'error'); return }
        if (!form.mainMetric.trim()) { addToast('La métrica principal es requerida', 'error'); return }
        if (form.maxTimeSeconds <= 0) { addToast('El tiempo máximo debe ser mayor a 0', 'error'); return }
        setIsSubmitting(true)
        try {
            if (editId) {
                await testTasksApi.update(editId, {
                    scenario: form.scenario,
                    expectedResult: form.expectedResult,
                    mainMetric: form.mainMetric,
                    successCriteria: form.successCriteria,
                    maxTimeSeconds: form.maxTimeSeconds,
                })
                addToast('Tarea actualizada', 'success')
            } else {
                await testTasksApi.create(form)
                addToast('Tarea creada', 'success')
            }
            resetForm()
            if (form.testPlanId) fetchTasks(form.testPlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar la tarea'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testTasksApi.delete(id)
            addToast('Tarea eliminada', 'success')
            if (activePlanId) fetchTasks(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar la tarea'), 'error')
        } finally {
            setTaskToDelete(null)
        }
    }

    const planName = activePlan?.projectName || 'Sin plan seleccionado'

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Gestión de Tareas</h2>
                    <p className="page-header-subtitle">Define los escenarios de prueba que realizarán los participantes</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('copilot-trigger', { 
                                detail: { 
                                    action: 'suggest-tasks',
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
                        aria-label="Sugerir tareas con IA"
                    >
                        <Sparkles size={16} aria-hidden="true" style={{ color: 'var(--color-primary)' }} /> Sugerir tareas con IA
                    </button>

                    <button
                        onClick={() => { setForm(f => ({ ...f, testPlanId: activePlanId, taskNumber: tasks.length + 1 })); setEditId(null); setShowForm(true) }}
                        disabled={!activePlanId || isReadOnly}
                        className="btn btn-primary"
                        aria-label="Nueva Tarea"
                    >
                        <Plus size={18} aria-hidden="true" /> Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar tareas.</span>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Tarea' : 'Nueva Tarea'}>
                <form onSubmit={handleSubmit} className="form-layout">
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input bg-slate-50 text-slate-700 cursor-not-allowed" style={{ background: 'var(--neutral-50)', color: 'var(--text-secondary)' }}>{planName}</div>
                    </div>
                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="taskNumber" className="form-label">Número de Tarea</label>
                            <input
                                id="taskNumber"
                                type="number"
                                value={form.taskNumber}
                                readOnly
                                className="form-input"
                                style={{ background: 'var(--neutral-100)', color: 'var(--text-disabled)', cursor: 'not-allowed' }}
                                tabIndex={-1}
                            />
                        </div>
                        <div>
                            <label htmlFor="maxTimeSeconds" className="form-label">Tiempo Máximo (seg) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="maxTimeSeconds" type="number" value={form.maxTimeSeconds} onChange={e => setForm(f => ({ ...f, maxTimeSeconds: Number(e.target.value) }))} className="form-input" min={1} required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="scenario" className="form-label">Escenario <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="scenario" value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} className="form-input" rows={3} placeholder="Describe la tarea que realizará el participante" required />
                    </div>
                    <div>
                        <label htmlFor="expectedResult" className="form-label">Resultado Esperado</label>
                        <textarea id="expectedResult" value={form.expectedResult} onChange={e => setForm(f => ({ ...f, expectedResult: e.target.value }))} className="form-input" rows={2} placeholder="¿Qué se espera que logre?" />
                    </div>
                    <div>
                        <label htmlFor="mainMetric" className="form-label">Métrica Principal <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <input id="mainMetric" value={form.mainMetric} onChange={e => setForm(f => ({ ...f, mainMetric: e.target.value }))} className="form-input" placeholder="Ej: Tasa de éxito" required />
                    </div>
                    <div>
                        <label htmlFor="successCriteria" className="form-label">Criterio de Éxito</label>
                        <textarea id="successCriteria" value={form.successCriteria} onChange={e => setForm(f => ({ ...f, successCriteria: e.target.value }))} className="form-input" rows={2} placeholder="¿Cómo se mide el éxito?" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Save size={16} aria-hidden="true" /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary text-center" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Tasks List */}
            {loading ? (
                <div className="dashboard-loader-container">
                    <div className="dashboard-spinner" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="empty-state-card">
                    <ListChecks size={48} className="empty-state-icon" aria-hidden="true" style={{ marginBottom: 'var(--space-4)' }} />
                    <h3 className="empty-state-title">Sin tareas definidas</h3>
                    <p className="empty-state-subtitle">Define las tareas para tu plan de prueba.</p>
                </div>
            ) : (
                <div className="tasks-grid">
                    {tasks.map((task: any) => (
                        <div key={task.id} className="task-card">
                            <div className="task-card-bar" />
                            <div className="task-card-body">
                                <div className="task-card-header">
                                    <div className="task-card-number">
                                        T{task.taskNumber}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 className="task-card-scenario">{task.scenario}</h3>
                                    </div>
                                </div>
                                <div className="task-card-details">
                                    {task.expectedResult && <p className="task-card-detail-item"><span className="task-card-detail-label">Resultado esperado:</span> {task.expectedResult}</p>}
                                    {task.mainMetric && <p className="task-card-detail-item"><span className="task-card-detail-label">Métrica principal:</span> {task.mainMetric}</p>}
                                    {task.successCriteria && <p className="task-card-detail-item"><span className="task-card-detail-label">Criterio de éxito:</span> {task.successCriteria}</p>}
                                </div>
                                <div className="task-card-footer">
                                    <span className="task-card-time-badge">
                                        <Clock size={14} aria-hidden="true" /> {task.maxTimeSeconds}s máx.
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <button onClick={() => handleEdit(task)} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} aria-label={`Editar tarea ${task.taskNumber}`} disabled={isReadOnly}>Editar</button>
                                        <button onClick={() => setTaskToDelete(task)} className="btn btn-danger text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} aria-label={`Eliminar tarea ${task.taskNumber}`} disabled={isReadOnly}>
                                            <Trash2 size={14} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Eliminar Tarea" maxWidth="480px">
                <div style={{ padding: 'var(--space-5)' }}>
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                        ¿Estás seguro de que deseas eliminar la tarea <strong>T{taskToDelete?.taskNumber}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                        <button type="button" onClick={() => setTaskToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => confirmDelete(taskToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
