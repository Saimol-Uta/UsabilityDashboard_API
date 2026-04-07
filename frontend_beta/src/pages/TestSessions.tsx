import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testSessionsApi, participantsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, CalendarRange, X, MonitorPlay, Calendar, Play } from 'lucide-react'

export default function TestSessions() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState<any[]>([])
    const [plans, setPlans] = useState<any[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [sessionToDelete, setSessionToDelete] = useState<any | null>(null)
    const { addToast } = useToast()

    const emptyForm = { testPlanId: '', participantId: '', date: new Date().toISOString().split('T')[0], platformTested: '' }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async (planId: string) => {
        setLoading(true)
        try {
            const [sessionsRes, participantsRes] = await Promise.all([
                testSessionsApi.getAll(planId),
                participantsApi.getAll()
            ])
            setSessions(sessionsRes.data ?? [])
            setParticipants(participantsRes.data ?? [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        testPlansApi.getAll().then(res => {
            const allPlans = res.data ?? []
            setPlans(allPlans)
            const planId = allPlans[0]?.id ?? ''
            setActivePlanId(planId)
            if (planId) {
                fetchData(planId)
            } else {
                setSessions([])
                setLoading(false)
            }
        })
    }, [])

    const handlePlanChange = (planId: string) => {
        setActivePlanId(planId)
        setForm(f => ({ ...f, testPlanId: planId }))
        if (planId) {
            fetchData(planId)
        } else {
            setSessions([])
        }
    }

    const getPlanName = (planId: string) => {
        return plans.find((p: any) => p.id === planId)?.projectName || 'Sin plan seleccionado'
    }

    const resetForm = () => {
        setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (s: any) => {
        setForm({ testPlanId: s.testPlanId, participantId: s.participantId, date: s.date.split('T')[0], platformTested: s.platformTested })
        setEditId(s.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.participantId) { addToast('Debe seleccionar un participante', 'error'); return }
        if (!form.platformTested.trim()) { addToast('La plataforma evaluada es obligatoria', 'error'); return }

        setIsSubmitting(true)
        try {
            if (editId) {
                await testSessionsApi.update(editId, {
                    participantId: form.participantId,
                    date: new Date(form.date).toISOString(),
                    platformTested: form.platformTested,
                })
                addToast('Sesión actualizada', 'success')
            } else {
                await testSessionsApi.create({
                    testPlanId: form.testPlanId,
                    participantId: form.participantId,
                    date: new Date(form.date).toISOString(),
                    platformTested: form.platformTested,
                })
                addToast('Sesión programada', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
        } catch { addToast('Error al programar sesión', 'error') }
        finally { setIsSubmitting(false) }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testSessionsApi.delete(id)
            addToast('Sesión eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch {
            addToast('Error al eliminar', 'error')
        } finally {
            setSessionToDelete(null)
        }
    }

    const getParticipantName = (id: string) => {
        return participants.find(p => p.id === id)?.name || 'Desconocido'
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[22px] font-bold text-slate-900">Sesiones de Prueba</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Organiza y agenda el trabajo de campo con los usuarios</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' }); setShowForm(true) }}>
                    <Plus size={18} /> Programar Sesión
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-4">
                <div className="min-w-0 md:w-[420px]">
                    <label htmlFor="sessionPlanSelector" className="form-label">Plan de prueba activo</label>
                    <select id="sessionPlanSelector" value={activePlanId} onChange={e => handlePlanChange(e.target.value)} className="form-input">
                        <option value="">Selecciona un plan</option>
                        {plans.map((plan: any) => (
                            <option key={plan.id} value={plan.id}>{plan.projectName}</option>
                        ))}
                    </select>
                </div>
                <p className="text-[13px] text-slate-500 md:mb-2">Las sesiones nuevas se asignarán a este plan.</p>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }} role="dialog" aria-modal="true" aria-label="Formulario de sesión">
                    <div className="modal-content rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-md">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">{editId ? 'Editar Sesión' : 'Programar Sesión'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="form-label">Plan asignado</label>
                                <div className="form-input bg-slate-50 text-slate-700">{getPlanName(form.testPlanId)}</div>
                            </div>
                            <div>
                                <label htmlFor="participantId" className="form-label">Participante <span className="text-red-500">*</span></label>
                                {participants.length === 0 ? (
                                    <div className="text-red-500 text-xs mt-1">No hay participantes registrados. Registra uno antes de programar sesiones.</div>
                                ) : (
                                    <select id="participantId" value={form.participantId} onChange={e => setForm(f => ({ ...f, participantId: e.target.value }))} className="form-input" required>
                                        <option value="" disabled>Selecciona un participante</option>
                                        {participants.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.profile})</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label htmlFor="date" className="form-label">Fecha de la sesión <span className="text-red-500">*</span></label>
                                <input id="date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input" required />
                            </div>
                            <div>
                                <label htmlFor="platformTested" className="form-label">Plataforma a evaluar <span className="text-red-500">*</span></label>
                                <input id="platformTested" type="text" value={form.platformTested} onChange={e => setForm(f => ({ ...f, platformTested: e.target.value }))} className="form-input" placeholder="Ej: iOS App, Android, Desktop Web..." required />
                            </div>
                            <div className="flex items-center gap-3 pt-3">
                                <button type="submit" className="btn btn-primary" disabled={participants.length === 0 || isSubmitting}>
                                    <Save size={16} /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary text-center" disabled={isSubmitting}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
            ) : sessions.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                    <CalendarRange size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin sesiones programadas</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Agenda tu primera sesión en el campo</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session: any) => (
                        <div key={session.id} className="bg-white rounded-2xl border-l-[4px] border border-blue-500 shadow-sm p-4 flex flex-col gap-3 animate-rise hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-[15px] font-bold text-slate-900">{getParticipantName(session.participantId)}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-[12px] mt-1.5">
                                    <Calendar size={13} />
                                    <span>{new Date(session.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-[12px] mt-1">
                                    <MonitorPlay size={13} />
                                    <span>Plataforma: {session.platformTested || 'No definida'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-auto pt-3">
                                <button onClick={() => navigate(`/sesiones/${session.id}/ejecutar`)} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                                    <Play size={12} /> Iniciar Sesión
                                </button>
                                <button onClick={() => handleEdit(session)} className="btn btn-secondary text-[11px] py-1 px-3">Modificar</button>
                                <button onClick={() => setSessionToDelete(session)} className="btn btn-danger text-[11px] py-1 px-3">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {sessionToDelete && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSessionToDelete(null) }} role="dialog" aria-modal="true" aria-label="Confirmar eliminación de sesión">
                    <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-rise bg-white">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-slate-900">Eliminar Sesión</h3>
                            <button onClick={() => setSessionToDelete(null)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-[14px] text-slate-600">
                                ¿Estás seguro de que deseas eliminar la sesión del participante <strong>{getParticipantName(sessionToDelete.participantId)}</strong>? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setSessionToDelete(null)} className="btn btn-secondary">Cancelar</button>
                                <button type="button" onClick={() => confirmDelete(sessionToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
