import { useEffect, useState } from 'react'
import { moderatorScriptsApi, testPlansApi } from '../api'
import { useToast } from '../App'
import { Save, MessageSquareText } from 'lucide-react'

export default function ModeratorScript() {
    const [script, setScript] = useState<any>(null)
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activePlanId, setActivePlanId] = useState('')
    const [form, setForm] = useState({ introduction: '', followUpQuestions: '', closingInstructions: '' })
    const { addToast } = useToast()

    const emptyForm = { introduction: '', followUpQuestions: '', closingInstructions: '' }

    const loadScriptByPlan = async (planId: string) => {
        if (!planId) {
            setScript(null)
            setForm(emptyForm)
            return
        }

        try {
            const res = await moderatorScriptsApi.getByPlan(planId)
            const s = res.data
            if (s) {
                setScript(s)
                setForm({ introduction: s.introduction, followUpQuestions: s.followUpQuestions, closingInstructions: s.closingInstructions })
            } else {
                setScript(null)
                setForm(emptyForm)
            }
        } catch {
            // Si no existe guion para el plan, preparar formulario limpio.
            setScript(null)
            setForm(emptyForm)
        }
    }

    useEffect(() => {
        testPlansApi.getAll()
            .then(async (plansRes) => {
                const allPlans = plansRes.data ?? []
                setPlans(allPlans)
                const planId = allPlans[0]?.id ?? ''
                setActivePlanId(planId)
                await loadScriptByPlan(planId)
            })
            .finally(() => { setLoading(false) })
    }, [])

    const handlePlanChange = async (planId: string) => {
        setActivePlanId(planId)
        setLoading(true)
        await loadScriptByPlan(planId)
        setLoading(false)
    }

    const getPlanName = (planId: string) => {
        return plans.find((p: any) => p.id === planId)?.projectName || 'Sin plan seleccionado'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activePlanId) {
            addToast('Selecciona un plan de prueba', 'error')
            return
        }
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
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-[24px] font-extrabold text-slate-900">Guión del Moderador</h2>
                <p className="text-[13px] text-slate-500 mt-1">Define las instrucciones para guiar la sesión de prueba de usabilidad</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                <div className="p-5 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="min-w-0 md:w-[460px]">
                        <label htmlFor="moderatorPlanSelector" className="form-label">Plan de prueba activo</label>
                        <select id="moderatorPlanSelector" value={activePlanId} onChange={e => handlePlanChange(e.target.value)} className="form-input">
                            <option value="">Selecciona un plan</option>
                            {plans.map((plan: any) => (
                                <option key={plan.id} value={plan.id}>{plan.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-[13px] text-slate-500 md:mb-2">Este guion quedará asociado al plan seleccionado.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                        <label className="form-label mb-0">Plan asignado</label>
                    </div>
                    <div className="p-5">
                        <div className="form-input bg-slate-50 text-slate-700">{getPlanName(activePlanId)}</div>
                    </div>
                </div>

                {['Introducción', 'Preguntas de Seguimiento', 'Instrucciones de Cierre'].map((section, i) => {
                    const key = section.replace(/\s/g, '')
                    const colors = ['from-blue-100 to-white', 'from-amber-100 to-white', 'from-emerald-100 to-white']
                    const iconColor = i === 0 ? 'text-blue-600' : i === 1 ? 'text-amber-600' : 'text-emerald-600'
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
                        <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise">
                            <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                            <div className={`px-5 py-3 border-b border-slate-200 bg-gradient-to-r ${colors[i]} flex items-center gap-3`}>
                                <MessageSquareText size={18} className={iconColor} aria-hidden="true" />
                                <h3 className="text-[16px] font-semibold text-slate-900">{section}</h3>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={value}
                                    onChange={onChange}
                                    className="form-input resize-none"
                                    rows={i === 2 ? 3 : 5}
                                    placeholder={placeholder}
                                />
                            </div>
                        </div>
                    )
                })}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                    <button type="submit" className="btn btn-primary flex items-center gap-2 px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving || !activePlanId}>
                        <Save size={18} /> {saving ? 'Guardando...' : script ? 'Actualizar Guión' : 'Crear Guión'}
                    </button>
                </div>
            </form>
        </div>
    )
}