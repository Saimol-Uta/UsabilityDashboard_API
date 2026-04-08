import { useEffect, useState } from 'react'
import { participantsApi } from '../api'
import { useToast } from '../App'
import { extractErrorMessage } from '../hooks/useApiError'
import Modal from '../components/Modal'
import { usePlan } from '../context/PlanContext'
import { Plus, Save, Users, User } from 'lucide-react'

export default function Participants() {
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [participantToDelete, setParticipantToDelete] = useState<any | null>(null)
    const { addToast } = useToast()
    const { refreshGates } = usePlan()

    const emptyForm = { name: '', age: '', profile: '' }
    const [form, setForm] = useState(emptyForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchParticipants = () => {
        setLoading(true)
        participantsApi.getAll().then(res => setParticipants(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchParticipants()
    }, [])

    const resetForm = () => {
        setForm(emptyForm)
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (p: any) => {
        setForm({ name: p.name, age: p.age, profile: p.profile })
        setEditId(p.id)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return
        if (!form.name.trim()) { addToast('El nombre es requerido', 'error'); return }
        const ageNum = parseInt(form.age)
        if (isNaN(ageNum) || ageNum <= 0) { addToast('La edad debe ser mayor a 0', 'error'); return }

        setIsSubmitting(true)
        try {
            if (editId) {
                await participantsApi.update(editId, { ...form, age: ageNum })
                addToast('Participante actualizado', 'success')
            } else {
                await participantsApi.create({ ...form, age: ageNum })
                addToast('Participante registrado', 'success')
            }
            resetForm()
            fetchParticipants()
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar participante'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async (id: string) => {
        try {
            await participantsApi.delete(id)
            addToast('Participante eliminado', 'success')
            fetchParticipants()
            refreshGates()
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al eliminar participante'), 'error')
        } finally {
            setParticipantToDelete(null)
        }
    }

    const filtered = participants.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.profile.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[22px] font-bold text-slate-900">Directorio de Participantes</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Registra y gestiona los participantes de las pruebas</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true) }}
                    aria-label="Nuevo Participante"
                >
                    <Plus size={18} aria-hidden="true" /> Nuevo Participante
                </button>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Buscar por nombre o perfil..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="form-input max-w-sm"
                    aria-label="Buscar participantes"
                />
            </div>

            {/* Form Modal — uses Modal component with built-in focus trap */}
            <Modal
                isOpen={showForm}
                onClose={resetForm}
                title={editId ? 'Editar Participante' : 'Nuevo Participante'}
                maxWidth="480px"
            >
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label htmlFor="participantName" className="form-label">Nombre <span className="text-red-500">*</span></label>
                        <input
                            id="participantName"
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="form-input"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="participantAge" className="form-label">Edad <span className="text-red-500">*</span></label>
                        <input
                            id="participantAge"
                            type="number"
                            value={form.age}
                            onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                            className="form-input"
                            placeholder="Ej: 25"
                            min="1"
                            max="99"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="participantProfile" className="form-label">Perfil demográfico</label>
                        <textarea
                            id="participantProfile"
                            value={form.profile}
                            onChange={e => setForm(f => ({ ...f, profile: e.target.value }))}
                            className="form-input"
                            rows={3}
                            placeholder="Ej: Estudiante de ingeniería, usuario frecuente de apps móviles..."
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Save size={16} aria-hidden="true" /> {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
                        </button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                    <Users size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin participantes</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Registra participantes para asignarles sesiones de prueba</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((participant: any) => (
                        <div key={participant.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 animate-rise hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        <User size={18} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-slate-900">{participant.name}</h3>
                                        <p className="text-[12px] text-slate-500">{participant.age} años</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[13px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1">
                                <strong>Perfil:</strong> {participant.profile || 'Sin especificar'}
                            </div>
                            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => handleEdit(participant)}
                                    className="btn btn-secondary text-[11px] py-1.5 px-3 flex-1 justify-center"
                                    aria-label={`Editar participante ${participant.name}`}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => setParticipantToDelete(participant)}
                                    className="btn btn-danger text-[11px] py-1.5 px-3 flex-1 justify-center"
                                    aria-label={`Eliminar participante ${participant.name}`}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation Modal — focus trap included */}
            <Modal
                isOpen={!!participantToDelete}
                onClose={() => setParticipantToDelete(null)}
                title="Eliminar Participante"
                maxWidth="480px"
            >
                <div className="p-5 space-y-4">
                    <p className="text-[14px] text-slate-600">
                        ¿Estás seguro de que deseas eliminar al participante <strong>{participantToDelete?.name}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setParticipantToDelete(null)} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="button" onClick={() => participantToDelete && confirmDelete(participantToDelete.id)} className="btn btn-danger px-4">
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
