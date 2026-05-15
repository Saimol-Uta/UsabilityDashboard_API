# Guía de Implementación - Dashboard Component

## Componente: Dashboard.tsx

### Requisitos
- ✅ 3 secciones claras (Status, Gráficos, Acciones)
- ✅ KPIs sin scrollear (above the fold)
- ✅ Indicadores de severidad
- ✅ Filtros y búsqueda
- ✅ Real-time updates

### Estructura

```typescript
// Dashboard.tsx
export function DashboardComponent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ sesion: 'todas', fecha: 'hoy' });

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000); // Update cada 10s
    return () => clearInterval(interval);
  }, [filter]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?${new URLSearchParams(filter)}`);
      const data = await response.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      {/* Filtros */}
      <section className="filters-section">
        <select value={filter.sesion} onChange={(e) => setFilter({...filter, sesion: e.target.value})}>
          <option value="todas">Todas las sesiones</option>
          {stats?.sesiones?.map(s => <option key={s.id}>{s.nombre}</option>)}
        </select>
      </section>

      {/* SECCIÓN 1: STATUS ACTUAL */}
      <section className="status-section">
        <h2>Estado Actual</h2>
        <div className="kpi-grid">
          <KPICard title="Tests Activos" value={stats.activeTests} icon="📋" />
          <KPICard title="Sesiones en Curso" value={stats.activeSessions} icon="▶️" />
          <KPICard title="Hallazgos Nuevos" value={stats.findingsToday} icon="🔍" />
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn btn-primary">+ Crear Test</button>
          <button className="btn btn-secondary">🔍 Registrar Hallazgo</button>
        </div>
      </section>

      {/* SECCIÓN 2: TENDENCIAS */}
      <section className="trends-section">
        <h2>Tendencias</h2>
        <FindingsTrendChart data={stats.dailyTrends} />
        <SuccessRateChart data={stats.taskSuccessRates} />
      </section>

      {/* SECCIÓN 3: HALLAZGOS PENDIENTES */}
      <section className="findings-section">
        <h2>Hallazgos Pendientes</h2>
        {stats.findings?.map(finding => (
          <FindingCard 
            key={finding.id} 
            finding={finding} 
            severity={finding.severity}
          />
        ))}
      </section>
    </div>
  );
}
```

### KPI Card Component

```typescript
// KPICard.tsx
interface KPICardProps {
  title: string;
  value: number;
  icon: string;
  severity?: 'normal' | 'warning' | 'alert';
}

export function KPICard({ title, value, icon, severity = 'normal' }: KPICardProps) {
  const severityClass = severity === 'alert' ? 'border-danger' : severity === 'warning' ? 'border-warning' : '';
  
  return (
    <div className={`kpi-card ${severityClass}`}>
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p className="value">{value}</p>
    </div>
  );
}
```

### CSS

```css
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.kpi-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.kpi-card.border-danger {
  border-left-color: #dc3545;
}

.kpi-card.border-warning {
  border-left-color: #ffc107;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
```

### Backend Endpoint

```csharp
// DashboardController.cs
[HttpGet("stats")]
public async Task<IActionResult> GetDashboardStats(
    [FromQuery] string? sesion = null,
    [FromQuery] string? fecha = null)
{
    var stats = await _dashboardService.GetStatsAsync(sesion, fecha);
    return Ok(stats);
}
```

### Testing

- [ ] Dashboard carga sin errors
- [ ] KPIs mostrados sin scrollear
- [ ] Filtros funcionan correctamente
- [ ] Datos actualizan cada 10 segundos
- [ ] Gráficos renderean correctamente
- [ ] Botones de acción rápida funcionan
- [ ] Responsive en mobile
- [ ] Accesible con teclado

**Hallazgos resueltos:** H07, H08, H09
