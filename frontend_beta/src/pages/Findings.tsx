import { useEffect, useState } from 'react'
import { findingsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, Search, X, AlertCircle, AlertTriangle, ArrowRight, Filter } from 'lucide-react'

export default function Findings() {
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState<string>('')
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
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
            const planId = res.data?.[0]?.id ?? ''
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
                    testPlanId: activePlanId,
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
            resetForm();
            if (activePlanId) fetchFindings(activePlanId)
        } catch { addToast('Error al guardar', 'error') }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este hallazgo?')) return
        try {
            await findingsApi.delete(id)
            addToast('Hallazgo eliminado', 'success')
            if (activePlanId) fetchFindings(activePlanId)
        }
        catch { addToast('Error al eliminar', 'error') }
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
                <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true) }}
                    className="btn btn-primary shadow-md hover:shadow-lg transition-shadow flex items-center gap-2">
                    <Plus size={16} aria-hidden="true" /> Nuevo Hallazgo
                </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-slate-400" aria-hidden="true" />
                <span className="text-[12px] text-slate-400 font-semibold">Severidad:</span>
                {['', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${filter === s ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {s === '' ? 'Todas' : s === 'Critical' ? 'Crítica' : s === 'High' ? 'Alta' : s === 'Medium' ? 'Media' : 'Baja'}
                    </button>
                ))}
                <span className="text-[11px] text-slate-400 ml-auto">{filtered.length} de {findings.length} hallazgos</span>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de hallazgo">
                    <div className="modal-content rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-rise">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label htmlFor="description" className="form-label">Descripción *</label>
                                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" rows={3} required />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
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
                                    <label htmlFor="priority" className="form-label">Prioridad</label>
                                    <select id="priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="form-input">
                                        <option value="High">Alta</option>
                                        <option value="Medium">Media</option>
                                        <option value="Low">Baja</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="frequency" className="form-label">Frecuencia</label>
                                    <input id="frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="form-input" placeholder="Ej: 2/3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="category" className="form-label">Categoría</label>
                                    <input id="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input" placeholder="Ej: Formularios" />
                                </div>
                                <div>
                                    <label htmlFor="tool" className="form-label">Herramienta</label>
                                    <select id="tool" value={form.tool} onChange={e => setForm(f => ({ ...f, tool: e.target.value }))} className="form-input">
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
                                <textarea id="recommendation" value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} className="form-input" rows={3} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Findings Cards */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <Search size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin hallazgos</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((finding: any) => (
                        <div key={finding.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise hover:shadow-md transition-shadow">
                            <div className={`h-1.5 w-full ${finding.severity === 'Critical' || finding.severity === 'High' ? 'bg-gradient-to-r from-red-500 to-red-400' : finding.severity === 'Medium' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} />
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className="text-[10px] font-mono text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">#{finding.id}</span>
                                        {finding.category && <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">{finding.category}</span>}
                                        <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">{finding.tool}</span>
                                    </div>
                                    <span className={`badge ${finding.severity === 'Critical' || finding.severity === 'High' ? 'badge-alta' : finding.severity === 'Medium' ? 'badge-media' : 'badge-baja'}`}>
                                        {finding.severity === 'Critical' || finding.severity === 'High' ? <AlertCircle size={10} /> : <AlertTriangle size={10} />}
                                        {finding.severity === 'Critical' ? 'Crítica' : finding.severity === 'High' ? 'Alta' : finding.severity === 'Medium' ? 'Media' : 'Baja'}
                                    </span>
                                </div>
                                <p className="text-[13px] font-medium text-gray-900 mt-1">{finding.description}</p>
                                {finding.recommendation && (
                                    <div className="mt-2 flex items-start gap-2 text-[12px] text-slate-600">
                                        <ArrowRight size={12} className="text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                        <span>{finding.recommendation}</span>
                                    </div>
                                )}
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        {finding.frequency && <span>Frecuencia: {finding.frequency}</span>}
                                        <span>·</span>
                                        <span>Prioridad: {finding.priority === 'High' ? 'Alta' : finding.priority === 'Medium' ? 'Media' : 'Baja'}</span>
                                        {finding.improvementActions?.length > 0 && (
                                            <><span>·</span><span className="text-emerald-600">{finding.improvementActions.length} acciones</span></>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(finding)} className="btn btn-secondary text-[10px] py-1 px-2">Editar</button>
                                        <button onClick={() => handleDelete(finding.id)} className="btn btn-danger text-[10px] py-1 px-2"><Trash2 size={11} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
