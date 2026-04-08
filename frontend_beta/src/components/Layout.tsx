import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ListChecks, MessageSquareText,
  Eye, Search, Lightbulb, ChevronRight, FolderKanban, Sparkles, Users, CalendarRange,
  Menu, X
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import PlanSelector from './PlanSelector'

const dashboardItem = { to: '/', icon: LayoutDashboard, label: 'Dashboard', detail: 'Progreso y métricas' }

const phases = [
  {
    title: 'Fase 1 — Preparación',
    items: [
      { to: '/planes', icon: FileText, label: 'Plan de Prueba', detail: 'Gestión de planes de test', sectionKey: 'plan_de_prueba' },
      { to: '/guion', icon: MessageSquareText, label: 'Guión del Moderador', detail: 'Instrucciones del moderador', sectionKey: 'guion' },
      { to: '/participantes', icon: Users, label: 'Participantes', detail: 'Directorio de usuarios', sectionKey: 'participantes' },
    ]
  },
  {
    title: 'Fase 2 — Ejecución',
    items: [
      { to: '/tareas', icon: ListChecks, label: 'Gestión de Tareas', detail: 'Escenarios y criterios', sectionKey: 'tareas' },
      { to: '/sesiones', icon: CalendarRange, label: 'Sesiones de Prueba', detail: 'Agenda de trabajo de campo', sectionKey: 'sesiones' },
      { to: '/observaciones', icon: Eye, label: 'Observaciones', detail: 'Registro de resultados', sectionKey: 'observaciones' },
    ]
  },
  {
    title: 'Fase 3 — Análisis y Cierre',
    items: [
      { to: '/hallazgos', icon: Search, label: 'Hallazgos', detail: 'Síntesis de problemas', sectionKey: 'hallazgos' },
      { to: '/mejoras', icon: Lightbulb, label: 'Acciones de Mejora', detail: 'Plan de mejoras', sectionKey: 'mejoras' },
    ]
  }
]

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { activePlan } = usePlan()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  let activeLabel = 'Dashboard'
  if (location.pathname === '/') {
    activeLabel = 'Dashboard'
  } else {
    for (const phase of phases) {
      for (const item of phase.items) {
        if (location.pathname.startsWith(item.to)) {
          activeLabel = item.label
        }
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-2 sm:mx-3 mt-2 sm:mt-3 glass-panel overflow-visible relative z-50" role="banner">
        <div className="px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-3 border-b border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center flex-shrink-0 text-white hover:bg-white/20 transition-colors"
                aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 border border-white/20 shadow-inner flex items-center justify-center flex-shrink-0">
                <FolderKanban size={18} className="text-white drop-shadow-md" aria-hidden="true" />
              </div>
              
              <div className="min-w-0">
                <p className="text-blue-200 text-[10px] sm:text-[11px] uppercase tracking-wider font-medium mb-0.5">
                  Contexto Activo
                </p>
                <h1 className="text-white text-[15px] sm:text-[18px] font-semibold leading-tight tracking-tight truncate flex items-center gap-2">
                  {activePlan ? `Plan: ${activePlan.projectName}` : 'Seleccione un plan de prueba...'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 text-[11px] flex-shrink-0 mr-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/25 text-blue-50 bg-white/10">
                  <Sparkles size={12} aria-hidden="true" />
                  Dashboard de Usabilidad
                </span>
              </div>
              <div className="w-[300px] flex-shrink-0 relative z-[60]">
                <PlanSelector />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-2 sm:p-3 pt-2 sm:pt-3 pb-4 sm:pb-5 flex flex-col lg:flex-row gap-2 sm:gap-3 min-h-[calc(100vh-100px)] relative z-0">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-[290px] glass-panel p-4 flex flex-col gap-4 overflow-auto soft-scrollbar
            transform transition-transform duration-300 ease-in-out border-r border-slate-200/50
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:static lg:translate-x-0 lg:w-[270px] lg:flex-shrink-0 lg:h-auto lg:z-auto
          `}
          role="navigation"
          aria-label="Navegación principal"
        >
          {/* Mobile close button inside sidebar */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-[14px] font-semibold text-slate-800">Menú</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={16} />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <nav className="space-y-6" aria-label="Menú principal">
              {/* Dashboard Global */}
              <div>
                <NavLink
                  to={dashboardItem.to}
                  end={true}
                  className={({ isActive }) => `nav-item ${isActive ? 'is-active bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <dashboardItem.icon size={18} aria-hidden="true" className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px]">{dashboardItem.label}</div>
                  </div>
                </NavLink>
              </div>

              {/* Phased Navigation */}
              {phases.map((phase, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-bold px-2 py-1 flex items-center gap-2">
                    <div className="w-4 border-t border-slate-200" />
                    <span>{phase.title}</span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>
                  <div className="space-y-1">
                    {phase.items.map(item => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) => `nav-item group relative ${isActive ? 'is-active border-l-2 border-blue-500 bg-blue-50/50' : 'pl-[14px] border-l-2 border-transparent'}`}
                        >
                          <item.icon size={16} aria-hidden="true" className="flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{item.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.detail}</div>
                          </div>
                        </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden relative z-0" role="main">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <span className="text-slate-400">Dashboard</span>
              <ChevronRight size={12} aria-hidden="true" />
              <span className="font-semibold text-slate-700">{activeLabel}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto soft-scrollbar p-3 sm:p-4 md:p-6 bg-slate-50/30">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
