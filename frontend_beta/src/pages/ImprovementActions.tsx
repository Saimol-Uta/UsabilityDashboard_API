import { useEffect, useState } from 'react'
import { improvementActionsApi, findingsApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Lightbulb, X, CheckCircle2, Clock, Circle } from 'lucide-react'

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  Completada: { label: 'Completada', badge: 'badge-completada', icon: CheckCircle2 },
  EnProgreso: { label: 'En Progreso', badge: 'badge-enprogreso', icon: Clock },
  Pendiente: { label: 'Pendiente', badge: 'badge-pendiente', icon: Circle },
}

export default function ImprovementActions() {
  const [actions, setActions] = useState<any[]>([])
  const [findingsList, setFindingsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const { addToast } = useToast()

  const emptyForm = { findingId: 1, description: '', status: 'Pendiente', priority: 'Media' }
  const [form, setForm] = useState(emptyForm)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      improvementActionsApi.getAll(),
      findingsApi.getAll(1)
    ]).then(([actionsRes, findingsRes]) => {
      setActions(actionsRes.data)
      setFindingsList(findingsRes.data)
      if (findingsRes.data.length > 0 && form.findingId === 1) {
        setForm(f => ({ ...f, findingId: findingsRes.data[0].id }))
      }
    }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  const handleEdit = (a: any) => {
    setForm({ findingId: a.findingId, description: a.description, status: a.status, priority: a.priority })
    setEditId(a.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { addToast('La descripción es requerida', 'error'); return }
    try {
      if (editId) {
        await improvementActionsApi.update(editId, { id: editId, ...form })
        addToast('Acción actualizada', 'success')
      } else {
        await improvementActionsApi.create(form)
        addToast('Acción creada', 'success')
      }
      resetForm(); fetchData()
    } catch { addToast('Error al guardar', 'error') }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await improvementActionsApi.updateStatus(id, newStatus)
      addToast(`Estado actualizado a ${newStatus}`, 'success')
      fetchData()
    } catch { addToast('Error al actualizar estado', 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta acción?')) return
    try { await improvementActionsApi.delete(id); addToast('Acción eliminada', 'success'); fetchData() }
    catch { addToast('Error al eliminar', 'error') }
  }

  const filtered = actions.filter(a => filter === '' || a.status === filter)
  const completedCount = actions.filter(a => a.status === 'Completada').length
  const inProgressCount = actions.filter(a => a.status === 'EnProgreso').length
  const pendingCount = actions.filter(a => a.status === 'Pendiente').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900">Acciones de Mejora</h2>
          <p className="text-[13px] text-slate-500 mt-1">Seguimiento de las acciones correctivas derivadas de los hallazgos</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true) }} className="btn btn-primary">
          <Plus size={16} aria-hidden="true" /> Nueva Acción
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card p-4 text-center animate-rise">
          <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Completadas</div>
        </div>
        <div className="kpi-card p-4 text-center animate-rise delay-1">
          <div className="text-2xl font-bold text-amber-500">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">En Progreso</div>
        </div>
        <div className="kpi-card p-4 text-center animate-rise delay-2">
          <div className="text-2xl font-bold text-slate-400">{pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Pendientes</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'Completada', 'EnProgreso', 'Pendiente'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${filter === s ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            {s === '' ? 'Todas' : s === 'EnProgreso' ? 'En Progreso' : s}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de acción de mejora">
          <div className="modal-content">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Acción' : 'Nueva Acción'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label htmlFor="findingId" className="form-label">Hallazgo asociado</label>
                <select id="findingId" value={form.findingId} onChange={e => setForm(f => ({ ...f, findingId: Number(e.target.value) }))} className="form-input">
                  {findingsList.map((f: any) => <option key={f.id} value={f.id}>#{f.id} — {f.description.substring(0, 50)}...</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="form-label">Descripción *</label>
                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="form-label">Estado</label>
                  <select id="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input">
                    <option value="Pendiente">Pendiente</option>
                    <option value="EnProgreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="form-label">Prioridad</label>
                  <select id="priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input">
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actions List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Lightbulb size={40} className="text-slate-300 mx-auto" />
          <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin acciones de mejora</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((action: any) => {
            const config = statusConfig[action.status] || statusConfig.Pendiente
            const Icon = config.icon
            return (
              <div key={action.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-rise hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.status === 'Completada' ? 'bg-emerald-50 border border-emerald-100' : action.status === 'EnProgreso' ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100'}`}>
                    <Icon size={18} className={action.status === 'Completada' ? 'text-emerald-500' : action.status === 'EnProgreso' ? 'text-amber-500' : 'text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${config.badge}`}>{config.label}</span>
                      <span className={`badge ${action.priority === 'Alta' ? 'badge-alta' : action.priority === 'Media' ? 'badge-media' : 'badge-baja'}`}>
                        Prioridad: {action.priority}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-900 mt-1.5">{action.description}</p>
                    {action.finding && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        Hallazgo: {action.finding.description?.substring(0, 60)}...
                      </p>
                    )}
                    {action.implementedDate && (
                      <p className="text-[11px] text-emerald-600 mt-1">
                        ✓ Implementado: {new Date(action.implementedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {action.status !== 'Completada' && (
                      <button onClick={() => handleStatusChange(action.id, action.status === 'Pendiente' ? 'EnProgreso' : 'Completada')}
                        className="btn btn-success text-[10px] py-1 px-2">
                        {action.status === 'Pendiente' ? 'Iniciar' : 'Completar'}
                      </button>
                    )}
                    <button onClick={() => handleEdit(action)} className="btn btn-secondary text-[10px] py-1 px-2">Editar</button>
                    <button onClick={() => handleDelete(action.id)} className="btn btn-danger text-[10px] py-1 px-2"><Trash2 size={11} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
