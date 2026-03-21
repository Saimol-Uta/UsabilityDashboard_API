import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { testPlansApi } from '../api'
import { useToast } from '../App'
import { Save, ArrowLeft } from 'lucide-react'

export default function TestPlanForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    projectName: '',
    objective: '',
    methodology: '',
    startDate: '',
    endDate: '',
    userProfile: '',
    scope: '',
    status: 'Activo',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      testPlansApi.get(Number(id)).then(res => {
        const p = res.data
        setForm({
          projectName: p.projectName || '',
          objective: p.objective || '',
          methodology: p.methodology || '',
          startDate: p.startDate ? p.startDate.split('T')[0] : '',
          endDate: p.endDate ? p.endDate.split('T')[0] : '',
          userProfile: p.userProfile || '',
          scope: p.scope || '',
          status: p.status || 'Activo',
        })
      })
    }
  }, [id, isEdit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectName.trim()) {
      addToast('El nombre del proyecto es requerido', 'error')
      return
    }
    setSaving(true)
    try {
      const data = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }
      if (isEdit) {
        await testPlansApi.update(Number(id), { id: Number(id), ...data })
        addToast('Plan actualizado correctamente', 'success')
      } else {
        await testPlansApi.create(data)
        addToast('Plan creado correctamente', 'success')
      }
      navigate('/planes')
    } catch {
      addToast('Error al guardar el plan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/planes')} className="btn btn-secondary mb-4 text-[12px]">
        <ArrowLeft size={14} aria-hidden="true" /> Volver a Planes
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-[18px] font-semibold text-slate-900">
            {isEdit ? 'Editar Plan de Prueba' : 'Nuevo Plan de Prueba'}
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">Define los parámetros del plan de evaluación de usabilidad</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="projectName" className="form-label">Nombre del Proyecto *</label>
            <input id="projectName" name="projectName" value={form.projectName} onChange={handleChange}
              className="form-input" placeholder="Ej: Auditoría de Usabilidad: freeCodeCamp vs Coursera" required />
          </div>

          <div>
            <label htmlFor="objective" className="form-label">Objetivo</label>
            <textarea id="objective" name="objective" value={form.objective} onChange={handleChange}
              className="form-input" rows={3} placeholder="Describe el objetivo principal del plan de prueba" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="methodology" className="form-label">Metodología</label>
              <input id="methodology" name="methodology" value={form.methodology} onChange={handleChange}
                className="form-input" placeholder="Ej: Evaluación heurística + WAVE" />
            </div>
            <div>
              <label htmlFor="status" className="form-label">Estado</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="form-input">
                <option value="Activo">Activo</option>
                <option value="Completado">Completado</option>
                <option value="Borrador">Borrador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="form-label">Fecha de Inicio</label>
              <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="endDate" className="form-label">Fecha de Fin</label>
              <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div>
            <label htmlFor="userProfile" className="form-label">Perfil de Usuario</label>
            <textarea id="userProfile" name="userProfile" value={form.userProfile} onChange={handleChange}
              className="form-input" rows={2} placeholder="Describe el perfil de los participantes de la prueba" />
          </div>

          <div>
            <label htmlFor="scope" className="form-label">Alcance</label>
            <textarea id="scope" name="scope" value={form.scope} onChange={handleChange}
              className="form-input" rows={2} placeholder="Define el alcance de las pruebas" />
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} aria-hidden="true" />
              {saving ? 'Guardando...' : isEdit ? 'Actualizar Plan' : 'Crear Plan'}
            </button>
            <button type="button" onClick={() => navigate('/planes')} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
