import { useEffect, useState } from 'react'
import { observationLogsApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Eye, X, CheckCircle2, XCircle } from 'lucide-react'

export default function Observations() {
  const [logs, setLogs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const { addToast } = useToast()

  const emptyForm = {
    testPlanId: 1, testTaskId: 1, participantName: '', participantAge: 22,
    participantProfile: '', taskSuccess: true, timeSeconds: 60, errorCount: 0,
    severity: 'Media', notes: ''
  }
  const [form, setForm] = useState(emptyForm)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      observationLogsApi.getAll(1),
      testTasksApi.getAll(1)
    ]).then(([logsRes, tasksRes]) => {
      setLogs(logsRes.data)
      setTasks(tasksRes.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  const handleEdit = (log: any) => {
    setForm({
      testPlanId: log.testPlanId, testTaskId: log.testTaskId, participantName: log.participantName,
      participantAge: log.participantAge || 22, participantProfile: log.participantProfile,
      taskSuccess: log.taskSuccess, timeSeconds: log.timeSeconds, errorCount: log.errorCount,
      severity: log.severity, notes: log.notes
    })
    setEditId(log.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.participantName.trim()) { addToast('Nombre del participante requerido', 'error'); return }
    try {
      if (editId) {
        await observationLogsApi.update(editId, { id: editId, ...form })
        addToast('Registro actualizado', 'success')
      } else {
        await observationLogsApi.create(form)
        addToast('Registro creado', 'success')
      }
      resetForm(); fetchData()
    } catch { addToast('Error al guardar', 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return
    try { await observationLogsApi.delete(id); addToast('Registro eliminado', 'success'); fetchData() }
    catch { addToast('Error al eliminar', 'error') }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900">Registro de Observación</h2>
          <p className="text-[13px] text-slate-500 mt-1">Registra datos de cada participante por tarea: éxito, tiempo, errores y severidad</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true) }} className="btn btn-primary">
          <Plus size={16} aria-hidden="true" /> Nuevo Registro
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de observación">
          <div className="modal-content">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Registro' : 'Nuevo Registro'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="participantName" className="form-label">Participante *</label>
                  <input id="participantName" value={form.participantName} onChange={e => setForm(f => ({ ...f, participantName: e.target.value }))} className="form-input" required />
                </div>
                <div>
                  <label htmlFor="participantAge" className="form-label">Edad</label>
                  <input id="participantAge" type="number" value={form.participantAge} onChange={e => setForm(f => ({ ...f, participantAge: Number(e.target.value) }))} className="form-input" min={10} max={99} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="participantProfile" className="form-label">Perfil</label>
                  <input id="participantProfile" value={form.participantProfile} onChange={e => setForm(f => ({ ...f, participantProfile: e.target.value }))} className="form-input" placeholder="Ej: Estudiante de Ingeniería" />
                </div>
                <div>
                  <label htmlFor="testTaskId" className="form-label">Tarea</label>
                  <select id="testTaskId" value={form.testTaskId} onChange={e => setForm(f => ({ ...f, testTaskId: Number(e.target.value) }))} className="form-input">
                    {tasks.map((t: any) => <option key={t.id} value={t.id}>T{t.taskNumber} — {t.scenario.substring(0, 40)}...</option>)}
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
                  <label htmlFor="timeSeconds" className="form-label">Tiempo (seg)</label>
                  <input id="timeSeconds" type="number" value={form.timeSeconds} onChange={e => setForm(f => ({ ...f, timeSeconds: Number(e.target.value) }))} className="form-input" min={0} />
                </div>
                <div>
                  <label htmlFor="errorCount" className="form-label">Errores</label>
                  <input id="errorCount" type="number" value={form.errorCount} onChange={e => setForm(f => ({ ...f, errorCount: Number(e.target.value) }))} className="form-input" min={0} />
                </div>
              </div>
              <div>
                <label htmlFor="severity" className="form-label">Severidad</label>
                <select id="severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="form-input">
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="form-label">Notas</label>
                <textarea id="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="form-input" rows={3} placeholder="Observaciones del moderador..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Eye size={40} className="text-slate-300 mx-auto" />
          <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin registros</h3>
          <p className="text-[13px] text-slate-400 mt-1">Comienza a registrar observaciones de los participantes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
          <div className="overflow-x-auto soft-scrollbar">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Participante</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Tarea</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Éxito</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Tiempo</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Errores</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Severidad</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any, i: number) => (
                  <tr key={log.id} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{log.participantName}</div>
                      <div className="text-[11px] text-slate-400">{log.participantProfile} · {log.participantAge} años</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">T{log.testTask?.taskNumber || log.testTaskId}</td>
                    <td className="px-4 py-3">
                      {log.taskSuccess
                        ? <CheckCircle2 size={16} className="text-emerald-500" aria-label="Éxito" />
                        : <XCircle size={16} className="text-red-400" aria-label="Fallo" />}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{log.timeSeconds}s</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{log.errorCount}</td>
                    <td className="px-4 py-3"><span className={`badge badge-${log.severity.toLowerCase()}`}>{log.severity}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(log)} className="btn btn-secondary text-[11px] py-1 px-2" aria-label="Editar">Editar</button>
                        <button onClick={() => handleDelete(log.id)} className="btn btn-danger text-[11px] py-1 px-2" aria-label="Eliminar"><Trash2 size={12} /></button>
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
