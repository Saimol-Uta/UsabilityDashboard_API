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
        return (
            <div className="dashboard-loader-container">
                <div className="dashboard-spinner" />
            </div>
        )
    }

    return (
        <div className="page-container" style={{ maxWidth: 1024, margin: '0 auto', width: '100%' }}>
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Guión del Moderador</h2>
                    <p className="page-header-subtitle">Define las instrucciones para guiar la sesión de prueba de usabilidad</p>
                </div>
            </div>

            {/* Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner">
                    <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se puede modificar el guión.</span>
                </div>
            )}

            <div className="script-plan-card">
                <div className="testplan-card-bar" />
                <div className="script-plan-body">
                    <div>
                        <h3 className="script-plan-title">Plan de prueba activo</h3>
                        <div className="script-plan-name">
                            {activePlan ? activePlan.projectName : 'Seleccione en el menú principal'}
                        </div>
                    </div>
                </div>
            </div>

            {!script ? (
                <div className="empty-state-card">
                    <MessageSquareText size={40} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin guión para este plan</h3>
                    <p className="empty-state-subtitle">Crea el guión del moderador para iniciar las sesiones.</p>
                    <button type="button" onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} disabled={!activePlanId || isReadOnly}>
                        <Plus size={16} aria-hidden="true" /> Nuevo Guión
                    </button>
                </div>
            ) : (
                <div className="script-plan-card">
                    <div className="testplan-card-bar" />
                    <div className="script-plan-body">
                        <div className="testplan-card-header">
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <h3 className="testplan-card-title">{activePlan?.projectName || 'Plan'}</h3>
                                <p className="testplan-card-objective" style={{ marginTop: '2px' }}>Guión del moderador activo</p>
                            </div>
                        </div>

                        <div className="script-columns-grid">
                            <div className="script-column-card script-column-card--blue">
                                <h4 className="script-column-title script-column-title--blue">Introducción</h4>
                                <p className="script-column-text">{script.introduction}</p>
                            </div>
                            <div className="script-column-card script-column-card--amber">
                                <h4 className="script-column-title script-column-title--amber">Preguntas</h4>
                                <p className="script-column-text">{script.followUpQuestions}</p>
                            </div>
                            <div className="script-column-card script-column-card--emerald">
                                <h4 className="script-column-title script-column-title--emerald">Cierre</h4>
                                <p className="script-column-text">{script.closingInstructions}</p>
                            </div>
                        </div>

                        <div className="testplan-card-footer" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button type="button" onClick={openEditModal} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} disabled={isReadOnly} aria-label="Editar guión">
                                    <Edit3 size={14} aria-hidden="true" /> Editar
                                </button>
                                <button type="button" onClick={() => setScriptToDelete(script)} className="btn btn-danger text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} disabled={isReadOnly} aria-label="Eliminar guión">
                                    <Trash2 size={14} aria-hidden="true" /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Guión del Moderador' : 'Nuevo Guión del Moderador'}>
                <form onSubmit={handleSubmit} className="form-layout">
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input bg-slate-50 text-slate-700 cursor-not-allowed" style={{ background: 'var(--neutral-50)', color: 'var(--text-secondary)' }}>{activePlan?.projectName || 'Sin plan seleccionado'}</div>
                    </div>

                    <div>
                        <label htmlFor="introduction" className="form-label">Introducción <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="introduction" value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))} className="form-input" rows={4} placeholder="Escribe el discurso de introducción y consentimiento informado..." required />
                    </div>

                    <div>
                        <label htmlFor="followUpQuestions" className="form-label">Preguntas de Seguimiento <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="followUpQuestions" value={form.followUpQuestions} onChange={e => setForm(f => ({ ...f, followUpQuestions: e.target.value }))} className="form-input" rows={4} placeholder="Preguntas para realizar después de finalizar las tareas..." required />
                    </div>

                    <div>
                        <label htmlFor="closingInstructions" className="form-label">Instrucciones de Cierre <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="closingInstructions" value={form.closingInstructions} onChange={e => setForm(f => ({ ...f, closingInstructions: e.target.value }))} className="form-input" rows={4} placeholder="Instrucciones finales, agradecimiento y cierre de la sesión..." required />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                        <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}>
                            <Save size={16} aria-hidden="true" /> {saving ? 'Guardando...' : editId ? 'Actualizar Guión' : 'Crear Guión'}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation */}
            <Modal isOpen={!!scriptToDelete} onClose={() => setScriptToDelete(null)} title="Eliminar Guión" maxWidth="480px">
                <div style={{ padding: 'var(--space-5)' }}>
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                        ¿Estás seguro de que deseas eliminar el guión del plan <strong>{activePlan?.projectName || ''}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                        <button type="button" onClick={() => setScriptToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => scriptToDelete && confirmDelete(scriptToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}