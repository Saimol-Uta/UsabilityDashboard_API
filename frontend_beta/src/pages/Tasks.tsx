import { useEffect, useState } from 'react'
import { testPlansApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, ListChecks, X, Clock } from 'lucide-react'

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [form, setForm] = useState({
        testPlanId: '', taskNumber: 0, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '', maxTimeSeconds: 120
    })
    const { addToast } = useToast()

    const fetchTasks = (planId: string) => {
        setLoading(true)
        testTasksApi.getByPlan(planId).then(res => setTasks(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => {
        testPlansApi.getAll().then(res => {
            const planId = res.data?.[0]?.id ?? ''
            setActivePlanId(planId)
            setForm(f => ({ ...f, testPlanId: planId, taskNumber: 1 }))
            if (planId) {
                fetchTasks(planId)
            } else {
                setLoading(false)
            }
        })
    }, [])

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
        if (!form.scenario.trim()) { addToast('El escenario es requerido', 'error'); return }
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
            if (activePlanId) fetchTasks(activePlanId)
        } catch { addToast('Error al guardar', 'error') }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta tarea?')) return
        try {
            await testTasksApi.delete(id)
            addToast('Tarea eliminada', 'success')
            if (activePlanId) fetchTasks(activePlanId)
        } catch { addToast('Error al eliminar', 'error') }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Gestión de Tareas</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Define los escenarios de prueba que realizarán los participantes</p>
                </div>
                <button onClick={() => { setForm(f => ({ ...f, testPlanId: activePlanId, taskNumber: tasks.length + 1 })); setEditId(null); setShowForm(true) }} className="btn btn-primary">
                    <Plus size={16} aria-hidden="true" /> Nueva Tarea
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de tarea">
                    <div className="modal-content">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar formulario"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="taskNumber" className="form-label">Número de Tarea</label>
                                    <input id="taskNumber" type="number" value={form.taskNumber} onChange={e => setForm(f => ({ ...f, taskNumber: Number(e.target.value) }))} className="form-input" min={1} />
                                </div>
                                <div>
                                    <label htmlFor="maxTimeSeconds" className="form-label">Tiempo Máximo (seg)</label>
                                    <input id="maxTimeSeconds" type="number" value={form.maxTimeSeconds} onChange={e => setForm(f => ({ ...f, maxTimeSeconds: Number(e.target.value) }))} className="form-input" min={10} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="scenario" className="form-label">Escenario *</label>
                                <textarea id="scenario" value={form.scenario} onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))} className="form-input" rows={3} placeholder="Describe la tarea que realizará el participante" required />
                            </div>
                            <div>
                                <label htmlFor="expectedResult" className="form-label">Resultado Esperado</label>
                                <textarea id="expectedResult" value={form.expectedResult} onChange={e => setForm(f => ({ ...f, expectedResult: e.target.value }))} className="form-input" rows={2} placeholder="¿Qué se espera que logre?" />
                            </div>
                            <div>
                                <label htmlFor="mainMetric" className="form-label">Métrica Principal</label>
                                <input id="mainMetric" value={form.mainMetric} onChange={e => setForm(f => ({ ...f, mainMetric: e.target.value }))} className="form-input" placeholder="Ej: Tasa de éxito" />
                            </div>
                            <div>
                                <label htmlFor="successCriteria" className="form-label">Criterio de Éxito</label>
                                <textarea id="successCriteria" value={form.successCriteria} onChange={e => setForm(f => ({ ...f, successCriteria: e.target.value }))} className="form-input" rows={2} placeholder="¿Cómo se mide el éxito?" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Actualizar' : 'Crear'}</button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <ListChecks size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin tareas definidas</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Define las tareas para tu plan de prueba</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task: any) => (
                        <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-rise hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-[14px] font-bold text-blue-700">
                                    T{task.taskNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[14px] font-semibold text-slate-900">{task.scenario}</h3>
                                    {task.expectedResult && <p className="text-[12px] text-slate-500 mt-1"><strong>Resultado esperado:</strong> {task.expectedResult}</p>}
                                    {task.mainMetric && <p className="text-[12px] text-slate-500 mt-0.5"><strong>Métrica principal:</strong> {task.mainMetric}</p>}
                                    {task.successCriteria && <p className="text-[12px] text-slate-500 mt-0.5"><strong>Criterio de éxito:</strong> {task.successCriteria}</p>}
                                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                            <Clock size={10} aria-hidden="true" /> {task.maxTimeSeconds}s máx.
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(task)} className="btn btn-secondary text-[11px] py-1.5 px-2.5" aria-label={`Editar tarea ${task.taskNumber}`}>Editar</button>
                                    <button onClick={() => handleDelete(task.id)} className="btn btn-danger text-[11px] py-1.5 px-2.5" aria-label={`Eliminar tarea ${task.taskNumber}`}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
