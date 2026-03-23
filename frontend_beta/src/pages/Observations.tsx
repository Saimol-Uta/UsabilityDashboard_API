import { useEffect, useState } from 'react'
import { observationLogsApi, testPlansApi, testSessionsApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Eye, X, CheckCircle2, XCircle } from 'lucide-react'

export default function Observations() {
    const [logs, setLogs] = useState<any[]>([])
    const [sessions, setSessions] = useState<any[]>([])
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [activePlanId, setActivePlanId] = useState('')
    const { addToast } = useToast()

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

    const fetchData = async (planId: string) => {
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
        testPlansApi.getAll().then(res => {
            const planId = res.data?.[0]?.id ?? ''
            setActivePlanId(planId)
            if (planId) {
                fetchData(planId)
            } else {
                setLoading(false)
            }
        })
    }, [])

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
        } catch {
            addToast('Error al guardar', 'error')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este registro?')) return
        try {
            await observationLogsApi.delete(id)
            addToast('Registro eliminado', 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch {
            addToast('Error al eliminar', 'error')
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Registro de Observación</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Registra resultados por sesión y tarea: éxito, tiempo, errores y severidad</p>
                </div>
                <button onClick={() => { setEditId(null); resetForm(); setShowForm(true) }} className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                    <Plus size={18} aria-hidden="true" /> Nuevo Registro
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de observación">
                    <div className="modal-content rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h3 className="text-[18px] font-semibold text-slate-900">{editId ? 'Editar Registro' : 'Nuevo Registro'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors" aria-label="Cerrar"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="testSessionId" className="form-label">Sesión *</label>
                                    <select id="testSessionId" value={form.testSessionId} onChange={e => setForm(f => ({ ...f, testSessionId: e.target.value }))} className="form-input" required>
                                        {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.participantName} · {new Date(s.date).toLocaleDateString()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="testTaskId" className="form-label">Tarea *</label>
                                    <select id="testTaskId" value={form.testTaskId} onChange={e => setForm(f => ({ ...f, testTaskId: e.target.value }))} className="form-input" required>
                                        {tasks.map((t: any) => <option key={t.id} value={t.id}>T{t.taskNumber} — {String(t.scenario).substring(0, 40)}...</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="taskSuccess" className="form-label">¿Éxito?</label>
                                    <select id="taskSuccess" value={form.taskSuccess ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, taskSuccess: e.target.value === 'true' }))} className="form-input">
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="timeSeconds" className="form-label">Tiempo (seg) <span className="text-red-500">*</span></label>
                                    <input id="timeSeconds" type="number" value={form.timeSeconds} onChange={e => setForm(f => ({ ...f, timeSeconds: Number(e.target.value) }))} className="form-input" min={1} required />
                                </div>
                                <div>
                                    <label htmlFor="errorCount" className="form-label">Errores <span className="text-red-500">*</span></label>
                                    <input id="errorCount" type="number" value={form.errorCount} onChange={e => setForm(f => ({ ...f, errorCount: Number(e.target.value) }))} className="form-input" min={0} required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="severity" className="form-label">Severidad</label>
                                <select id="severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="form-input">
                                    <option value="Critical">Crítica</option>
                                    <option value="High">Alta</option>
                                    <option value="Medium">Media</option>
                                    <option value="Low">Baja</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="detectedProblem" className="form-label">Problema detectado {(!form.taskSuccess || form.errorCount > 0) && <span className="text-red-500">*</span>}</label>
                                <textarea id="detectedProblem" value={form.detectedProblem} onChange={e => setForm(f => ({ ...f, detectedProblem: e.target.value }))} className={`form-input ${(!form.taskSuccess || form.errorCount > 0) && !form.detectedProblem.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-50' : ''}`} rows={2} placeholder="Describe el problema observado" required={!form.taskSuccess || form.errorCount > 0} />
                            </div>

                            <div>
                                <label htmlFor="proposedImprovement" className="form-label">Mejora propuesta</label>
                                <textarea id="proposedImprovement" value={form.proposedImprovement} onChange={e => setForm(f => ({ ...f, proposedImprovement: e.target.value }))} className="form-input" rows={2} placeholder="Propuesta de mejora" />
                            </div>

                            <div>
                                <label htmlFor="comments" className="form-label">Comentarios</label>
                                <textarea id="comments" value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} className="form-input" rows={3} placeholder="Notas del moderador" />
                            </div>

                            <div className="flex gap-4 pt-3">
                                <button type="submit" className="btn btn-primary flex items-center gap-2 flex-1 justify-center py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"><Save size={18} /> {editId ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : logs.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-inner">
                    <Eye size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-[18px] font-semibold text-slate-700 mb-2">Sin registros de observación</h3>
                    <p className="text-[14px] text-slate-500">Comienza a registrar observaciones de las sesiones de prueba.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-rise">
                    <div className="overflow-x-auto soft-scrollbar">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Sesión</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Tarea</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Éxito</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Tiempo</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Errores</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Severidad</th>
                                    <th className="px-5 py-3 text-left text-[12px] font-bold text-slate-600 uppercase tracking-wide">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any, i: number) => (
                                    <tr key={log.id} className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800">{getSessionName(log.testSessionId)}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-[12px] font-medium">{getTaskLabel(log.testTaskId)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {log.taskSuccess
                                                ? <CheckCircle2 size={18} className="text-emerald-600" aria-label="Éxito" />
                                                : <XCircle size={18} className="text-red-500" aria-label="Fallo" />}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-[13px]">{log.timeSeconds}s</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-[13px]">{log.errorCount}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold shadow-sm ${log.severity === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' : log.severity === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-300' : log.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                                                {log.severity === 'Critical' ? 'Crítica' : log.severity === 'High' ? 'Alta' : log.severity === 'Medium' ? 'Media' : 'Baja'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(log)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-blue-200">
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDelete(log.id)} className="bg-red-50 hover:bg-red-100 text-red-700 text-[12px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-red-200">
                                                    <Trash2 size={14} />
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
        </div>
    )
}
