import { useEffect, useState } from 'react'
import { testTasksApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'

import { Plus, Save, Trash2, ListChecks, Clock, AlertTriangle } from 'lucide-react'

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

    const resetForm = () => {
        setForm({ testPlanId: activePlanId, taskNumber: tasks.length + 1, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '', maxTimeSeconds: 120 })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (task: any) => {
        setForm({
            testPlanId: task.testPlanId, taskNumber: task.taskNumber, scenario: task.scenario,
            expectedResult: task.expectedResult, mainMetric: task.mainMetric,
            successCriteria: task.successCriteria, maxTimeSeconds: task.maxTimeSeconds
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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Gestión de Tareas</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Define los escenarios de prueba que realizarán los participantes</p>
                </div>
                <button
                    onClick={() => { setForm(f => ({ ...f, testPlanId: activePlanId, taskNumber: tasks.length + 1 })); setEditId(null); setShowForm(true) }}
                    disabled={!activePlanId || isReadOnly}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Nueva Tarea"
                >
                    <Plus size={18} aria-hidden="true" /> Nueva Tarea
                </button>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar tareas.</span>
                </div>
            )}



            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Tarea' : 'Nueva Tarea'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* TASK-02: Plan asignado as read-only text */}
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input bg-slate-50 text-slate-700 cursor-not-allowed">{planName}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* TASK-01: Task number read-only */}
                        <div>
                            <label htmlFor="taskNumber" className="form-label">Número de Tarea</label>
                            <input
                                id="taskNumber"
                                type="number"
                                value={form.taskNumber}
                                readOnly
                                className="form-input bg-slate-50 text-slate-500 cursor-not-allowed"
                                tabIndex={-1}
                            />
                        </div>
                        <div>
                            <label htmlFor="maxTimeSeconds" className="form-label">Tiempo Máximo (seg) <span className="text-red-500">*</span></label>
                            <input id="maxTimeSeconds" type="number" value={form.maxTimeSeconds} onChange={e => setForm(f => ({ ...f, maxTimeSeconds: Number(e.target.value) }))} className="form-input" min={1} required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="scenario" className="form-label">Escenario <span className="text-red-500">*</span></label>
                        <textarea id="scenario" value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} className="form-input" rows={3} placeholder="Describe la tarea que realizará el participante" required />
                    </div>
                    <div>
                        <label htmlFor="expectedResult" className="form-label">Resultado Esperado</label>
                        <textarea id="expectedResult" value={form.expectedResult} onChange={e => setForm(f => ({ ...f, expectedResult: e.target.value }))} className="form-input" rows={2} placeholder="¿Qué se espera que logre?" />
                    </div>
                    <div>
                        <label htmlFor="mainMetric" className="form-label">Métrica Principal <span className="text-red-500">*</span></label>
                        <input id="mainMetric" value={form.mainMetric} onChange={e => setForm(f => ({ ...f, mainMetric: e.target.value }))} className="form-input" placeholder="Ej: Tasa de éxito" required />
                    </div>
                    <div>
                        <label htmlFor="successCriteria" className="form-label">Criterio de Éxito</label>
                        <textarea id="successCriteria" value={form.successCriteria} onChange={e => setForm(f => ({ ...f, successCriteria: e.target.value }))} className="form-input" rows={2} placeholder="¿Cómo se mide el éxito?" />
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Save size={16} /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary text-center" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Tasks List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : tasks.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-inner">
                    <ListChecks size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-[18px] font-semibold text-slate-700 mb-2">Sin tareas definidas</h3>
                    <p className="text-[14px] text-slate-500">Define las tareas para tu plan de prueba.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tasks.map((task: any) => (
                        <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                            <div className="p-5">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0 text-[16px] font-bold text-blue-700 shadow-md group-hover:shadow-lg transition-shadow">
                                        T{task.taskNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[16px] font-semibold text-slate-900 leading-snug">{task.scenario}</h3>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {task.expectedResult && <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-800">Resultado esperado:</span> {task.expectedResult}</p>}
                                    {task.mainMetric && <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-800">Métrica principal:</span> {task.mainMetric}</p>}
                                    {task.successCriteria && <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-800">Criterio de éxito:</span> {task.successCriteria}</p>}
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[12px] shadow-sm">
                                        <Clock size={14} aria-hidden="true" /> {task.maxTimeSeconds}s máx.
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(task)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-blue-200" aria-label={`Editar tarea ${task.taskNumber}`} disabled={isReadOnly}>Editar</button>
                                        <button onClick={() => setTaskToDelete(task)} className="bg-red-50 hover:bg-red-100 text-red-700 text-[12px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-red-200" aria-label={`Eliminar tarea ${task.taskNumber}`} disabled={isReadOnly}>
                                            <Trash2 size={14} />
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
                <div className="p-5 space-y-4">
                    <p className="text-slate-600">
                        ¿Estás seguro de que deseas eliminar la tarea <strong>T{taskToDelete?.taskNumber}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button type="button" onClick={() => setTaskToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => confirmDelete(taskToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
        //comentario dfooasoaso
    )
}
