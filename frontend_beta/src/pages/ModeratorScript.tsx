import { useEffect, useState } from 'react'
import { moderatorScriptsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Save, MessageSquareText } from 'lucide-react'

export default function ModeratorScript() {
    const [script, setScript] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activePlanId, setActivePlanId] = useState('')
    const [form, setForm] = useState({ introduction: '', followUpQuestions: '', closingInstructions: '' })
    const { addToast } = useToast()

    useEffect(() => {
        testPlansApi.getAll().then(async (plansRes) => {
            const planId = plansRes.data?.[0]?.id ?? ''
            setActivePlanId(planId)
            if (!planId) return
            try {
                const res = await moderatorScriptsApi.getByPlan(planId)
                const s = res.data
                if (s) {
                    setScript(s)
                    setForm({ introduction: s.introduction, followUpQuestions: s.followUpQuestions, closingInstructions: s.closingInstructions })
                }
            } catch {} 
            finally { setLoading(false) }
        }).finally(() => { setLoading(false) })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (script) {
                await moderatorScriptsApi.update(script.id, { ...form })
                addToast('Guión actualizado correctamente', 'success')
            } else {
                const res = await moderatorScriptsApi.create({ testPlanId: activePlanId, ...form })
                setScript(res.data)
                addToast('Guión creado correctamente', 'success')
            }
        } catch { addToast('Error al guardar el guión', 'error') }
        finally { setSaving(false) }
    }

    if (loading) {
        return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <div>
                <h2 className="text-[24px] font-extrabold text-slate-900">Guión del Moderador</h2>
                <p className="text-[13px] text-slate-500 mt-1">Define las instrucciones para guiar la sesión de prueba de usabilidad</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {['Introducción', 'Preguntas de Seguimiento', 'Instrucciones de Cierre'].map((section, i) => {
                    const key = section.replace(/\s/g, '')
                    const colors = ['from-blue-200 to-white', 'from-amber-200 to-white', 'from-emerald-200 to-white']
                    const iconColor = i === 0 ? 'text-blue-600 drop-shadow-lg' : i === 1 ? 'text-amber-600 drop-shadow-lg' : 'text-emerald-600 drop-shadow-lg'
                    const placeholder = i === 0
                        ? "Ej: Bienvenido/a a esta sesión de prueba de usabilidad. Vamos a evaluar..."
                        : i === 1
                            ? "- ¿Qué esperabas que sucediera?\n- ¿Fue fácil o difícil?"
                            : "Ej: Gracias por participar en esta sesión..."
                    const value = i === 0 ? form.introduction : i === 1 ? form.followUpQuestions : form.closingInstructions
                    const onChange = (e: any) => {
                        const val = e.target.value
                        if (i === 0) setForm(f => ({ ...f, introduction: val }))
                        else if (i === 1) setForm(f => ({ ...f, followUpQuestions: val }))
                        else setForm(f => ({ ...f, closingInstructions: val }))
                    }

                    return (
                        <div key={key} className={`bg-white rounded-2xl border-2 border-slate-300 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden animate-rise duration-700`}>
                            <div className={`px-5 py-3 border-b border-slate-200 bg-gradient-to-r ${colors[i]} flex items-center gap-3`}>
                                <MessageSquareText size={20} className={iconColor} aria-hidden="true" />
                                <h3 className="text-[16px] font-bold text-gray-900">{section}</h3>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={value}
                                    onChange={onChange}
                                    className="form-input resize-none border-2 border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 rounded-xl p-4 w-full text-sm font-medium transition-all duration-300 hover:shadow-inner"
                                    rows={i === 2 ? 3 : 5}
                                    placeholder={placeholder}
                                />
                            </div>
                        </div>
                    )
                })}

                <div className="flex items-center gap-4">
                    <button type="submit" className="btn btn-primary flex items-center gap-2 px-6 py-3 text-base" disabled={saving}>
                        <Save size={18} /> {saving ? 'Guardando...' : script ? 'Actualizar Guión' : 'Crear Guión'}
                    </button>
                </div>
            </form>
        </div>
    )
}