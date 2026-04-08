import { useEffect, useState } from 'react'
import { dashboardApi, findingsApi } from '../api'
import { usePlan } from '../context/PlanContext'
import PlanSelector from '../components/PlanSelector'
import { BarChart2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Lightbulb, TrendingUp, Flame, PieChart as PieChartIcon, Filter } from 'lucide-react'
import { PieChart } from '../components/PieChart'

interface Stats {
    totalObservations: number
    successRate: number
    averageTimeSeconds: number
    totalErrors: number
    totalFindings: number
    criticalFindings: number
    moderateFindings: number
    totalActions: number
    completedActions: number
    pendingActions: number
    inProgressActions: number
    closedActions?: number
    errorsBySeverity: { severity: string; count: number }[]
    successByTask: { taskId: string; total: number; successes: number; avgTime: number }[]
}

interface KPICardProps {
    icon: React.ReactNode
    value: string | number
    label: string
    iconBg: string
    valueColor?: string
    delay?: string
}

function KPICard({ icon, value, label, iconBg, valueColor = 'text-gray-900', delay = '' }: KPICardProps) {
    return (
        <div className={`kpi-card p-4 sm:p-6 flex items-center gap-3 sm:gap-4 min-w-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 animate-rise ${delay} hover:scale-105`}>
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${iconBg} border border-white/50`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className={`text-2xl sm:text-3xl font-bold leading-none ${valueColor}`}>{value}</div>
                <div className="text-[12px] text-slate-500 mt-1.5 leading-tight font-medium">{label}</div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { plans, activePlanId, setActivePlanId } = usePlan()

    // dashboardFilter is LOCAL to this page only.
    // '' = "Todas las evaluaciones (Global)" — does NOT affect other pages.
    // Initialized from the global activePlanId so it starts showing the selected plan.
    const [dashboardFilter, setDashboardFilter] = useState<string>(activePlanId)

    const [stats, setStats] = useState<Stats | null>(null)
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Keep dashboardFilter in sync when activePlanId changes from ANOTHER page,
    // but only if the dashboard is NOT showing Global (dashboardFilter !== '')
    useEffect(() => {
        if (dashboardFilter !== '') {
            setDashboardFilter(activePlanId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePlanId])

    /**
     * Called when the user picks an option in the Dashboard filter selector.
     * - Specific plan → update both the local filter AND the global context
     *   so all other pages follow the new selection.
     * - Global ('') → only update the local filter; the global context keeps
     *   the last specific plan so other pages are unaffected.
     */
    const handleDashboardFilterChange = (id: string) => {
        setDashboardFilter(id)
        if (id !== '') {
            setActivePlanId(id) // propagate to global context
        }
        // if id === '' → Global selected → don't touch global context
    }

    const fetchDashboardData = async (planId: string) => {
        // Clear stale data immediately so previous plan's KPIs never show
        setStats(null)
        setFindings([])
        setLoading(true)
        try {
            const statsRes = await dashboardApi.getStats(planId || undefined)

            let allFindings: any[] = []
            if (planId) {
                const findingsRes = await findingsApi.getByPlan(planId)
                allFindings = findingsRes.data ?? []
            } else {
                const findingsPromises = plans.map(p => findingsApi.getByPlan(p.id))
                const responses = await Promise.all(findingsPromises)
                allFindings = responses.flatMap(r => r.data ?? [])
            }

            setStats(statsRes.data)
            setFindings(allFindings)
        } catch {
            setStats(null)
            setFindings([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (plans.length > 0 || dashboardFilter === '') {
            fetchDashboardData(dashboardFilter)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardFilter, plans])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-500 mt-3">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    if (!stats) return null

    // DASH-01: Map "closed" as "completed" in progress bar
    const effectiveCompleted = stats.completedActions + (stats.closedActions ?? 0)
    const effectiveTotal = stats.totalActions

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Banner */}
            <section className="rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-4 py-5 sm:px-8 sm:py-7 text-white animate-rise shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48" />
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-blue-300/30 text-[12px] font-semibold backdrop-blur-sm">
                            <Flame size={14} className="text-blue-300" aria-hidden="true" />
                            Panel de Control
                        </span>
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-300/30 text-[12px] font-semibold text-emerald-200 backdrop-blur-sm">
                            {stats.totalObservations} observaciones
                        </span>
                    </div>
                    <h2 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold leading-tight mb-2">
                        Resumen General del Plan de Usabilidad
                    </h2>
                    <p className="text-[14px] text-blue-100/80 max-w-4xl leading-relaxed">
                        Indicadores clave de rendimiento, hallazgos documentados y estado de las acciones de mejora para la evaluación de usabilidad.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm animate-rise transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                        <Filter size={18} className="text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-slate-900 leading-snug">Filtro de Datos por Evaluación</h3>
                        <p className="text-[12px] text-slate-500 mt-0.5">Métrica global (Todas las evaluaciones) o específicas por plan.</p>
                    </div>
                </div>
                <PlanSelector
                    showAll
                    value={dashboardFilter}
                    onChange={handleDashboardFilterChange}
                    className="sm:max-w-md"
                />
            </div>

            {/* KPI Cards - Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KPICard
                    icon={<BarChart2 size={22} className="text-blue-600" />}
                    value={stats.totalObservations}
                    label="Observaciones totales"
                    iconBg="bg-gradient-to-br from-blue-50 to-blue-100"
                    valueColor="text-blue-700"
                />
                <KPICard
                    icon={<CheckCircle2 size={22} className="text-emerald-500" />}
                    value={`${stats.successRate}%`}
                    label="Tasa de éxito"
                    iconBg="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    valueColor="text-emerald-600"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Clock size={22} className="text-amber-500" />}
                    value={`${Math.round(stats.averageTimeSeconds)}s`}
                    label="Tiempo promedio"
                    iconBg="bg-gradient-to-br from-amber-50 to-amber-100"
                    valueColor="text-amber-600"
                    delay="delay-200"
                />
                <KPICard
                    icon={<AlertCircle size={22} className="text-red-500" />}
                    value={stats.totalErrors}
                    label="Errores totales"
                    iconBg="bg-gradient-to-br from-red-50 to-red-100"
                    valueColor="text-red-600"
                    delay="delay-300"
                />
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KPICard
                    icon={<AlertTriangle size={22} className="text-red-500" />}
                    value={stats.criticalFindings}
                    label="Hallazgos críticos"
                    iconBg="bg-gradient-to-br from-red-50 to-red-100"
                    valueColor="text-red-600"
                />
                <KPICard
                    icon={<AlertTriangle size={22} className="text-blue-500" />}
                    value={stats.moderateFindings}
                    label="Hallazgos moderados"
                    iconBg="bg-gradient-to-br from-blue-50 to-blue-100"
                    valueColor="text-blue-600"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Lightbulb size={22} className="text-emerald-500" />}
                    value={effectiveCompleted}
                    label="Mejoras completadas"
                    iconBg="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    valueColor="text-emerald-600"
                    delay="delay-200"
                />
                <KPICard
                    icon={<TrendingUp size={22} className="text-indigo-500" />}
                    value={stats.pendingActions + stats.inProgressActions}
                    label="Mejoras pendientes"
                    iconBg="bg-gradient-to-br from-indigo-50 to-indigo-100"
                    valueColor="text-indigo-600"
                    delay="delay-300"
                />
            </div>

            {/* Three Column Grid: Task Performance, Findings, and Statistics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Task Performance */}
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg overflow-hidden animate-rise hover:shadow-xl transition-all duration-300 xl:col-span-1">
                    <div className="px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h3 className="text-[15px] font-bold text-slate-900">Rendimiento por Tarea</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        {stats.successByTask.map(task => {
                            const rate = task.total > 0 ? Math.round((task.successes / task.total) * 100) : 0
                            return (
                                <div key={task.taskId} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all">
                                    <div className="text-[13px] text-slate-600 w-14 font-bold">T{String(task.taskId).slice(0, 4)}</div>
                                    <div className="flex-1">
                                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${rate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : rate >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-red-500 to-red-400'} shadow-md`}
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-[13px] font-bold w-10 text-right text-slate-900">{rate}%</div>
                                    <div className="text-[11px] text-slate-500 w-16 text-right">{Math.round(task.avgTime)}s</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Statistics Pie Chart */}
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg overflow-hidden animate-rise hover:shadow-xl transition-all duration-300">
                    <div className="px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div className="flex items-center gap-2">
                            <PieChartIcon size={18} className="text-emerald-600" />
                            <h3 className="text-[15px] font-bold text-slate-900">Distribución de Hallazgos</h3>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        <PieChart
                            size={180}
                            data={[
                                { label: 'Críticos', value: stats.criticalFindings, color: '#ef4444' },
                                { label: 'Moderados', value: stats.moderateFindings, color: '#3b82f6' },
                                { label: 'Otros', value: Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings), color: '#10b981' },
                            ]}
                        />
                        <div className="mt-6 w-full space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-[12px] text-slate-600 font-medium">Críticos</span>
                                </div>
                                <span className="text-[12px] font-bold text-red-600">{stats.criticalFindings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-[12px] text-slate-600 font-medium">Moderados</span>
                                </div>
                                <span className="text-[12px] font-bold text-blue-600">{stats.moderateFindings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[12px] text-slate-600 font-medium">Otros</span>
                                </div>
                                <span className="text-[12px] font-bold text-emerald-600">{Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Findings */}
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg overflow-hidden animate-rise hover:shadow-xl transition-all duration-300">
                    <div className="px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-slate-900">Hallazgos Recientes</h3>
                        <span className="text-[12px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full">{findings.length}</span>
                    </div>
                    <div className="p-4 space-y-2.5 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        {findings.slice(0, 6).map((f: any) => (
                            <div key={f.id} className={`rounded-xl border-l-4 p-3.5 shadow-sm hover:shadow-md transition-all duration-200 ${f.severity === 'Alta' || f.severity === 'Critical' ? 'border-l-red-500 bg-red-50/30 hover:bg-red-100/50' : f.severity === 'High' ? 'border-l-orange-500 bg-orange-50/30 hover:bg-orange-100/50' : 'border-l-blue-500 bg-blue-50/30 hover:bg-blue-100/50'} border`}>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <p className="text-[12px] text-slate-800 leading-snug flex-1 font-medium">{f.description}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${f.severity === 'Alta' || f.severity === 'Critical' ? 'bg-red-200 text-red-800' : f.severity === 'High' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>{f.severity}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    {f.category && <span className="px-2 py-0.5 rounded-md bg-slate-100">{f.category}</span>}
                                    {f.tool && <span className="px-2 py-0.5 rounded-md bg-slate-100">{f.tool}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions Status - DASH-01: closed counted as completed */}
            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg overflow-hidden animate-rise hover:shadow-xl transition-all duration-300">
                <div className="px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <h3 className="text-[15px] font-bold text-slate-900">Estado de Acciones de Mejora</h3>
                </div>
                <div className="p-4 sm:p-7">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
                        <div className="flex items-center gap-6 sm:gap-8 flex-1 w-full justify-around sm:justify-start">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1">{effectiveCompleted}</div>
                                <div className="text-[12px] text-slate-600 font-semibold">Completadas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-amber-500 mb-1">{stats.inProgressActions}</div>
                                <div className="text-[12px] text-slate-600 font-semibold">En Progreso</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-slate-400 mb-1">{stats.pendingActions}</div>
                                <div className="text-[12px] text-slate-600 font-semibold">Pendientes</div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-w-0">
                            <div className="h-4 rounded-full bg-slate-200 flex overflow-hidden shadow-md">
                                {effectiveTotal > 0 && (
                                    <>
                                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-700" style={{ width: `${(effectiveCompleted / effectiveTotal) * 100}%` }} />
                                        <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full transition-all duration-700" style={{ width: `${(stats.inProgressActions / effectiveTotal) * 100}%` }} />
                                    </>
                                )}
                            </div>
                            <div className="mt-2 text-[12px] text-slate-600 text-right font-bold">
                                {effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : 0}% completado • {effectiveTotal} total
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}