import { useEffect, useState } from 'react'
import { findingsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Search, X, AlertCircle, AlertTriangle, ArrowRight, Filter } from 'lucide-react'

export default function Findings() {
    const [findings, setFindings] = useState<any[]>([])
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState<string>('')
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [findingToDelete, setFindingToDelete] = useState<any | null>(null)
    const { addToast } = useToast()

    const emptyForm = {
        testPlanId: '', description: '', frequency: '', severity: 'Medium',
        priority: 'Medium', status: 'Open', category: '', recommendation: '', tool: 'WAVE'
    }
    const [form, setForm] = useState(emptyForm)

    const fetchFindings = (planId: string) => {
        setLoading(true)
        findingsApi.getByPlan(planId).then(res => setFindings(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => {
        testPlansApi.getAll().then(res => {
            const allPlans = res.data ?? []
            setPlans(allPlans)
            const planId = allPlans[0]?.id ?? ''
            setActivePlanId(planId)
            if (planId) {
                setForm(f => ({ ...f, testPlanId: planId }))
                fetchFindings(planId)
            } else {
                setLoading(false)
            }
        })
    }, [])

    const resetForm = () => {
        setForm({ ...emptyForm, testPlanId: activePlanId })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (f: any) => {
        setForm({
            testPlanId: f.testPlanId, description: f.description, frequency: f.frequency,
            severity: f.severity, priority: f.priority, status: f.status ?? 'Open',
            category: f.category, recommendation: f.recommendation, tool: f.tool
        })
        setEditId(f.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.testPlanId) { addToast('Selecciona un plan de prueba', 'error'); return }
        if (!form.description.trim()) { addToast('La descripción es requerida', 'error'); return }
        try {
            if (editId) {
                await findingsApi.update(editId, {
                    description: form.description,
                    frequency: form.frequency,
                    severity: form.severity,
                    priority: form.priority,
                    status: form.status,
                    recommendation: form.recommendation,
                    category: form.category,
                    tool: form.tool,
                })
                addToast('Hallazgo actualizado', 'success')
            } else {
                await findingsApi.create({
                    testPlanId: form.testPlanId,
                    description: form.description,
                    frequency: form.frequency,
                    severity: form.severity,
                    priority: form.priority,
                    recommendation: form.recommendation,
                    category: form.category,
                    tool: form.tool,
                })
                addToast('Hallazgo creado', 'success')
            }
            if (activePlanId !== form.testPlanId) {
                setActivePlanId(form.testPlanId)
            }
            resetForm();
            if (form.testPlanId) fetchFindings(form.testPlanId)
        } catch { addToast('Error al guardar', 'error') }
    }

    const confirmDelete = async (id: string) => {
        try {
            await findingsApi.delete(id)
            addToast('Hallazgo eliminado', 'success')
            if (activePlanId) fetchFindings(activePlanId)
        } catch {
            addToast('Error al eliminar', 'error')
        } finally {
            setFindingToDelete(null)
        }
    }

    const filtered = findings.filter(f =>
        filter === '' || f.severity === filter
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Síntesis de Hallazgos</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Problemas de usabilidad detectados con frecuencia, severidad y recomendaciones</p>
                </div>
                <button onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId }); setShowForm(true) }}
                    className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                    <Plus size={18} aria-hidden="true" /> Nuevo Hallazgo
                </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-slate-400" aria-hidden="true" />
                <span className="text-[12px] text-slate-400 font-semibold">Severidad:</span>
                {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`text-[13px] px-4 py-2 rounded-full border transition-all duration-200 font-medium ${filter === s ? 'bg-gradient-to-r from-blue-200 to-blue-100 border-blue-300 text-blue-700 shadow-md scale-105' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                        {s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}
                    </button>
                ))}
                <span className="text-[11px] text-slate-400 ml-auto">{filtered.length} de {findings.length} hallazgos</span>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de hallazgo">
                    <div className="modal-content rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h3 className="text-[18px] font-semibold text-slate-900">{editId ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors" aria-label="Cerrar"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="findingPlanId" className="form-label">Plan asignado <span className="text-red-500">*</span></label>
                                <select
                                    id="findingPlanId"
                                    value={form.testPlanId}
                                    onChange={e => setForm(f => ({ ...f, testPlanId: e.target.value }))}
                                    className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500"
                                    disabled={Boolean(editId)}
                                    required
                                >
                                    <option value="">Selecciona un plan</option>
                                    {plans.map((plan: any) => (
                                        <option key={plan.id} value={plan.id}>{plan.projectName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className="form-label">Descripción <span className="text-red-500">*</span></label>
                                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" rows={3} required />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="severity" className="form-label">Severidad <span className="text-red-500">*</span></label>
                                    <select id="severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" required>
                                        <option value="Critical">Crítica</option>
                                        <option value="High">Alta</option>
                                        <option value="Medium">Media</option>
                                        <option value="Low">Baja</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="priority" className="form-label">Prioridad <span className="text-red-500">*</span></label>
                                    <select id="priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" required>
                                        <option value="High">Alta</option>
                                        <option value="Medium">Media</option>
                                        <option value="Low">Baja</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="form-label">Estado <span className="text-red-500">*</span></label>
                                    <select id="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" required>
                                        <option value="Open">Abierta</option>
                                        <option value="Resolved">Resuelta</option>
                                        <option value="Closed">Cerrada</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="frequency" className="form-label">Frecuencia</label>
                                    <input id="frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" placeholder="Ej: 2/3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category" className="form-label">Categoría</label>
                                    <input id="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" placeholder="Ej: Formularios" />
                                </div>
                                <div>
                                    <label htmlFor="tool" className="form-label">Herramienta</label>
                                    <select id="tool" value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500">
                                        <option value="WAVE">WAVE</option>
                                        <option value="Lighthouse">Lighthouse</option>
                                        <option value="Stark">Stark</option>
                                        <option value="WAVE + Lighthouse">WAVE + Lighthouse</option>
                                        <option value="Observación manual">Observación manual</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="recommendation" className="form-label">Recomendación</label>
                                <textarea id="recommendation" value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} className="form-input border border-slate-300 shadow-sm focus:ring-1 focus:ring-blue-500" rows={3} />
                            </div>
                            <div className="flex items-center gap-3 pt-3">
                                <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
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

            {/* Findings Cards */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-inner">
                    <Search size={48} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-[18px] font-semibold text-slate-700 mb-2">Sin hallazgos</h3>
                    <p className="text-[14px] text-slate-500">No se encontraron hallazgos que coincidan con el filtro seleccionado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((finding: any) => (
                        <div key={finding.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                            <div className={`h-2 w-full ${finding.severity === 'Critical' ? 'bg-gradient-to-r from-red-600 to-red-500' : finding.severity === 'High' ? 'bg-gradient-to-r from-orange-500 to-red-400' : finding.severity === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`} />
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 shadow-sm">#{finding.id}</span>
                                        {finding.category && <span className="text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-md border border-blue-200 shadow-sm">{finding.category}</span>}
                                        <span className="text-[11px] font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-md border border-purple-200 shadow-sm">{finding.tool}</span>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold shadow-md ${finding.severity === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' : finding.severity === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-300' : finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                                        {finding.severity === 'Critical' || finding.severity === 'High' ? <AlertCircle size={12} /> : <AlertTriangle size={12} />}
                                        {finding.severity === 'Critical' ? 'Crítica' : finding.severity === 'High' ? 'Alta' : finding.severity === 'Medium' ? 'Media' : 'Baja'}
                                    </span>
                                </div>
                                <p className="text-[15px] font-semibold text-gray-900 mb-3 leading-relaxed">{finding.description}</p>
                                {finding.recommendation && (
                                    <div className="mb-4 flex items-start gap-3 text-[13px] text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-blue-400">
                                        <ArrowRight size={14} className="text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                        <span className="font-medium">{finding.recommendation}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                        {finding.frequency && <span className="bg-slate-100 px-2 py-1 rounded-md">Frecuencia: {finding.frequency}</span>}
                                        <span className="bg-slate-100 px-2 py-1 rounded-md">Prioridad: {finding.priority === 'High' ? 'Alta' : finding.priority === 'Medium' ? 'Media' : 'Baja'}</span>
                                        {finding.improvementActions?.length > 0 && (
                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-semibold">{finding.improvementActions.length} acciones</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(finding)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-blue-200">
                                            Editar
                                        </button>
                                        <button onClick={() => setFindingToDelete(finding)} className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium border border-red-200">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {findingToDelete && (
                <div className="modal-overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) setFindingToDelete(null) }} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
                    <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">Eliminar Hallazgo</h3>
                            <button onClick={() => setFindingToDelete(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <div className="p-5">
                            <p className="text-[14px] text-slate-600 mb-5">
                                ¿Estás seguro de que deseas eliminar este hallazgo? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setFindingToDelete(null)} className="btn btn-secondary">Cancelar</button>
                                <button type="button" onClick={() => confirmDelete(findingToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}