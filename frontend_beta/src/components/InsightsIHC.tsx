import { CheckCircle2, Archive, Shield, Activity, Layers } from 'lucide-react'

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

  return (
    <div className="sprint-setup-panel" style={{ maxWidth: '900px', margin: 'var(--space-6) auto', padding: 'var(--space-6)', position: 'relative' }}>
      <div className="sprint-setup-panel-bg-icon">
        <Activity size={120} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div style={{ background: 'var(--color-primary-light)', padding: 'var(--space-2)', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)' }}>
          <Layers size={24} />
        </div>
        <div>
          <h3 className="sprint-setup-title" style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>
            Insights de Interacción Humano-Computador (IHC)
          </h3>
          <p className="sprint-setup-description" style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Métricas de usabilidad estimadas y mapeo heurístico para la validación del sprint.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        
        {/* Cognitive Load Card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.07)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div style={{
            background: 'var(--color-primary)',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-bold)'
          }}>
            {cognitiveReduction}%
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Reducción de Carga Cognitiva
            </h4>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              {processedCount} de {totalObs} observaciones/incidentes IHC resueltos.
            </p>
          </div>
        </div>

        {/* Heuristics Mitigated Card */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.07)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div style={{
            background: '#10b981',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Violaciones Heurísticas Mitigadas
            </h4>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              {heuristicMitigations} historias de usuario con heurística Nielsen declarada.
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Mapping Table */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
          Tabla de Mapeo Contextual
        </h4>
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)', textAlign: 'left' }}>
            <thead>
            <tr style={{ background: 'var(--neutral-800)', borderBottom: '1px solid var(--neutral-700)' }}>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 'var(--font-weight-semibold)', width: '100px' }}>ID Historia</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 'var(--font-weight-semibold)' }}>Origen (Sesiones / Hallazgo)</th>
                <th style={{ padding: 'var(--space-3)', color: 'var(--neutral-200)', fontWeight: 'var(--font-weight-semibold)' }}>Heurística de Nielsen Mitigada</th>
              </tr>
            </thead>
            <tbody>
              {userStories.map((story) => (
                <tr key={story.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--neutral-900)' }}>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{story.id}</td>
                  <td style={{ padding: 'var(--space-3)', color: 'var(--white)' }}>{story.origen_hallazgo || 'Copiloto IA - Sugerencia Contextual'}</td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {story.heuristic || 'No declarada'}
                    </span>
                  </td>
                </tr>
              ))}
              {userStories.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay historias generadas en este borrador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--space-3)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: 'var(--space-4)',
        marginTop: 'var(--space-4)'
      }}>
        <button
          type="button"
          onClick={onArchive}
          className="btn btn-secondary"
          style={{
            padding: 'var(--space-3) var(--space-5)',
            fontSize: 'var(--font-size-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer'
          }}
        >
          <Archive size={16} />
          📦 Archivar y Añadir más Datos
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn btn-primary"
          style={{
            padding: 'var(--space-3) var(--space-5)',
            fontSize: 'var(--font-size-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={16} />
          🚀 Confirmar y Construir Tablero
        </button>
      </div>
    </div>
  )
}
