import { useEffect, useState } from 'react'
import { dashboardApi, findingsApi, improvementActionsApi } from '../api'
import { BarChart2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Lightbulb, TrendingUp, Flame } from 'lucide-react'

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
  errorsBySeverity: { severity: string; count: number }[]
  successByTask: { taskId: number; total: number; successes: number; avgTime: number }[]
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
    <div className={`kpi-card p-4 flex items-center gap-4 min-w-0 animate-rise ${delay}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold leading-none ${valueColor}`}>{value}</div>
        <div className="text-[11px] text-gray-400 mt-1 leading-tight">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [findings, setFindings] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(1),
      findingsApi.getAll(1),
      improvementActionsApi.getAll()
    ]).then(([statsRes, findingsRes, actionsRes]) => {
      setStats(statsRes.data)
      setFindings(findingsRes.data)
      setActions(actionsRes.data)
    }).finally(() => setLoading(false))
  }, [])

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

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-5 py-5 text-white animate-rise">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px]">
            <Flame size={12} className="text-blue-200" aria-hidden="true" />
            Panel de Control
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px]">
            {stats.totalObservations} observaciones registradas
          </span>
        </div>
        <h2 className="mt-3 text-[20px] font-semibold leading-tight">
          Resumen General del Plan de Usabilidad
        </h2>
        <p className="mt-1 text-[13px] text-blue-100/90 max-w-4xl">
          Indicadores clave de rendimiento, hallazgos documentados y estado de las acciones de mejora para la evaluación de usabilidad.
        </p>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          icon={<BarChart2 size={18} className="text-blue-600" />}
          value={stats.totalObservations}
          label="Observaciones totales"
          iconBg="bg-blue-50"
          valueColor="text-blue-700"
        />
        <KPICard
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          value={`${stats.successRate}%`}
          label="Tasa de éxito"
          iconBg="bg-emerald-50"
          valueColor="text-emerald-600"
          delay="delay-1"
        />
        <KPICard
          icon={<Clock size={18} className="text-amber-500" />}
          value={`${Math.round(stats.averageTimeSeconds)}s`}
          label="Tiempo promedio"
          iconBg="bg-amber-50"
          valueColor="text-amber-600"
          delay="delay-2"
        />
        <KPICard
          icon={<AlertCircle size={18} className="text-red-500" />}
          value={stats.totalErrors}
          label="Errores totales"
          iconBg="bg-red-50"
          valueColor="text-red-600"
          delay="delay-3"
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          icon={<AlertTriangle size={18} className="text-red-500" />}
          value={stats.criticalFindings}
          label="Hallazgos críticos"
          iconBg="bg-red-50"
          valueColor="text-red-600"
        />
        <KPICard
          icon={<AlertTriangle size={18} className="text-blue-500" />}
          value={stats.moderateFindings}
          label="Hallazgos moderados"
          iconBg="bg-blue-50"
          valueColor="text-blue-600"
          delay="delay-1"
        />
        <KPICard
          icon={<Lightbulb size={18} className="text-emerald-500" />}
          value={stats.completedActions}
          label="Mejoras completadas"
          iconBg="bg-emerald-50"
          valueColor="text-emerald-600"
          delay="delay-2"
        />
        <KPICard
          icon={<TrendingUp size={18} className="text-indigo-500" />}
          value={stats.pendingActions + stats.inProgressActions}
          label="Mejoras pendientes"
          iconBg="bg-indigo-50"
          valueColor="text-indigo-600"
          delay="delay-3"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Task Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise delay-1">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-[14px] font-semibold text-gray-800">Rendimiento por Tarea</h3>
          </div>
          <div className="p-4 space-y-3">
            {stats.successByTask.map(task => {
              const rate = task.total > 0 ? Math.round((task.successes / task.total) * 100) : 0
              return (
                <div key={task.taskId} className="flex items-center gap-3">
                  <div className="text-[12px] text-slate-500 w-14 font-mono">T{task.taskId}</div>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[12px] font-semibold w-12 text-right">{rate}%</div>
                  <div className="text-[11px] text-slate-400 w-16 text-right">{Math.round(task.avgTime)}s avg</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Findings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise delay-2">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-gray-800">Hallazgos Recientes</h3>
            <span className="text-[11px] text-gray-400">{findings.length} total</span>
          </div>
          <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto soft-scrollbar">
            {findings.slice(0, 5).map((f: any) => (
              <div key={f.id} className={`rounded-lg border p-3 ${f.severity === 'Alta' ? 'border-l-[3px] border-l-red-300 border-slate-100' : 'border-l-[3px] border-l-blue-300 border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] text-gray-700 leading-snug flex-1">{f.description}</p>
                  <span className={`badge ${f.severity === 'Alta' ? 'badge-alta' : 'badge-media'}`}>{f.severity}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{f.category}</span>
                  <span>·</span>
                  <span>{f.tool}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-rise delay-3">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-[14px] font-semibold text-gray-800">Estado de Acciones de Mejora</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.completedActions}</div>
                <div className="text-[11px] text-slate-400">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{stats.inProgressActions}</div>
                <div className="text-[11px] text-slate-400">En Progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-400">{stats.pendingActions}</div>
                <div className="text-[11px] text-slate-400">Pendientes</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-slate-100 flex overflow-hidden">
                {stats.totalActions > 0 && (
                  <>
                    <div className="bg-emerald-500 h-full" style={{ width: `${(stats.completedActions / stats.totalActions) * 100}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${(stats.inProgressActions / stats.totalActions) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 text-right">
                {stats.totalActions > 0 ? Math.round((stats.completedActions / stats.totalActions) * 100) : 0}% completado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
