import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, findingsApi } from '../api'
import { usePlan } from '../context/PlanContext'
import { BarChart2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Info, Lightbulb, TrendingUp, Flame, PieChart as PieChartIcon, Users, MessageSquareText, ListChecks, CalendarRange, Eye, Search, ArrowRight, Lock, Check, Zap } from 'lucide-react'
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

function KPICard({ icon, value, label, iconBg, valueColor = '', delay = '' }: KPICardProps) {
    return (
        <div className={`kpi-card ${delay}`} role="group" aria-label={`Métrica: ${label}`}>
            <div className="kpi-card-icon-container" style={{ background: iconBg }}>
                {icon}
            </div>
            <div className="kpi-card-content">
                <div className="kpi-card-value" style={{ color: valueColor }}>{value}</div>
                <div className="kpi-card-label">{label}</div>
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
            {steps.map((step, i) => {
                const stepState = step.done ? 'is-done' : step.active ? 'is-active' : 'is-locked'
                return (
                    <div key={i} className="phase-stepper-item" role="listitem">
                        {i > 0 && (
                            <div className={`phase-stepper-line ${steps[i - 1].done ? 'is-done' : ''}`} aria-hidden="true" />
                        )}
                        <div className={`phase-stepper-circle ${stepState}`}>
                            {step.done ? (
                                <Check size={16} strokeWidth={3} />
                            ) : step.locked ? (
                                <Lock size={14} />
                            ) : (
                                <span className="phase-stepper-dot" />
                            )}
                        </div>
                        <div className="phase-stepper-label">
                            <span className={`phase-stepper-label-title ${stepState}`}>{step.label}</span>
                            <span className={`phase-stepper-label-subtitle ${stepState}`}>{step.subtitle}</span>
                        </div>
                    </div>
                )
            })}
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

    const pending = actions.filter(a => !sectionDone[a.key] && !a.locked).slice(0, 3)

    if (pending.length === 0) return null

    return (
        <section className="dashboard-quick-actions">
            <div className="dashboard-quick-actions-header">
                <Zap size={18} className="text-amber-500" aria-hidden="true" />
                <h3 className="dashboard-quick-actions-title">Acciones Rápidas</h3>
                <span className="dashboard-quick-actions-subtitle">Siguientes pasos sugeridos</span>
            </div>
            <div className="dashboard-quick-actions-grid">
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
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <div className="nav-item-label" style={{ fontWeight: 600 }}>{action.label}</div>
                            <div className="nav-item-detail" style={{ marginTop: 'var(--space-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.desc}</div>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--neutral-400)', transition: 'transform 0.2s' }} className="group-hover-arrow" aria-hidden="true" />
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
            <div className="dashboard-loader-container">
                <div className="dashboard-spinner" />
                <p className="dashboard-loader-text">Cargando dashboard...</p>
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

    const getSeverityBadge = (severity: string) => {
        const iconStyle = { marginRight: '4px', flexShrink: 0 }
        switch (severity) {
            case 'Alta':
            case 'Critical':
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--critical" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <AlertCircle size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
            case 'High':
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--high" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <AlertTriangle size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
            default: // 'Moderate' / other
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--moderate" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Info size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
        }
    }

    return (
        <div className="dashboard-container">
            {/* Phase Stepper Card */}
            <section className="dashboard-stepper-card">
                <div className="dashboard-stepper-header">
                    <h3 className="dashboard-stepper-title">Progreso del Plan de Usabilidad</h3>
                    <span className="dashboard-stepper-badge">{globalProgress}% completado</span>
                </div>
                <PhaseStepper sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />
                {/* Global Progress Bar */}
                <div style={{ marginTop: 'var(--space-5)' }}>
                    <div className="dashboard-progress-track">
                        <div
                            className="dashboard-progress-fill"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                    <div className="dashboard-progress-footer">
                        <span>{completedSections} de {totalSections} secciones</span>
                        <span>{globalProgress === 100 ? '🎉 ¡Plan completado!' : 'En progreso...'}</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <QuickActions sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />

            {/* Hero Banner */}
            <section className="dashboard-hero">
                <div className="dashboard-hero-deco" aria-hidden="true" />
                <div className="dashboard-hero-content">
                    <div className="dashboard-hero-tags">
                        <span className="dashboard-hero-badge">
                            <Flame size={14} className="text-blue-300" aria-hidden="true" />
                            Panel de Control
                        </span>
                        <span className="dashboard-hero-badge dashboard-hero-badge--success">
                            {stats.totalObservations} observaciones
                        </span>
                    </div>
                    <h2 className="dashboard-hero-title">
                        Resumen General del Plan de Usabilidad
                    </h2>
                    <p className="dashboard-hero-subtitle">
                        Indicadores clave de rendimiento, hallazgos documentados y estado de las acciones de mejora para la evaluación de usabilidad.
                    </p>
                </div>
            </section>

            {/* KPI Cards - Row 1 */}
            <div className="dashboard-kpi-row">
                <KPICard
                    icon={<BarChart2 size={22} className="text-blue-600" />}
                    value={stats.totalObservations}
                    label="Observaciones totales"
                    iconBg="var(--color-primary-light)"
                    valueColor="var(--color-primary)"
                />
                <KPICard
                    icon={<CheckCircle2 size={22} className="text-emerald-500" />}
                    value={`${stats.successRate}%`}
                    label="Tasa de éxito"
                    iconBg="var(--color-success-light)"
                    valueColor="var(--color-success)"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Clock size={22} className="text-amber-500" />}
                    value={`${Math.round(stats.averageTimeSeconds)}s`}
                    label="Tiempo promedio"
                    iconBg="var(--color-warning-light)"
                    valueColor="var(--color-warning)"
                    delay="delay-200"
                />
                <KPICard
                    icon={<AlertCircle size={22} className="text-red-500" />}
                    value={stats.totalErrors}
                    label="Errores totales"
                    iconBg="var(--color-error-light)"
                    valueColor="var(--color-error)"
                    delay="delay-300"
                />
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="dashboard-kpi-row">
                <KPICard
                    icon={<AlertTriangle size={22} className="text-red-500" />}
                    value={stats.criticalFindings}
                    label="Hallazgos críticos"
                    iconBg="var(--color-error-light)"
                    valueColor="var(--color-error)"
                />
                <KPICard
                    icon={<AlertTriangle size={22} className="text-blue-500" />}
                    value={stats.moderateFindings}
                    label="Hallazgos moderados"
                    iconBg="var(--color-primary-light)"
                    valueColor="var(--color-primary)"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Lightbulb size={22} className="text-emerald-500" />}
                    value={effectiveCompleted}
                    label="Mejoras completadas"
                    iconBg="var(--color-success-light)"
                    valueColor="var(--color-success)"
                    delay="delay-200"
                />
                <KPICard
                    icon={<TrendingUp size={22} className="text-indigo-500" />}
                    value={stats.pendingActions + stats.inProgressActions}
                    label="Mejoras pendientes"
                    iconBg="linear-gradient(135deg, #e0e7ff, #eff6ff)"
                    valueColor="#4f46e5"
                    delay="delay-300"
                />
            </div>

            {/* Three Column Grid: Task Performance, Findings, and Statistics */}
            <div className="dashboard-panels-grid">
                {/* Task Performance */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--blue">
                        <h3 className="dashboard-panel-title">Rendimiento por Tarea</h3>
                    </div>
                    <div className="dashboard-panel-body">
                        <div className="dashboard-task-list">
                            {stats.successByTask.map(task => {
                                const rate = task.total > 0 ? Math.round((task.successes / task.total) * 100) : 0
                                const rateClass = rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'error'
                                return (
                                    <div key={task.taskId} className="dashboard-task-item">
                                        <div className="dashboard-task-id">T{String(task.taskId).slice(0, 4)}</div>
                                        <div className="dashboard-task-progress-track">
                                            <div
                                                className={`dashboard-task-progress-fill dashboard-task-progress-fill--${rateClass}`}
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                        <div className="dashboard-task-rate">{rate}%</div>
                                        <div className="dashboard-task-time">{Math.round(task.avgTime)}s</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Statistics Pie Chart */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--emerald">
                        <div className="dashboard-panel-header-inner" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <PieChartIcon size={18} className="text-emerald-600" />
                                <h3 className="dashboard-panel-title">Distribución de Hallazgos</h3>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-panel-body">
                        <div className="dashboard-pie-container">
                            <PieChart
                                size={180}
                                data={[
                                    { label: 'Críticos', value: stats.criticalFindings, color: '#ef4444' },
                                    { label: 'Moderados', value: stats.moderateFindings, color: '#3b82f6' },
                                    { label: 'Otros', value: Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings), color: '#10b981' },
                                ]}
                            />
                            <div className="dashboard-pie-legend">
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#ef4444' }} />
                                        <span>Críticos</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--critical">{stats.criticalFindings}</span>
                                </div>
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#3b82f6' }} />
                                        <span>Moderados</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--moderate">{stats.moderateFindings}</span>
                                </div>
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#10b981' }} />
                                        <span>Otros</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--other">{Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Findings */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--purple">
                        <div className="dashboard-panel-header-inner" style={{ width: '100%' }}>
                            <h3 className="dashboard-panel-title">Hallazgos Recientes</h3>
                            <span className="dashboard-panel-badge">{findings.length}</span>
                        </div>
                    </div>
                    <div className="dashboard-panel-body" style={{ padding: 'var(--space-4)' }}>
                        <div className="dashboard-findings-list soft-scrollbar">
                            {findings.slice(0, 6).map((f: any) => {
                                const sevClass = (f.severity === 'Alta' || f.severity === 'Critical')
                                    ? 'critical'
                                    : f.severity === 'High'
                                        ? 'high'
                                        : 'moderate'
                                return (
                                    <div key={f.id} className={`dashboard-finding-card dashboard-finding-card--${sevClass}`}>
                                        <div className="dashboard-finding-header">
                                            <p className="dashboard-finding-desc">{f.description}</p>
                                            {getSeverityBadge(f.severity)}
                                        </div>
                                        <div className="dashboard-finding-meta">
                                            {f.category && <span className="dashboard-finding-meta-badge">{f.category}</span>}
                                            {f.tool && <span className="dashboard-finding-meta-badge">{f.tool}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Status */}
            <section className="dashboard-improvements-card">
                <div className="dashboard-improvements-header">
                    <h3 className="dashboard-panel-title">Estado de Acciones de Mejora</h3>
                </div>
                <div className="dashboard-improvements-body">
                    <div className="dashboard-improvements-layout">
                        <div className="dashboard-improvements-stats">
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--completed">{effectiveCompleted}</div>
                                <div className="dashboard-improvements-stat-label">Completadas</div>
                            </div>
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--progress">{stats.inProgressActions}</div>
                                <div className="dashboard-improvements-stat-label">En Progreso</div>
                            </div>
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--pending">{stats.pendingActions}</div>
                                <div className="dashboard-improvements-stat-label">Pendientes</div>
                            </div>
                        </div>
                        <div className="dashboard-improvements-progress-container">
                            <div className="dashboard-improvements-progress-track">
                                {effectiveTotal > 0 && (
                                    <>
                                        <div className="dashboard-improvements-progress-fill--completed" style={{ width: `${(effectiveCompleted / effectiveTotal) * 100}%` }} />
                                        <div className="dashboard-improvements-progress-fill--progress" style={{ width: `${(stats.inProgressActions / effectiveTotal) * 100}%` }} />
                                    </>
                                )}
                            </div>
                            <div className="dashboard-improvements-progress-label">
                                {effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : 0}% completado • {effectiveTotal} total
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}