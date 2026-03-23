import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Edit3, Trash2, Calendar, Target, X, Save } from 'lucide-react'

export default function TestPlans() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [planToDelete, setPlanToDelete] = useState<{ id: string, name: string } | null>(null)
    const [planToEdit, setPlanToEdit] = useState<any | null>(null)
    const [savingEdit, setSavingEdit] = useState(false)
    const [editForm, setEditForm] = useState({
        projectName: '',
        product: '',
        evaluatedModule: '',
        objective: '',
        userProfile: '',
        methodology: '',
        startDate: '',
        endDate: '',
        location: '',
        estimatedDuration: '',
        scope: '',
        status: 'Draft',
    })
    const { addToast } = useToast()

    const toInputDate = (value: string | null | undefined) => {
        if (!value) return ''
        return new Date(value).toISOString().split('T')[0]
    }

    const fetchPlans = () => {
        setLoading(true)
        testPlansApi.getAll().then(res => setPlans(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchPlans() }, [])

    const openEditModal = (plan: any) => {
        setPlanToEdit(plan)
        setEditForm({
            projectName: plan.projectName || '',
            product: plan.product || '',
            evaluatedModule: plan.evaluatedModule || '',
            objective: plan.objective || '',
            userProfile: plan.userProfile || '',
            methodology: plan.methodology || '',
            startDate: toInputDate(plan.startDate),
            endDate: toInputDate(plan.endDate),
            location: plan.location || '',
            estimatedDuration: plan.estimatedDuration || '',
            scope: plan.scope || '',
            status: plan.status || 'Draft',
        })
    }

    const closeEditModal = () => {
        setPlanToEdit(null)
        setSavingEdit(false)
    }

    const submitEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!planToEdit) return

        if (!editForm.projectName.trim()) { addToast('El nombre del proyecto es obligatorio', 'error'); return }
        if (!editForm.product.trim()) { addToast('El producto es obligatorio', 'error'); return }
        if (!editForm.evaluatedModule.trim()) { addToast('El módulo evaluado es obligatorio', 'error'); return }
        if (!editForm.objective.trim()) { addToast('El objetivo es obligatorio', 'error'); return }
        if (!editForm.userProfile.trim()) { addToast('El perfil de usuario es obligatorio', 'error'); return }
        if (!editForm.methodology.trim()) { addToast('La metodología es obligatoria', 'error'); return }
        if (!editForm.startDate || !editForm.endDate) { addToast('Las fechas son obligatorias', 'error'); return }
        if (new Date(editForm.endDate) <= new Date(editForm.startDate)) { addToast('La fecha de fin debe ser posterior a la fecha de inicio', 'error'); return }

        setSavingEdit(true)
        try {
            await testPlansApi.update(planToEdit.id, {
                projectName: editForm.projectName,
                product: editForm.product,
                evaluatedModule: editForm.evaluatedModule,
                objective: editForm.objective,
                userProfile: editForm.userProfile,
                methodology: editForm.methodology,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                location: editForm.location,
                estimatedDuration: editForm.estimatedDuration,
                scope: editForm.scope,
                status: editForm.status,
            })

            addToast('Plan actualizado correctamente', 'success')
            closeEditModal()
            fetchPlans()
        } catch {
            addToast('Error al actualizar el plan', 'error')
        } finally {
            setSavingEdit(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testPlansApi.delete(id)
            addToast('Plan eliminado correctamente', 'success')
            fetchPlans()
        } catch { addToast('Error al eliminar el plan', 'error') }
        finally { setPlanToDelete(null) }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Planes de Prueba</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Gestiona los planes de prueba de usabilidad</p>
                </div>
                <Link to="/planes/nuevo" className="btn btn-primary">
                    <Plus size={16} aria-hidden="true" />
                    Nuevo Plan
                </Link>
            </div>

            {plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center animate-rise">
                    <Target size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin planes de prueba</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Crea tu primer plan de prueba para comenzar</p>
                    <Link to="/planes/nuevo" className="btn btn-primary mt-4">
                        <Plus size={16} /> Crear Plan
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {plans.map((plan: any) => (
                        <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise hover:shadow-md transition-shadow">
                            <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">{plan.projectName}</h3>
                                        <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{plan.objective}</p>
                                    </div>
                                    <span className={`badge ${plan.status === 'Completed' ? 'badge-completada' : plan.status === 'InProgress' ? 'badge-enprogreso' : 'badge-pendiente'}`}>
                                        {plan.status === 'Draft' ? 'Borrador' : plan.status === 'InProgress' ? 'En Progreso' : plan.status === 'Completed' ? 'Completado' : plan.status === 'Cancelled' ? 'Cancelado' : plan.status}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                        <Calendar size={10} aria-hidden="true" />
                                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                        {plan.tasks?.length || 0} tareas
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                                        {plan.findings?.length || 0} hallazgos
                                    </span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                                    <button onClick={() => openEditModal(plan)} className="btn btn-secondary text-[12px] py-2 px-3">
                                        <Edit3 size={14} aria-hidden="true" /> Editar
                                    </button>
                                    <button onClick={() => setPlanToDelete({ id: plan.id, name: plan.projectName })} className="btn btn-danger text-[12px] py-2 px-3" aria-label={`Eliminar plan ${plan.projectName}`}>
                                        <Trash2 size={14} aria-hidden="true" /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {planToDelete && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPlanToDelete(null) }} role="dialog" aria-modal="true">
                    <div className="modal-content max-w-md">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">Eliminar Plan</h3>
                            <button onClick={() => setPlanToDelete(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <div className="p-5">
                            <p className="text-[14px] text-slate-600 mb-5">
                                ¿Estás seguro de que deseas eliminar el plan <strong>{planToDelete.name}</strong>? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setPlanToDelete(null)} className="btn btn-secondary">Cancelar</button>
                                <button type="button" onClick={() => confirmDelete(planToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {planToEdit && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeEditModal() }} role="dialog" aria-modal="true" aria-label="Editar plan">
                    <div className="modal-content rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <h3 className="text-[18px] font-semibold text-slate-900">Editar Plan de Prueba</h3>
                            <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>

                        <form onSubmit={submitEdit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="editProjectName" className="form-label">Nombre del Proyecto <span className="text-red-500">*</span></label>
                                <input id="editProjectName" value={editForm.projectName} onChange={e => setEditForm(f => ({ ...f, projectName: e.target.value }))} className="form-input" required />
                            </div>

                            <div>
                                <label htmlFor="editObjective" className="form-label">Objetivo <span className="text-red-500">*</span></label>
                                <textarea id="editObjective" value={editForm.objective} onChange={e => setEditForm(f => ({ ...f, objective: e.target.value }))} className="form-input" rows={3} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editProduct" className="form-label">Producto <span className="text-red-500">*</span></label>
                                    <input id="editProduct" value={editForm.product} onChange={e => setEditForm(f => ({ ...f, product: e.target.value }))} className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="editEvaluatedModule" className="form-label">Módulo evaluado <span className="text-red-500">*</span></label>
                                    <input id="editEvaluatedModule" value={editForm.evaluatedModule} onChange={e => setEditForm(f => ({ ...f, evaluatedModule: e.target.value }))} className="form-input" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editMethodology" className="form-label">Metodología <span className="text-red-500">*</span></label>
                                    <input id="editMethodology" value={editForm.methodology} onChange={e => setEditForm(f => ({ ...f, methodology: e.target.value }))} className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="editStatus" className="form-label">Estado</label>
                                    <select id="editStatus" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="form-input">
                                        <option value="Draft">Borrador</option>
                                        <option value="InProgress">En Progreso</option>
                                        <option value="Completed">Completado</option>
                                        <option value="Cancelled">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editStartDate" className="form-label">Fecha de Inicio <span className="text-red-500">*</span></label>
                                    <input id="editStartDate" type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} className="form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="editEndDate" className="form-label">Fecha de Fin <span className="text-red-500">*</span></label>
                                    <input id="editEndDate" type="date" min={editForm.startDate} value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} className="form-input" required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="editUserProfile" className="form-label">Perfil de Usuario <span className="text-red-500">*</span></label>
                                <textarea id="editUserProfile" value={editForm.userProfile} onChange={e => setEditForm(f => ({ ...f, userProfile: e.target.value }))} className="form-input" rows={2} required />
                            </div>

                            <div>
                                <label htmlFor="editScope" className="form-label">Alcance</label>
                                <textarea id="editScope" value={editForm.scope} onChange={e => setEditForm(f => ({ ...f, scope: e.target.value }))} className="form-input" rows={2} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editLocation" className="form-label">Ubicación</label>
                                    <input id="editLocation" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="form-input" />
                                </div>
                                <div>
                                    <label htmlFor="editEstimatedDuration" className="form-label">Duración estimada</label>
                                    <input id="editEstimatedDuration" value={editForm.estimatedDuration} onChange={e => setEditForm(f => ({ ...f, estimatedDuration: e.target.value }))} className="form-input" />
                                </div>
                            </div>

                            <div className="pt-3 flex items-center gap-3">
                                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={savingEdit}>
                                    <Save size={16} aria-hidden="true" /> {savingEdit ? 'Guardando...' : 'Actualizar Plan'}
                                </button>
                                <button type="button" onClick={closeEditModal} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
