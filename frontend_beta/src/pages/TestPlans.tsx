import { useEffect, useState } from 'react'
import { testPlansApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Edit3, Trash2, Calendar, Target, Save, CheckCircle2, PlayCircle, Clock, FileText, AlertCircle } from 'lucide-react'

const todayIso = new Date().toISOString().split('T')[0]

const emptyForm = {
    projectName: '',
    product: '',
    evaluatedModule: '',
    objective: '',
    userProfile: '',
    methodology: '',
    startDate: todayIso,
    endDate: todayIso,
    location: '',
    estimatedDuration: '',
    scope: '',
    status: 'Draft',
}

export default function TestPlans() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [planToDelete, setPlanToDelete] = useState<{ id: string, name: string } | null>(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const { addToast } = useToast()
    const { refreshPlans, setActivePlanId } = usePlan()

    const toInputDate = (value: string | null | undefined) => {
        if (!value) return ''
        return new Date(value).toISOString().split('T')[0]
    }

    const fetchPlans = () => {
        setLoading(true)
        testPlansApi.getAll().then(res => setPlans(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchPlans() }, [])

    const openCreate = () => {
        setForm(emptyForm)
        setEditId(null)
        setShowDrawer(true)
    }

    const openEdit = (plan: any) => {
        setEditId(plan.id)
        setForm({
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
        setShowDrawer(true)
    }

    const closeDrawer = () => {
        setShowDrawer(false)
        setEditId(null)
        setSaving(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (saving) return

        if (!form.projectName.trim()) { addToast('El nombre del proyecto es obligatorio', 'error'); return }
        if (!form.product.trim()) { addToast('El producto es obligatorio', 'error'); return }
        if (!form.evaluatedModule.trim()) { addToast('El módulo evaluado es obligatorio', 'error'); return }
        if (!form.objective.trim()) { addToast('El objetivo es obligatorio', 'error'); return }
        if (!form.userProfile.trim()) { addToast('El perfil de usuario es obligatorio', 'error'); return }
        if (!form.methodology.trim()) { addToast('La metodología es obligatoria', 'error'); return }
        if (!form.startDate || !form.endDate) { addToast('Las fechas son obligatorias', 'error'); return }
        if (new Date(form.endDate) <= new Date(form.startDate)) { addToast('La fecha de fin debe ser posterior a la fecha de inicio', 'error'); return }

        setSaving(true)
        try {
            const existingPlansRes = await testPlansApi.getAll()
            const existingPlans = existingPlansRes.data ?? []
            const nameTrimmed = form.projectName.trim().toLowerCase()
            const duplicate = existingPlans.find((p: any) =>
                p.projectName?.trim().toLowerCase() === nameTrimmed && String(p.id) !== String(editId)
            )

            if (duplicate) {
                addToast('Ya existe un plan de prueba con ese nombre', 'error')
                setSaving(false)
                return
            }

            if (editId) {
                await testPlansApi.update(editId, form)
                addToast('Plan actualizado correctamente', 'success')
                closeDrawer()
                fetchPlans()
                refreshPlans()
            } else {
                const { status, ...createData } = form
                const res = await testPlansApi.create(createData)
                addToast('Plan creado correctamente', 'success')
                closeDrawer()
                fetchPlans()
                await refreshPlans()
                if (res.data?.id) {
                    setActivePlanId(res.data.id)
                }
            }
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar el plan'), 'error')
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testPlansApi.delete(id)
            addToast('Plan eliminado correctamente', 'success')
            fetchPlans()
            refreshPlans()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar el plan'), 'error')
        } finally {
            setPlanToDelete(null)
        }
    }

    const togglePlanStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Completed' ? 'InProgress' : 'Completed';
        try {
            await testPlansApi.updateStatus(id, newStatus);
            addToast(`Plan ${newStatus === 'Completed' ? 'marcado como completado' : 'reactivado'} correctamente`, 'success');
            fetchPlans();
            refreshPlans();
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al cambiar el estado del plan'), 'error');
        }
    }

    const getStatusBadge = (status: string) => {
        const iconStyle = { marginRight: '4px', flexShrink: 0 }
        switch (status) {
            case 'Completed':
                return (
                    <span className="badge badge-completada" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <CheckCircle2 size={10} aria-hidden="true" style={iconStyle} />
                        Completado
                    </span>
                )
            case 'InProgress':
                return (
                    <span className="badge badge-enprogreso" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Clock size={10} aria-hidden="true" style={iconStyle} />
                        En Progreso
                    </span>
                )
            case 'Cancelled':
                return (
                    <span className="badge badge-alta" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <AlertCircle size={10} aria-hidden="true" style={iconStyle} />
                        Cancelado
                    </span>
                )
            default: // 'Draft'
                return (
                    <span className="badge badge-pendiente" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <FileText size={10} aria-hidden="true" style={iconStyle} />
                        Borrador
                    </span>
                )
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
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Planes de Prueba</h2>
                    <p className="page-header-subtitle">Gestiona los planes de prueba de usabilidad</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={16} aria-hidden="true" />
                    Nuevo Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="empty-state-card">
                    <Target size={40} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin planes de prueba</h3>
                    <p className="empty-state-subtitle">Crea tu primer plan de prueba para comenzar</p>
                    <button onClick={openCreate} className="btn btn-primary">
                        <Plus size={16} /> Crear Plan
                    </button>
                </div>
            ) : (
                <div className="page-grid-2">
                    {plans.map((plan: any) => (
                        <div key={plan.id} className="testplan-card">
                            <div className="testplan-card-bar" />
                            <div className="testplan-card-body">
                                <div className="testplan-card-header">
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <h3 className="testplan-card-title">{plan.projectName}</h3>
                                        <p className="testplan-card-objective">{plan.objective}</p>
                                    </div>
                                    {getStatusBadge(plan.status)}
                                </div>

                                <div className="testplan-card-meta">
                                    <span className="testplan-card-meta-badge testplan-card-meta-badge--slate">
                                        <Calendar size={10} aria-hidden="true" />
                                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                    <span className="testplan-card-meta-badge testplan-card-meta-badge--blue">
                                        {plan.tasks?.length || 0} tareas
                                    </span>
                                    <span className="testplan-card-meta-badge testplan-card-meta-badge--amber">
                                        {plan.findings?.length || 0} hallazgos
                                    </span>
                                </div>

                                <div className="testplan-card-footer">
                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                        <button onClick={() => openEdit(plan)} className="btn btn-secondary text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} aria-label={`Editar plan ${plan.projectName}`}>
                                            <Edit3 size={14} aria-hidden="true" /> Editar
                                        </button>
                                        <button onClick={() => setPlanToDelete({ id: plan.id, name: plan.projectName })} className="btn btn-danger text-sm" style={{ padding: 'var(--space-1.5) var(--space-3)' }} aria-label={`Eliminar plan ${plan.projectName}`}>
                                            <Trash2 size={14} aria-hidden="true" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => togglePlanStatus(plan.id, plan.status)} 
                                        className={`btn text-sm flex items-center gap-1.5 border transition-colors ${plan.status === 'Completed' ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                                        style={{ padding: 'var(--space-1.5) var(--space-3)' }}
                                    >
                                        {plan.status === 'Completed' ? (
                                            <><PlayCircle size={14} /> Reactivar</>
                                        ) : (
                                            <><CheckCircle2 size={14} /> Finalizar</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation modal */}
            <Modal isOpen={!!planToDelete} onClose={() => setPlanToDelete(null)} title="Eliminar Plan" maxWidth="480px">
                <div style={{ padding: 'var(--space-5)' }}>
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                        ¿Estás seguro de que deseas eliminar el plan <strong>{planToDelete?.name}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                        <button type="button" onClick={() => setPlanToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => planToDelete && confirmDelete(planToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>

            {/* Create/Edit Drawer */}
            <Modal isOpen={showDrawer} onClose={closeDrawer} title={editId ? 'Editar Plan de Prueba' : 'Nuevo Plan de Prueba'} drawer>
                <form onSubmit={handleSubmit} className="form-layout">
                    <div>
                        <label htmlFor="drawerProjectName" className="form-label">Nombre del Proyecto <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <input id="drawerProjectName" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} className="form-input" placeholder="Ej: Auditoría de Usabilidad: freeCodeCamp vs Coursera" required />
                    </div>

                    <div>
                        <label htmlFor="drawerObjective" className="form-label">Objetivo <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="drawerObjective" value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} className="form-input" rows={3} placeholder="Describe el objetivo principal del plan de prueba" required />
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="drawerProduct" className="form-label">Producto <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerProduct" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} className="form-input" placeholder="Ej: Plataforma e-learning" required />
                        </div>
                        <div>
                            <label htmlFor="drawerModule" className="form-label">Módulo evaluado <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerModule" value={form.evaluatedModule} onChange={e => setForm(f => ({ ...f, evaluatedModule: e.target.value }))} className="form-input" placeholder="Ej: Registro y pago" required />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="drawerMethodology" className="form-label">Metodología <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerMethodology" value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))} className="form-input" placeholder="Ej: Evaluación heurística + WAVE" required />
                        </div>
                        {editId && (
                            <div>
                                <label htmlFor="drawerStatus" className="form-label">Estado</label>
                                <select id="drawerStatus" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input">
                                    <option value="Draft">Borrador</option>
                                    <option value="InProgress">En Progreso</option>
                                    <option value="Completed">Completado</option>
                                    <option value="Cancelled">Cancelado</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="drawerStartDate" className="form-label">Fecha de Inicio <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerStartDate" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="form-input" required />
                        </div>
                        <div>
                            <label htmlFor="drawerEndDate" className="form-label">Fecha de Fin <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerEndDate" type="date" min={form.startDate} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="form-input" required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="drawerUserProfile" className="form-label">Perfil de Usuario <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea id="drawerUserProfile" value={form.userProfile} onChange={e => setForm(f => ({ ...f, userProfile: e.target.value }))} className="form-input" rows={2} placeholder="Describe el perfil de los participantes" required />
                    </div>

                    <div>
                        <label htmlFor="drawerScope" className="form-label">Alcance</label>
                        <textarea id="drawerScope" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} className="form-input" rows={2} placeholder="Define el alcance de las pruebas" />
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label htmlFor="drawerLocation" className="form-label">Ubicación</label>
                            <input id="drawerLocation" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="form-input" placeholder="Ej: Laboratorio 2 / Remoto" />
                        </div>
                        <div>
                            <label htmlFor="drawerDuration" className="form-label">Duración estimada (minutos) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input id="drawerDuration" type="number" min="1" value={form.estimatedDuration} onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))} className="form-input" placeholder="Ej: 45" required />
                        </div>
                    </div>

                    <div className="form-footer-sticky">
                        <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}>
                            <Save size={16} aria-hidden="true" /> {saving ? 'Guardando...' : editId ? 'Actualizar Plan' : 'Crear Plan'}
                        </button>
                        <button type="button" onClick={closeDrawer} className="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
