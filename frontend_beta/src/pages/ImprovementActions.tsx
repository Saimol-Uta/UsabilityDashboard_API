import { useEffect, useState } from 'react'
import { improvementActionsApi, findingsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Lightbulb, X, CheckCircle2, Clock, Circle } from 'lucide-react'

const statusConfig: Record<string, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
    Closed: { label: 'Cerrada', badge: 'badge-completada', icon: CheckCircle2 },
    Resolved: { label: 'Resuelta', badge: 'badge-completada', icon: CheckCircle2 },
    InProgress: { label: 'En Progreso', badge: 'badge-enprogreso', icon: Clock },
    Open: { label: 'Abierta', badge: 'badge-pendiente', icon: Circle },
}

export default function ImprovementActions() {
    const [plans, setPlans] = useState<any[]>([])
    const [actions, setActions] = useState<any[]>([])
    const [findingsList, setFindingsList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState('')
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [actionToDelete, setActionToDelete] = useState<any | null>(null)
    const { addToast } = useToast()

    const emptyForm = { findingId: '', description: '', status: 'Open', priority: 'Medium' }
    const [form, setForm] = useState(emptyForm)

    const fetchData = async (planId: string) => {
        setLoading(true)
        try {
            const findingsRes = await findingsApi.getByPlan(planId)
            const findings = findingsRes.data ?? []
            setFindingsList(findings)

            if (findings.length > 0 && !form.findingId) {
                setForm(f => ({ ...f, findingId: findings[0].id }))
            }

            const actionResponses = await Promise.all(
                findings.map((f: any) => improvementActionsApi.getByFinding(f.id))
            )
            setActions(actionResponses.flatMap(r => r.data ?? []))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        testPlansApi.getAll().then(res => {
            const fetchedPlans = res.data ?? []
            setPlans(fetchedPlans)
            const planId = fetchedPlans[0]?.id ?? ''
            setActivePlanId(planId)
            if (planId) {
                fetchData(planId)
            } else {
                setLoading(false)
            }
        })
    }, [])

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
        if (!form.description.trim()) { addToast('La descripción es requerida', 'error'); return }
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
        } catch { addToast('Error al guardar', 'error') }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await improvementActionsApi.updateStatus(id, newStatus)
            addToast(`Estado actualizado a ${newStatus}`, 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch { addToast('Error al actualizar estado', 'error') }
    }

    const confirmDelete = async (id: string) => {
        try {
            await improvementActionsApi.delete(id)
            addToast('Acción eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch {
            addToast('Error al eliminar', 'error')
        } finally {
            setActionToDelete(null)
        }
    }

    const filtered = actions.filter(a => filter === '' || a.status === filter)
    const completedCount = actions.filter(a => a.status === 'Resolved' || a.status === 'Closed').length
    const inProgressCount = actions.filter(a => a.status === 'InProgress').length
    const pendingCount = actions.filter(a => a.status === 'Open').length

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[22px] font-bold text-slate-900">Acciones de Mejora</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Seguimiento de las acciones correctivas derivadas de los hallazgos</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {plans.length > 0 && (
                        <select 
                            className="form-input bg-white text-sm py-2" 
                            value={activePlanId}
                            onChange={(e) => {
                                setActivePlanId(e.target.value)
                                fetchData(e.target.value)
                            }}
                        >
                            {plans.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.projectName}</option>
                            ))}
                        </select>
                    )}
                    <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ ...emptyForm, findingId: findingsList[0]?.id ?? '' }); setShowForm(true) }}>
                        <Plus size={14} aria-hidden="true" /> Nueva Acción
                    </button>
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="kpi-card p-6 text-center rounded-3xl shadow-lg bg-emerald-50 border-2 border-emerald-300 transform hover:-translate-y-1 transition-transform hover:shadow-xl animate-pop">
                    <div className="text-3xl font-extrabold text-emerald-700">{completedCount}</div>
                    <div className="text-sm text-emerald-600 mt-1 uppercase tracking-wider">Completadas</div>
                </div>
                <div className="kpi-card p-6 text-center rounded-3xl shadow-lg bg-amber-50 border-2 border-amber-300 transform hover:-translate-y-1 transition-transform hover:shadow-xl animate-pop delay-1">
                    <div className="text-3xl font-extrabold text-amber-700">{inProgressCount}</div>
                    <div className="text-sm text-amber-600 mt-1 uppercase tracking-wider">En Progreso</div>
                </div>
                <div className="kpi-card p-6 text-center rounded-3xl shadow-lg bg-slate-100 border-2 border-slate-300 transform hover:-translate-y-1 transition-transform hover:shadow-xl animate-pop delay-2">
                    <div className="text-3xl font-extrabold text-slate-700">{pendingCount}</div>
                    <div className="text-sm text-slate-500 mt-1 uppercase tracking-wider">Pendientes</div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {['', 'Resolved', 'InProgress', 'Open', 'Closed'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${filter === s ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {s === '' ? 'Todas' : statusConfig[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de acción de mejora">
                    <div className="modal-content rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Acción' : 'Nueva Acción'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="form-label">Evaluación / Plan asignado</label>
                                <div className="form-input bg-slate-50 text-slate-700">{plans.find(p => p.id === activePlanId)?.projectName || 'Sin plan'}</div>
                            </div>
                            <div>
                                <label htmlFor="findingId" className="form-label">Hallazgo asociado <span className="text-red-500">*</span></label>
                                <select id="findingId" value={form.findingId} onChange={e => setForm(f => ({ ...f, findingId: e.target.value }))} className="form-input" required>
                                    {findingsList.map((f: any) => <option key={f.id} value={f.id}>{f.description.length > 80 ? f.description.substring(0, 80) + '...' : f.description}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className="form-label">Descripción <span className="text-red-500">*</span></label>
                                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" rows={3} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="form-label">Estado <span className="text-red-500">*</span></label>
                                    <select id="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input" required>
                                        <option value="Open">Abierta</option>
                                        <option value="InProgress">En Progreso</option>
                                        <option value="Resolved">Resuelta</option>
                                        <option value="Closed">Cerrada</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="priority" className="form-label">Prioridad <span className="text-red-500">*</span></label>
                                    <select id="priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input" required>
                                        <option value="High">Alta</option>
                                        <option value="Medium">Media</option>
                                        <option value="Low">Baja</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-3">
                                <button type="submit" className="btn btn-primary">
                                    <Save size={16} /> {editId ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary text-center">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Actions List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                    <Lightbulb size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin acciones de mejora</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((action: any) => {
                        const config = statusConfig[action.status] || statusConfig.Open
                        const Icon = config.icon
                        return (
                            <div key={action.id} className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start gap-3 sm:gap-4 flex-col sm:flex-row">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                                        ${action.status === 'Resolved' || action.status === 'Closed' ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-700' :
                                        action.status === 'InProgress' ? 'bg-amber-100 border-2 border-amber-400 text-amber-700' :
                                        'bg-slate-200 border-2 border-slate-400 text-slate-600'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`badge ${config.badge} font-bold`}>{config.label}</span>
                                            <span className={`badge ${action.priority === 'High' ? 'badge-alta' : action.priority === 'Medium' ? 'badge-media' : 'badge-baja'} font-semibold`}>
                                                Prioridad: {action.priority === 'High' ? 'Alta' : action.priority === 'Medium' ? 'Media' : 'Baja'}
                                            </span>
                                        </div>
                                        <p className="text-[14px] font-semibold text-slate-900 mt-2">{action.description}</p>
                                        <p className="text-[11px] text-slate-400 mt-1 italic">
                                            Hallazgo: {findingsList.find((f: any) => f.id === action.findingId)?.description || 'Desconocido'}
                                        </p>
                                        {action.implementedDate && (
                                            <p className="text-[11px] text-emerald-600 mt-1">✓ Implementado: {new Date(action.implementedDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                                        {action.status !== 'Closed' && (
                                            <button onClick={() => handleStatusChange(action.id, action.status === 'Open' ? 'InProgress' : action.status === 'InProgress' ? 'Resolved' : 'Closed')}
                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-emerald-200">
                                                {action.status === 'Open' ? 'Iniciar' : action.status === 'InProgress' ? 'Resolver' : 'Cerrar'}
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(action)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-blue-200">
                                            Editar
                                        </button>
                                        <button onClick={() => setActionToDelete(action)} className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-red-200">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {actionToDelete && (
                <div className="modal-overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) setActionToDelete(null) }} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
                    <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">Eliminar Acción de Mejora</h3>
                            <button onClick={() => setActionToDelete(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <div className="p-5">
                            <p className="text-[14px] text-slate-600 mb-5">
                                ¿Estás seguro de que deseas eliminar esta acción de mejora? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActionToDelete(null)} className="btn btn-secondary text-center">Cancelar</button>
                                <button type="button" onClick={() => confirmDelete(actionToDelete.id)} className="btn btn-danger px-4 text-center">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}