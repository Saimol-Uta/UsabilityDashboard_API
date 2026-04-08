import { useEffect, useState } from 'react'
import { moderatorScriptsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Save, MessageSquareText, Plus, Edit3, Trash2, AlertTriangle } from 'lucide-react'

export default function ModeratorScript() {
    const [script, setScript] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [scriptToDelete, setScriptToDelete] = useState<any | null>(null)
    const [form, setForm] = useState({ testPlanId: '', introduction: '', followUpQuestions: '', closingInstructions: '' })
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

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
            setScript(null)
            setForm(emptyForm)
        }
    }

    useEffect(() => {
        setLoading(true)
        loadScriptByPlan(activePlanId).finally(() => setLoading(false))
    }, [activePlanId])

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
        if (!activePlanId) { addToast('Selecciona un plan de prueba', 'error'); return }
        if (!form.introduction.trim()) { addToast('La introducción es obligatoria', 'error'); return }
        if (!form.followUpQuestions.trim()) { addToast('Las preguntas de seguimiento son obligatorias', 'error'); return }
        if (!form.closingInstructions.trim()) { addToast('Las instrucciones de cierre son obligatorias', 'error'); return }

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
                    testPlanId: activePlanId,
                    introduction: form.introduction,
                    followUpQuestions: form.followUpQuestions,
                    closingInstructions: form.closingInstructions,
                })
                addToast('Guión creado correctamente', 'success')
            }
            await loadScriptByPlan(activePlanId)
            refreshGates()
            resetForm()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar el guión'), 'error')
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await moderatorScriptsApi.delete(id)
            addToast('Guión eliminado correctamente', 'success')
            await loadScriptByPlan(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar el guión'), 'error')
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

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se puede modificar el guión.</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                <div className="p-5 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-bold text-slate-800">Plan de prueba activo</h3>
                        <div className="mt-1 text-[14px] font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                            {activePlan ? activePlan.projectName : 'Seleccione en el menú principal'}
                        </div>
                    </div>
                </div>
            </div>

            {!script ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center animate-rise">
                    <MessageSquareText size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin guión para este plan</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Crea el guión del moderador para iniciar las sesiones.</p>
                    <button type="button" onClick={openCreateModal} className="btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!activePlanId || isReadOnly}>
                        <Plus size={16} aria-hidden="true" /> Nuevo Guión
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                    <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[16px] font-semibold text-slate-900">{activePlan?.projectName || 'Plan'}</h3>
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
                            <button type="button" onClick={openEditModal} className="btn btn-secondary text-[12px] py-2 px-3" disabled={isReadOnly} aria-label="Editar guión">
                                <Edit3 size={14} aria-hidden="true" /> Editar
                            </button>
                            <button type="button" onClick={() => setScriptToDelete(script)} className="btn btn-danger text-[12px] py-2 px-3" disabled={isReadOnly} aria-label="Eliminar guión">
                                <Trash2 size={14} aria-hidden="true" /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Guión del Moderador' : 'Nuevo Guión del Moderador'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input bg-slate-50 text-slate-700 cursor-not-allowed">{activePlan?.projectName || 'Sin plan seleccionado'}</div>
                    </div>

                    <div>
                        <label htmlFor="introduction" className="form-label">Introducción <span className="text-red-500">*</span></label>
                        <textarea id="introduction" value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))} className="form-input" rows={4} required />
                    </div>

                    <div>
                        <label htmlFor="followUpQuestions" className="form-label">Preguntas de Seguimiento <span className="text-red-500">*</span></label>
                        <textarea id="followUpQuestions" value={form.followUpQuestions} onChange={e => setForm(f => ({ ...f, followUpQuestions: e.target.value }))} className="form-input" rows={4} required />
                    </div>

                    <div>
                        <label htmlFor="closingInstructions" className="form-label">Instrucciones de Cierre <span className="text-red-500">*</span></label>
                        <textarea id="closingInstructions" value={form.closingInstructions} onChange={e => setForm(f => ({ ...f, closingInstructions: e.target.value }))} className="form-input" rows={4} required />
                    </div>

                    <div className="pt-3 flex items-center gap-3">
                        <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}>
                            <Save size={16} aria-hidden="true" /> {saving ? 'Guardando...' : editId ? 'Actualizar Guión' : 'Crear Guión'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation */}
            <Modal isOpen={!!scriptToDelete} onClose={() => setScriptToDelete(null)} title="Eliminar Guión" maxWidth="480px">
                <div className="p-5 space-y-4">
                    <p className="text-[14px] text-slate-600">
                        ¿Estás seguro de que deseas eliminar el guión del plan <strong>{activePlan?.projectName || ''}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setScriptToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => scriptToDelete && confirmDelete(scriptToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}