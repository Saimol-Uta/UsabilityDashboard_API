import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { testPlansApi } from '../api'
import { useToast } from '../App'
import { Plus, Edit3, Trash2, Calendar, Target } from 'lucide-react'

export default function TestPlans() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()

    const fetchPlans = () => {
        setLoading(true)
        testPlansApi.getAll().then(res => setPlans(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchPlans() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este plan de prueba?')) return
        try {
            await testPlansApi.delete(id)
            addToast('Plan eliminado correctamente', 'success')
            fetchPlans()
        } catch { addToast('Error al eliminar el plan', 'error') }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-[20px] font-semibold text-slate-900">Planes de Prueba</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Gestiona los planes de prueba de usabilidad</p>
                </div>
                <Link to="/planes/nuevo" className="btn btn-primary">
                    <Plus size={16} aria-hidden="true" />
                    Nuevo Plan
                </Link>
            </div>

            {plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center animate-rise">
                    <Target size={40} className="text-slate-300 mx-auto" />
                    <h3 className="mt-3 text-[15px] font-semibold text-slate-600">Sin planes de prueba</h3>
                    <p className="text-[13px] text-slate-400 mt-1">Crea tu primer plan de prueba para comenzar</p>
                    <Link to="/planes/nuevo" className="btn btn-primary mt-4">
                        <Plus size={16} /> Crear Plan
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {plans.map((plan: any) => (
                        <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise hover:shadow-md transition-shadow">
                            <div className="h-1.5 w-full bg-gradient-to-r from-slate-800 to-blue-600" />
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">{plan.projectName}</h3>
                                        <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{plan.objective}</p>
                                    </div>
                                    <span className={`badge ${plan.status === 'Completed' ? 'badge-completada' : plan.status === 'InProgress' ? 'badge-enprogreso' : 'badge-pendiente'}`}>
                                        {plan.status === 'Draft' ? 'Borrador' : plan.status === 'InProgress' ? 'En Progreso' : plan.status === 'Completed' ? 'Completado' : plan.status === 'Cancelled' ? 'Cancelado' : plan.status}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                        <Calendar size={10} aria-hidden="true" />
                                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                        {plan.tasks?.length || 0} tareas
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                                        {plan.findings?.length || 0} hallazgos
                                    </span>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                                    <Link to={`/planes/${plan.id}/editar`} className="btn btn-secondary text-[12px] py-2 px-3">
                                        <Edit3 size={14} aria-hidden="true" /> Editar
                                    </Link>
                                    <button onClick={() => handleDelete(plan.id)} className="btn btn-danger text-[12px] py-2 px-3" aria-label={`Eliminar plan ${plan.projectName}`}>
                                        <Trash2 size={14} aria-hidden="true" /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
