import { useEffect, useState } from 'react'
import { moderatorScriptsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Save, MessageSquareText, Plus, Edit3, Trash2, X } from 'lucide-react'

export default function ModeratorScript() {
    const [script, setScript] = useState<any>(null)
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activePlanId, setActivePlanId] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [scriptToDelete, setScriptToDelete] = useState<any | null>(null)
    const [form, setForm] = useState({ testPlanId: '', introduction: '', followUpQuestions: '', closingInstructions: '' })
    const { addToast } = useToast()

    const emptyForm = { testPlanId: '', introduction: '', followUpQuestions: '', closingInstructions: '' }

    const loadScriptByPlan = async (planId: string) => {
        if (!planId) {
            setScript(null)
            setForm(emptyForm)
            return
        }

        try {
            const res = await moderatorScriptsApi.getByPlan(planId)
            const s = res.data
            if (s) {
                setScript(s)
                setForm({ testPlanId: s.testPlanId, introduction: s.introduction, followUpQuestions: s.followUpQuestions, closingInstructions: s.closingInstructions })
            } else {
                setScript(null)
                setForm(emptyForm)
            }
        } catch {
            // Si no existe guion para el plan, preparar formulario limpio.
            setScript(null)
            setForm(emptyForm)
        }
    }

    useEffect(() => {
        testPlansApi.getAll()
            .then(async (plansRes) => {
                const allPlans = plansRes.data ?? []
                setPlans(allPlans)
                const planId = allPlans[0]?.id ?? ''
                setActivePlanId(planId)
                await loadScriptByPlan(planId)
            })
            .finally(() => { setLoading(false) })
    }, [])

    const handlePlanChange = async (planId: string) => {
        setActivePlanId(planId)
        setLoading(true)
        await loadScriptByPlan(planId)
        setLoading(false)
    }

    const getPlanName = (planId: string) => {
        return plans.find((p: any) => p.id === planId)?.projectName || 'Sin plan seleccionado'
    }

    const resetForm = () => {
        setForm({ ...emptyForm, testPlanId: activePlanId })
        setEditId(null)
        setShowForm(false)
    }

    const openCreateModal = () => {
        setEditId(null)
        setForm({ ...emptyForm, testPlanId: activePlanId })
        setShowForm(true)
    }

    const openEditModal = () => {
        if (!script) return
        setEditId(script.id)
        setForm({
            testPlanId: script.testPlanId,
            introduction: script.introduction || '',
            followUpQuestions: script.followUpQuestions || '',
            closingInstructions: script.closingInstructions || '',
        })
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.testPlanId) {
            addToast('Selecciona un plan de prueba', 'error')
            return
        }
        if (!form.introduction.trim()) {
            addToast('La introducción es obligatoria', 'error')
            return
        }
        if (!form.followUpQuestions.trim()) {
            addToast('Las preguntas de seguimiento son obligatorias', 'error')
            return
        }
        if (!form.closingInstructions.trim()) {
            addToast('Las instrucciones de cierre son obligatorias', 'error')
            return
        }
        setSaving(true)
        try {
            if (editId) {
                await moderatorScriptsApi.update(editId, {
                    introduction: form.introduction,
                    followUpQuestions: form.followUpQuestions,
                    closingInstructions: form.closingInstructions,
                })
                addToast('Guión actualizado correctamente', 'success')
            } else {
                await moderatorScriptsApi.create({
                    testPlanId: form.testPlanId,
                    introduction: form.introduction,
                    followUpQuestions: form.followUpQuestions,
                    closingInstructions: form.closingInstructions,
                })
                addToast('Guión creado correctamente', 'success')
            }
            setActivePlanId(form.testPlanId)
            await loadScriptByPlan(form.testPlanId)
            resetForm()
        } catch { addToast('Error al guardar el guión', 'error') }
        finally { setSaving(false) }
    }

    const confirmDelete = async (id: string) => {
        try {
            await moderatorScriptsApi.delete(id)
            addToast('Guión eliminado correctamente', 'success')
            await loadScriptByPlan(activePlanId)
        } catch {
            addToast('Error al eliminar el guión', 'error')
        } finally {
            setScriptToDelete(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-[24px] font-extrabold text-slate-900">Guión del Moderador</h2>
                <p className="text-[13px] text-slate-500 mt-1">Define las instrucciones para guiar la sesión de prueba de usabilidad</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                <div className="p-5 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="min-w-0 md:w-[460px]">
                        <label htmlFor="moderatorPlanSelector" className="form-label">Plan de prueba activo</label>
                        <select id="moderatorPlanSelector" value={activePlanId} onChange={e => handlePlanChange(e.target.value)} className="form-input">
                            <option value="">Selecciona un plan</option>
                            {plans.map((plan: any) => (
                                <option key={plan.id} value={plan.id}>{plan.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-[13px] text-slate-500 md:mb-2">Este guion quedará asociado al plan seleccionado.</p>
                </div>
            </div>

            {!script ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center animate-rise">
                    <MessageSquareText size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin guión para este plan</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Crea el guión del moderador para iniciar las sesiones.</p>
                    <button type="button" onClick={openCreateModal} className="btn btn-primary mt-4" disabled={!activePlanId}>
                        <Plus size={16} aria-hidden="true" /> Nuevo Guión
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                    <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[16px] font-semibold text-slate-900">{getPlanName(activePlanId)}</h3>
                                <p className="text-[12px] text-slate-500 mt-1">Guión del moderador activo</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <h4 className="text-[12px] font-semibold text-blue-900 mb-1">Introducción</h4>
                                <p className="text-[12px] text-slate-700 line-clamp-4">{script.introduction}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                <h4 className="text-[12px] font-semibold text-amber-900 mb-1">Preguntas</h4>
                                <p className="text-[12px] text-slate-700 line-clamp-4 whitespace-pre-line">{script.followUpQuestions}</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                <h4 className="text-[12px] font-semibold text-emerald-900 mb-1">Cierre</h4>
                                <p className="text-[12px] text-slate-700 line-clamp-4">{script.closingInstructions}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button type="button" onClick={openEditModal} className="btn btn-secondary text-[12px] py-2 px-3">
                                <Edit3 size={14} aria-hidden="true" /> Editar
                            </button>
                            <button type="button" onClick={() => setScriptToDelete(script)} className="btn btn-danger text-[12px] py-2 px-3">
                                <Trash2 size={14} aria-hidden="true" /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de guión del moderador">
                    <div className="modal-content rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <h3 className="text-[18px] font-semibold text-slate-900">{editId ? 'Editar Guión del Moderador' : 'Nuevo Guión del Moderador'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="moderatorScriptPlanId" className="form-label">Plan asignado <span className="text-red-500">*</span></label>
                                <select
                                    id="moderatorScriptPlanId"
                                    value={form.testPlanId}
                                    onChange={e => setForm(f => ({ ...f, testPlanId: e.target.value }))}
                                    className="form-input"
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
                                <label htmlFor="introduction" className="form-label">Introducción <span className="text-red-500">*</span></label>
                                <textarea
                                    id="introduction"
                                    value={form.introduction}
                                    onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))}
                                    className="form-input"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="followUpQuestions" className="form-label">Preguntas de Seguimiento <span className="text-red-500">*</span></label>
                                <textarea
                                    id="followUpQuestions"
                                    value={form.followUpQuestions}
                                    onChange={e => setForm(f => ({ ...f, followUpQuestions: e.target.value }))}
                                    className="form-input"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="closingInstructions" className="form-label">Instrucciones de Cierre <span className="text-red-500">*</span></label>
                                <textarea
                                    id="closingInstructions"
                                    value={form.closingInstructions}
                                    onChange={e => setForm(f => ({ ...f, closingInstructions: e.target.value }))}
                                    className="form-input"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="pt-3 flex items-center gap-3">
                                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}>
                                    <Save size={16} aria-hidden="true" /> {saving ? 'Guardando...' : editId ? 'Actualizar Guión' : 'Crear Guión'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {scriptToDelete && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setScriptToDelete(null) }} role="dialog" aria-modal="true" aria-label="Confirmar eliminación de guión">
                    <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">Eliminar Guión</h3>
                            <button onClick={() => setScriptToDelete(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-[14px] text-slate-600">
                                ¿Estás seguro de que deseas eliminar el guión del plan <strong>{getPlanName(activePlanId)}</strong>? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setScriptToDelete(null)} className="btn btn-secondary">Cancelar</button>
                                <button type="button" onClick={() => confirmDelete(scriptToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}