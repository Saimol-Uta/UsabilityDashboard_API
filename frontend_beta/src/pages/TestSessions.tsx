import { useEffect, useState } from 'react'
import { testSessionsApi, participantsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Save, Trash2, CalendarRange, X, MonitorPlay, Calendar } from 'lucide-react'

export default function TestSessions() {
    const [sessions, setSessions] = useState<any[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activePlanId, setActivePlanId] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const { addToast } = useToast()

    const emptyForm = { testPlanId: '', participantId: '', date: new Date().toISOString().split('T')[0], platformTested: '' }
    const [form, setForm] = useState(emptyForm)

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
            const planId = res.data?.[0]?.id ?? ''
            setActivePlanId(planId)
            if (planId) {
                fetchData(planId)
            } else {
                setLoading(false)
            }
        })
    }, [])

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
        if (!form.participantId) { addToast('Debe seleccionar un participante', 'error'); return }

        try {
            const payload = {
                ...form,
                date: new Date(form.date).toISOString() // Asegurar formato para C# DateTime
            }
            if (editId) {
                await testSessionsApi.update(editId, payload)
                addToast('Sesión actualizada', 'success')
            } else {
                await testSessionsApi.create(payload)
                addToast('Sesión programada', 'success')
            }
            resetForm()
            if (activePlanId) fetchData(activePlanId)
        } catch { addToast('Error al programar sesión', 'error') }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta sesión?')) return
        try {
            await testSessionsApi.delete(id)
            addToast('Sesión eliminada', 'success')
            if (activePlanId) fetchData(activePlanId)
        } catch { addToast('Error al eliminar', 'error') }
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
                <button className="btn btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-xl hover:scale-105 hover:shadow-2xl transform transition-all flex items-center gap-2" onClick={() => { setEditId(null); setForm({ ...emptyForm, testPlanId: activePlanId, participantId: participants[0]?.id ?? '' }); setShowForm(true) }}>
                    <Plus size={18} /> Programar Sesión
                </button>
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
                                <label htmlFor="platformTested" className="form-label">Plataforma a evaluar</label>
                                <input id="platformTested" type="text" value={form.platformTested} onChange={e => setForm(f => ({ ...f, platformTested: e.target.value }))} className="form-input" placeholder="Ej: iOS App, Android, Desktop Web..." />
                            </div>
                            <div className="flex items-center gap-3 pt-3">
                                <button type="submit" className="btn btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2" disabled={participants.length === 0}>
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
                                <button onClick={() => handleEdit(session)} className="btn btn-secondary text-[11px] py-1 px-3">Modificar</button>
                                <button onClick={() => handleDelete(session.id)} className="btn btn-danger text-[11px] py-1 px-3">Cancelar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
