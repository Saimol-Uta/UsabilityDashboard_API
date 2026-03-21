import { useEffect, useState } from 'react'
import { moderatorScriptsApi } from '../api'
import { useToast } from '../App'
import { Save, MessageSquareText } from 'lucide-react'

export default function ModeratorScript() {
  const [script, setScript] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ introduction: '', followUpQuestions: '', closingInstructions: '' })
  const { addToast } = useToast()

  useEffect(() => {
    moderatorScriptsApi.getAll(1).then(res => {
      const scripts = res.data
      if (scripts.length > 0) {
        const s = scripts[0]
        setScript(s)
        setForm({ introduction: s.introduction, followUpQuestions: s.followUpQuestions, closingInstructions: s.closingInstructions })
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (script) {
        await moderatorScriptsApi.update(script.id, { id: script.id, testPlanId: 1, ...form })
        addToast('Guión actualizado correctamente', 'success')
      } else {
        const res = await moderatorScriptsApi.create({ testPlanId: 1, ...form })
        setScript(res.data)
        addToast('Guión creado correctamente', 'success')
      }
    } catch { addToast('Error al guardar el guión', 'error') }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-[20px] font-semibold text-slate-900">Guión del Moderador</h2>
        <p className="text-[13px] text-slate-500 mt-1">Define las instrucciones para guiar la sesión de prueba de usabilidad</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Introduction */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <MessageSquareText size={14} className="text-blue-500" aria-hidden="true" />
            <h3 className="text-[14px] font-semibold text-gray-800">Introducción</h3>
          </div>
          <div className="p-5">
            <label htmlFor="introduction" className="form-label">Texto de bienvenida para el participante</label>
            <textarea id="introduction" value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))}
              className="form-input" rows={5} placeholder="Ej: Bienvenido/a a esta sesión de prueba de usabilidad. Vamos a evaluar..." />
          </div>
        </div>

        {/* Follow-up Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise delay-1">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <MessageSquareText size={14} className="text-amber-500" aria-hidden="true" />
            <h3 className="text-[14px] font-semibold text-gray-800">Preguntas de Seguimiento</h3>
          </div>
          <div className="p-5">
            <label htmlFor="followUpQuestions" className="form-label">Preguntas durante la prueba (una por línea)</label>
            <textarea id="followUpQuestions" value={form.followUpQuestions} onChange={e => setForm(f => ({ ...f, followUpQuestions: e.target.value }))}
              className="form-input" rows={5} placeholder="- ¿Qué esperabas que sucediera?&#10;- ¿Fue fácil o difícil?" />
          </div>
        </div>

        {/* Closing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise delay-2">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <MessageSquareText size={14} className="text-emerald-500" aria-hidden="true" />
            <h3 className="text-[14px] font-semibold text-gray-800">Instrucciones de Cierre</h3>
          </div>
          <div className="p-5">
            <label htmlFor="closingInstructions" className="form-label">Cierre de la sesión</label>
            <textarea id="closingInstructions" value={form.closingInstructions} onChange={e => setForm(f => ({ ...f, closingInstructions: e.target.value }))}
              className="form-input" rows={3} placeholder="Ej: Gracias por participar en esta sesión..." />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} aria-hidden="true" />
            {saving ? 'Guardando...' : script ? 'Actualizar Guión' : 'Crear Guión'}
          </button>
        </div>
      </form>
    </div>
  )
}
