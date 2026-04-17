import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testSessionsApi, participantsApi, testTasksApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { Plus, Save, CalendarRange, MonitorPlay, Calendar, Play, AlertTriangle } from 'lucide-react'

export default function TestSessions() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState<any[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [tasksCount, setTasksCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [sessionToDelete, setSessionToDelete] = useState<any | null>(null)
    const { addToast } = useToast()
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()

    const emptyForm = { testPlanId: '', participantId: '', date: new Date().toISOString().split('T')[0], platformTested: '' }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async (planId: string) => {
        if (!planId) { setSessions([]); setParticipants([]); setLoading(false); return }
        setLoading(true)
        try {
            const [sessionsRes, participantsRes, tasksRes] = await Promise.all([
                testSessionsApi.getAll(planId),
                participantsApi.getAll(),
                testTasksApi.getByPlan(planId)
            ])
            setSessions(sessionsRes.data ?? [])
            setParticipants(participantsRes.data ?? [])
            setTasksCount((tasksRes.data ?? []).length)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(activePlanId)
    }, [activePlanId])

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
                    testPlanId: activePlanId,
                    participantId: form.participantId,
                    date: new Date(form.date).toISOString(),
                    platformTested: form.platformTested,
                })
                addToast('Sesión programada', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al programar sesión'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await testSessionsApi.delete(id)
            addToast('Sesión eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar'), 'error')
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
                <button
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' }); setShowForm(true) }}
                    disabled={!activePlanId || isReadOnly}
                    aria-label="Programar Sesión"
                >
                    <Plus size={18} aria-hidden="true" /> Programar Sesión
                </button>
            </div>

            {/* GLB-04: Read-only banner */}
            {isReadOnly && activePlan && (
                <div className="readonly-banner">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>El plan "<strong>{activePlan.projectName}</strong>" está {activePlan.status === 'Completed' ? 'completado' : 'cancelado'}. No se pueden crear ni modificar sesiones.</span>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-4">
                <div className="min-w-0">
                    <label className="form-label">Plan de prueba activo</label>
                    <div className="text-[14px] font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        {activePlan ? activePlan.projectName : 'Seleccione en el menú principal'}
                    </div>
                </div>
                <p className="text-[13px] text-slate-500 md:mb-2">Las sesiones nuevas se asignarán a este plan.</p>
            </div>

            {!loading && activePlan && tasksCount === 0 && sessions.length > 0 && (
                <div className="flex items-start sm:items-center justify-between gap-3 bg-amber-50 rounded-xl p-3 border border-amber-200 mt-2">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="text-[13px] text-amber-800">
                            <strong>Atención:</strong> No hay <strong>tareas</strong> registradas en este plan. Debes crear tareas antes de poder iniciar la ejecución de una sesión.
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <Modal isOpen={showForm} onClose={resetForm} title={editId ? 'Editar Sesión' : 'Programar Sesión'} maxWidth="480px">
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="form-label">Plan asignado</label>
                        <div className="form-input bg-slate-50 text-slate-700 cursor-not-allowed">{activePlan?.projectName || 'Sin plan seleccionado'}</div>
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
            </Modal>

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
                                    <Calendar size={13} aria-hidden="true" />
                                    <span>{new Date(session.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-[12px] mt-1">
                                    <MonitorPlay size={13} aria-hidden="true" />
                                    <span>Plataforma: {session.platformTested || 'No definida'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-auto pt-3">
                                <button onClick={() => navigate(`/sesiones/${session.id}/ejecutar`)} disabled={tasksCount === 0} title={tasksCount === 0 ? "Requiere crear tareas primero" : ""} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                                    <Play size={12} /> Iniciar Sesión
                                </button>
                                <button onClick={() => handleEdit(session)} className="btn btn-secondary text-[11px] py-1 px-3" disabled={isReadOnly} aria-label={`Modificar sesión de ${getParticipantName(session.participantId)}`}>Modificar</button>
                                <button onClick={() => setSessionToDelete(session)} className="btn btn-danger text-[11px] py-1 px-3" disabled={isReadOnly} aria-label={`Eliminar sesión de ${getParticipantName(session.participantId)}`}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            <Modal isOpen={!!sessionToDelete} onClose={() => setSessionToDelete(null)} title="Eliminar Sesión" maxWidth="480px">
                <div className="p-5 space-y-4">
                    <p className="text-[14px] text-slate-600">
                        ¿Estás seguro de que deseas eliminar la sesión del participante <strong>{sessionToDelete && getParticipantName(sessionToDelete.participantId)}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setSessionToDelete(null)} className="btn btn-secondary">Cancelar</button>
                        <button type="button" onClick={() => sessionToDelete && confirmDelete(sessionToDelete.id)} className="btn btn-danger px-4">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
