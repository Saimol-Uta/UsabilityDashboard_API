# Guía de Implementación - Navigation Component

## Componente: Navigation.tsx

### Requisitos
- ✅ Máximo 5 items principales
- ✅ Submenús contextuales
- ✅ Breadcrumbs en todas las páginas
- ✅ Búsqueda global
- ✅ Indicador de página activa

### Estructura

```typescript
// Navigation.tsx
const navigationItems = [
  {
    id: 'tests-sessions',
    icon: '📋',
    label: 'Tests y Sesiones',
    submenu: [
      { label: 'Mis Tests', path: '/tests' },
      { label: 'Sesiones Activas', path: '/sessions/active' },
      { label: 'Histórico', path: '/sessions/history' },
      { action: 'create-test', label: '+ Crear Test' }
    ]
  },
  {
    id: 'findings',
    icon: '🔍',
    label: 'Hallazgos',
    submenu: [
      { label: 'Todos', path: '/findings' },
      { label: 'Por Severidad', path: '/findings/by-severity' },
      { action: 'quick-finding', label: '+ Registrar Rápido' }
    ]
  },
  {
    id: 'participants',
    icon: '👥',
    label: 'Participantes',
    submenu: [
      { label: 'Listado', path: '/participants' },
      { action: 'add-participant', label: '+ Agregar' }
    ]
  },
  {
    id: 'analysis',
    icon: '📊',
    label: 'Análisis',
    submenu: [
      { label: 'Reportes', path: '/reports' },
      { label: 'Exportar', path: '/export' }
    ]
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Configuración',
    submenu: [
      { label: 'Usuarios', path: '/admin/users' },
      { label: 'Ajustes', path: '/settings' }
    ]
  }
];

export function Navigation({ currentPath }: { currentPath: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="main-navigation">
      <div className="nav-header">
        <h1>Dashboard</h1>
        <button 
          className="search-trigger" 
          onClick={() => setSearchOpen(!searchOpen)}
        >
          🔍
        </button>
      </div>

      {/* Search */}
      {searchOpen && (
        <div className="global-search">
          <input 
            type="text" 
            placeholder="Buscar tests, sesiones, hallazgos..."
            autoFocus
          />
        </div>
      )}

      {/* Main Navigation */}
      <div className="nav-items">
        {navigationItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            isExpanded={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
            currentPath={currentPath}
          />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ item, isExpanded, onToggle, currentPath }: any) {
  return (
    <div className="nav-item">
      <button
        className={`nav-link ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
      >
        <span className="icon">{item.icon}</span>
        <span className="label">{item.label}</span>
      </button>

      {isExpanded && (
        <div className="submenu">
          {item.submenu.map((subitem: any) => (
            <a
              key={subitem.path || subitem.action}
              href={subitem.path}
              className={`submenu-link ${currentPath === subitem.path ? 'active' : ''}`}
            >
              {subitem.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Breadcrumb Component

```typescript
// Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="separator">/</span>}
          {item.path ? (
            <a href={item.path} className="breadcrumb-link">
              {item.label}
            </a>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### CSS

```css
.main-navigation {
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 1rem;
  min-height: 100vh;
  max-width: 280px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-trigger {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.global-search {
  margin-bottom: 1.5rem;
}

.global-search input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e9ecef;
}

.nav-link.expanded {
  background-color: #e9ecef;
}

.submenu {
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.submenu-link {
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  color: #495057;
  border-radius: 4px;
  display: block;
  transition: background-color 0.2s;
}

.submenu-link:hover {
  background-color: #e9ecef;
}

.submenu-link.active {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}

/* Breadcrumb */
.breadcrumb {
  padding: 0.75rem 0;
  font-size: 0.875rem;
}

.separator {
  margin: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #6c757d;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .main-navigation {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s;
  }

  .main-navigation.open {
    left: 0;
  }
}
```

### Testing

- [ ] Menu collapsa/expande correctamente
- [ ] Búsqueda global funciona
- [ ] Breadcrumbs muestran página actual
- [ ] Indicador activo en página actual
- [ ] Responsive en mobile (drawer)
- [ ] Navegación por teclado funciona

**Hallazgos resueltos:** H25, H26, H27
