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
        setForm({ name: p.name, age: p.age.toString(), profile: p.profile || '' })
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
                
                // Programar el disparador automático del Copilot (IHC trigger)
                window.dispatchEvent(new CustomEvent('copilot-trigger', {
                    detail: {
                        action: 'participant-saved',
                        participantName: form.name
                    }
                }))
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
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-header-title">Directorio de Participantes</h2>
                    <p className="page-header-subtitle">Registra y gestiona los participantes de las pruebas</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true) }}
                    aria-label="Nuevo Participante"
                >
                    <Plus size={18} aria-hidden="true" /> Nuevo Participante
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o perfil..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: 384, width: '100%' }}
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
                <form onSubmit={handleSubmit} className="form-layout" style={{ padding: 'var(--space-5)' }}>
                    <div>
                        <label htmlFor="participantName" className="form-label">Nombre <span style={{ color: 'var(--color-error)' }}>*</span></label>
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
                        <label htmlFor="participantAge" className="form-label">Edad <span style={{ color: 'var(--color-error)' }}>*</span></label>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
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
                <div className="dashboard-loader-container">
                    <div className="dashboard-spinner" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state-card">
                    <Users size={40} className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Sin participantes</h3>
                    <p className="empty-state-subtitle">Registra participantes para asignarles sesiones de prueba</p>
                </div>
            ) : (
                <div className="participants-grid">
                    {filtered.map((participant: any) => (
                        <div key={participant.id} className="participant-card">
                            <div className="participant-card-header">
                                <div className="participant-card-name-wrap">
                                    <div className="participant-avatar">
                                        <User size={18} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="participant-card-title">{participant.name}</h3>
                                        <p className="participant-card-subtitle">{participant.age} años</p>
                                    </div>
                                </div>
                            </div>
                            <div className="participant-profile-box">
                                <strong>Perfil:</strong> {participant.profile || 'Sin especificar'}
                            </div>
                            <div className="participant-card-footer">
                                <button
                                    onClick={() => handleEdit(participant)}
                                    className="btn btn-secondary text-sm"
                                    style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-1.5) var(--space-3)' }}
                                    aria-label={`Editar participante ${participant.name}`}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => setParticipantToDelete(participant)}
                                    className="btn btn-danger text-sm"
                                    style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-1.5) var(--space-3)' }}
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
                <div style={{ padding: 'var(--space-5)' }}>
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
                        ¿Estás seguro de que deseas eliminar al participante <strong>{participantToDelete?.name}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
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
