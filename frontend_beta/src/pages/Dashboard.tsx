import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, findingsApi } from '../api'
import { usePlan } from '../context/PlanContext'
import { BarChart2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Lightbulb, TrendingUp, Flame, PieChart as PieChartIcon, Users, MessageSquareText, ListChecks, CalendarRange, Eye, Search, ArrowRight, Lock, Check, Zap } from 'lucide-react'
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

/* ── Phase Stepper Component ── */
function PhaseStepper({ sectionDone, canAccessPhase2, canAccessPhase3 }: {
    sectionDone: Record<string, boolean>
    canAccessPhase2: boolean
    canAccessPhase3: boolean
}) {
    const phase1Done = sectionDone.guion && sectionDone.participantes
    const phase1Count = (sectionDone.guion ? 1 : 0) + (sectionDone.participantes ? 1 : 0)
    const phase2Done = sectionDone.tareas && sectionDone.sesiones && sectionDone.observaciones
    const phase2Count = (sectionDone.tareas ? 1 : 0) + (sectionDone.sesiones ? 1 : 0) + (sectionDone.observaciones ? 1 : 0)
    const phase3Done = sectionDone.hallazgos && sectionDone.mejoras
    const phase3Count = (sectionDone.hallazgos ? 1 : 0) + (sectionDone.mejoras ? 1 : 0)

    const steps = [
        { label: 'Preparación', subtitle: `${phase1Count}/2 secciones`, done: phase1Done, active: !phase1Done, locked: false },
        { label: 'Ejecución', subtitle: `${phase2Count}/3 secciones`, done: phase2Done, active: phase1Done && !phase2Done && canAccessPhase2, locked: !canAccessPhase2 },
        { label: 'Análisis', subtitle: `${phase3Count}/2 secciones`, done: phase3Done, active: phase2Done && !phase3Done && canAccessPhase3, locked: !canAccessPhase3 },
    ]

    return (
        <div className="phase-stepper" role="list" aria-label="Progreso por fases">
            {steps.map((step, i) => (
                <div key={i} className="phase-stepper-item" role="listitem">
                    {i > 0 && (
                        <div className={`phase-stepper-line ${steps[i - 1].done ? 'is-done' : ''}`} aria-hidden="true" />
                    )}
                    <div className={`phase-stepper-circle ${
                        step.done ? 'is-done' : step.active ? 'is-active' : 'is-locked'
                    }`}>
                        {step.done ? (
                            <Check size={16} strokeWidth={3} />
                        ) : step.locked ? (
                            <Lock size={14} />
                        ) : (
                            <span className="phase-stepper-dot" />
                        )}
                    </div>
                    <div className="phase-stepper-label">
                        <span className={`text-[13px] font-bold ${
                            step.done ? 'text-emerald-700' : step.active ? 'text-blue-700' : 'text-slate-400'
                        }`}>{step.label}</span>
                        <span className={`text-[11px] ${
                            step.done ? 'text-emerald-500' : step.active ? 'text-blue-500' : 'text-slate-400'
                        }`}>{step.subtitle}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ── Quick Actions Component ── */
function QuickActions({ sectionDone, canAccessPhase2, canAccessPhase3 }: {
    sectionDone: Record<string, boolean>
    canAccessPhase2: boolean
    canAccessPhase3: boolean
}) {
    const navigate = useNavigate()

    const actions = [
        { key: 'plan_de_prueba', label: 'Crear Plan de Prueba', desc: 'Define objetivos, alcance y metodología', icon: Zap, to: '/planes', phase: 0 },
        { key: 'guion', label: 'Guión del Moderador', desc: 'Prepara las instrucciones para las sesiones', icon: MessageSquareText, to: '/guion', phase: 1 },
        { key: 'participantes', label: 'Registrar Participantes', desc: 'Agrega usuarios para las pruebas', icon: Users, to: '/participantes', phase: 1 },
        { key: 'tareas', label: 'Definir Tareas', desc: 'Crea escenarios y criterios de éxito', icon: ListChecks, to: '/tareas', phase: 2, locked: !canAccessPhase2 },
        { key: 'sesiones', label: 'Programar Sesiones', desc: 'Agenda las sesiones de prueba', icon: CalendarRange, to: '/sesiones', phase: 2, locked: !canAccessPhase2 },
        { key: 'observaciones', label: 'Registrar Observaciones', desc: 'Documenta resultados de las sesiones', icon: Eye, to: '/observaciones', phase: 2, locked: !canAccessPhase2 },
        { key: 'hallazgos', label: 'Documentar Hallazgos', desc: 'Sintetiza los problemas encontrados', icon: Search, to: '/hallazgos', phase: 3, locked: !canAccessPhase3 },
        { key: 'mejoras', label: 'Acciones de Mejora', desc: 'Define el plan de mejoras', icon: Lightbulb, to: '/mejoras', phase: 3, locked: !canAccessPhase3 },
    ]

    // Show only the first 3 pending actions
    const pending = actions.filter(a => !sectionDone[a.key] && !a.locked).slice(0, 3)

    if (pending.length === 0) return null

    return (
        <section className="animate-rise">
            <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-amber-500" aria-hidden="true" />
                <h3 className="text-[16px] font-bold text-slate-900">Acciones Rápidas</h3>
                <span className="text-[11px] text-slate-400 ml-auto">Siguientes pasos sugeridos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map(action => (
                    <button
                        key={action.key}
                        onClick={() => navigate(action.to)}
                        className="quick-action group"
                        aria-label={`Ir a ${action.label}`}
                    >
                        <div className="quick-action-icon">
                            <action.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{action.label}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">{action.desc}</div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" aria-hidden="true" />
                    </button>
                ))}
            </div>
        </section>
    )
}

export default function Dashboard() {
    const { plans, activePlanId, sectionDone, canAccessPhase2, canAccessPhase3 } = usePlan()

    const [stats, setStats] = useState<Stats | null>(null)
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
        if (plans.length > 0 || activePlanId !== '__UNSET__') {
            fetchDashboardData(activePlanId && activePlanId !== '__UNSET__' ? activePlanId : '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePlanId, plans])

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

    // Global progress calculation
    const totalSections = 7 // guion, participantes, tareas, sesiones, observaciones, hallazgos, mejoras
    const completedSections = ['guion', 'participantes', 'tareas', 'sesiones', 'observaciones', 'hallazgos', 'mejoras'].filter(k => sectionDone[k]).length
    const globalProgress = Math.round((completedSections / totalSections) * 100)

    return (
        <div className="flex flex-col gap-8">
            {/* Phase Stepper */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-6 animate-rise">
                <div className="flex items-center gap-2 mb-5">
                    <h3 className="text-[15px] font-bold text-slate-900">Progreso del Plan de Usabilidad</h3>
                    <span className="ml-auto text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">{globalProgress}% completado</span>
                </div>
                <PhaseStepper sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />
                {/* Global Progress Bar */}
                <div className="mt-5">
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-700 ease-out shadow-md"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-[11px] text-slate-400 font-medium">
                        <span>{completedSections} de {totalSections} secciones</span>
                        <span>{globalProgress === 100 ? '🎉 ¡Plan completado!' : 'En progreso...'}</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <QuickActions sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />

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