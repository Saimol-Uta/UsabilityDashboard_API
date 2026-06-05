import { CheckCircle2, Archive, Shield, Activity, Layers, Clock, Zap, ListChecks, TrendingUp } from 'lucide-react'

interface TechnicalTask {
  id: string
  title: string
  estimatedHours: number
}

interface UserStory {
  id: string
  title: string
  description: string
  priority: string
  acceptanceCriteria: string[]
  technicalTasks: TechnicalTask[]
  origen_hallazgo?: string
  estimatedHours?: number
  heuristic?: string
}

interface InsightsIHCProps {
  userStories: UserStory[]
  observationsCount: number
  processedCount: number
  onConfirm: () => void
  onArchive: () => void
}

const PRIORITY_CONFIG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  Alta:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',   text: '#dc2626', label: 'Alta' },
  Media: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  text: '#b45309', label: 'Media' },
  Baja:  { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)', text: '#059669', label: 'Baja' },
}

export default function InsightsIHC({
  userStories,
  observationsCount,
  processedCount,
  onConfirm,
  onArchive
}: InsightsIHCProps) {
  const totalObs = observationsCount || 1
  const cognitiveReduction = Math.min(100, Math.round((processedCount / totalObs) * 100))
  const heuristicMitigations = userStories.filter(s => !!s.heuristic).length
  const totalHours = userStories.reduce((sum, s) =>
    sum + (s.estimatedHours || s.technicalTasks.reduce((t, tk) => t + (tk.estimatedHours || 0), 0)), 0)
  const totalTasks = userStories.reduce((sum, s) => sum + s.technicalTasks.length, 0)

  const byPriority = {
    Alta:  userStories.filter(s => s.priority === 'Alta'),
    Media: userStories.filter(s => s.priority === 'Media'),
    Baja:  userStories.filter(s => s.priority === 'Baja'),
  }

  // Unique heuristics list
  const uniqueHeuristics = [...new Set(userStories.map(s => s.heuristic).filter(Boolean))] as string[]

  return (
    <div className="sprint-setup-panel" style={{ maxWidth: '960px', margin: 'var(--space-6) auto', padding: 'var(--space-6)', position: 'relative' }}>
      <div className="sprint-setup-panel-bg-icon">
        <Activity size={120} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ background: 'var(--color-primary-light)', padding: 'var(--space-2)', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)' }}>
          <Layers size={24} />
        </div>
        <div>
          <h3 className="sprint-setup-title" style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
            Validación de Insights IHC — Revisión del Borrador
          </h3>
          <p className="sprint-setup-description" style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Resumen de lo que resuelve el Sprint Backlog generado. Revisa antes de confirmar el tablero.
          </p>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>

        {/* Coverage */}
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ background: 'var(--color-primary)', color: 'white', width: 52, height: 52, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', flexShrink: 0 }}>
            {cognitiveReduction}%
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Cobertura de Observaciones
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              {processedCount} de {totalObs} observaciones/incidentes IHC transformados en historias accionables.
            </p>
          </div>
        </div>

        {/* Heuristics */}
        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ background: '#10b981', color: 'white', width: 52, height: 52, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Heurísticas Nielsen Mitigadas
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              {heuristicMitigations} de {userStories.length} historias con violación heurística declarada y resuelta.
            </p>
          </div>
        </div>

        {/* Total hours */}
        <div style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ background: '#0ea5e9', color: 'white', width: 52, height: 52, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Esfuerzo Total Estimado
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              <strong style={{ fontSize: 'var(--font-size-base)', color: '#0ea5e9' }}>{totalHours}h</strong> distribuidas en {userStories.length} historias de usuario.
            </p>
          </div>
        </div>

        {/* Technical tasks */}
        <div style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ background: '#a855f7', color: 'white', width: 52, height: 52, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ListChecks size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Tareas Técnicas Generadas
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              <strong style={{ fontSize: 'var(--font-size-base)', color: '#a855f7' }}>{totalTasks}</strong> tareas de implementación listas para asignar al equipo.
            </p>
          </div>
        </div>
      </div>

      {/* ── Priority Breakdown ── */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TrendingUp size={15} style={{ color: 'var(--color-primary)' }} />
          Distribución por Prioridad
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-3)' }}>
          {(['Alta', 'Media', 'Baja'] as const).map(p => {
            const cfg = PRIORITY_CONFIG[p]
            const stories = byPriority[p]
            const hours = stories.reduce((sum, s) =>
              sum + (s.estimatedHours || s.technicalTasks.reduce((t, tk) => t + (tk.estimatedHours || 0), 0)), 0)
            return (
              <div key={p} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: cfg.text }}>Prioridad {cfg.label}</span>
                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: cfg.text }}>{stories.length}</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {hours}h estimadas · {stories.reduce((s, st) => s + st.technicalTasks.length, 0)} tareas
                </p>
                {/* Mini progress bar */}
                <div style={{ marginTop: 6, height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: userStories.length ? `${(stories.length / userStories.length) * 100}%` : '0%', background: cfg.text, borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Heuristics Resolved List ── */}
      {uniqueHeuristics.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Zap size={14} style={{ color: '#f59e0b' }} />
            Principios Heurísticos Resueltos ({uniqueHeuristics.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {uniqueHeuristics.map(h => (
              <span key={h} style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400e', fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Extended Mapping Table ── */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
          Tabla de Mapeo Contextual — Detalle por Historia
        </h4>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-800)', borderBottom: '1px solid var(--neutral-700)' }}>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600, width: 70 }}>ID</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600 }}>Historia de Usuario</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600, width: 80 }}>Prioridad</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600 }}>Origen (Hallazgo / Sesión)</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600 }}>Heurística Mitigada</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600, width: 80, textAlign: 'center' }}>Horas</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 600, width: 70, textAlign: 'center' }}>Tareas</th>
              </tr>
            </thead>
            <tbody>
              {userStories.map((story, idx) => {
                const cfg = PRIORITY_CONFIG[story.priority] || PRIORITY_CONFIG['Baja']
                const hours = story.estimatedHours || story.technicalTasks.reduce((t, tk) => t + (tk.estimatedHours || 0), 0)
                const isEven = idx % 2 === 0
                return (
                  <tr key={story.id} style={{ borderBottom: '1px solid var(--border-color)', background: isEven ? 'var(--neutral-50)' : 'var(--white)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                      {story.id}
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 220 }}>
                      <span title={story.description} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {story.title}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <span style={{ display: 'inline-block', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {story.priority}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)', maxWidth: 200 }}>
                      <span title={story.origen_hallazgo} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {story.origen_hallazgo || 'Copiloto IA — Análisis contextual'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      {story.heuristic ? (
                        <span style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 10 }}>
                          {story.heuristic}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: 700, color: '#0ea5e9' }}>
                      {hours}h
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: 700, color: '#a855f7' }}>
                      {story.technicalTasks.length}
                    </td>
                  </tr>
                )
              })}
              {userStories.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay historias generadas en este borrador.
                  </td>
                </tr>
              )}
            </tbody>
            {userStories.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--neutral-100)', borderTop: '2px solid var(--border-color)' }}>
                  <td colSpan={5} style={{ padding: 'var(--space-3)', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: 800, color: '#0ea5e9' }}>{totalHours}h</td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: 800, color: '#a855f7' }}>{totalTasks}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={onArchive}
          className="btn btn-secondary"
          style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-size-sm)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}
        >
          <Archive size={16} />
          Archivar y Añadir más Datos
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-primary"
          style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-size-sm)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}
        >
          <CheckCircle2 size={16} />
          Confirmar y Construir Tablero
        </button>
      </div>
    </div>
  )
}
