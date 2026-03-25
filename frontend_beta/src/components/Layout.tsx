import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ListChecks, MessageSquareText,
  Eye, Search, Lightbulb, ChevronRight, FolderKanban, ShieldCheck, Sparkles, Users, CalendarRange,
  Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', detail: 'Métricas y resumen general' },
  { to: '/planes', icon: FileText, label: 'Plan de Prueba', detail: 'Gestión de planes de test' },
  { to: '/tareas', icon: ListChecks, label: 'Gestión de Tareas', detail: 'Escenarios y criterios' },
  { to: '/guion', icon: MessageSquareText, label: 'Guión del Moderador', detail: 'Instrucciones del moderador' },
  { to: '/participantes', icon: Users, label: 'Participantes', detail: 'Directorio de usuarios' },
  { to: '/sesiones', icon: CalendarRange, label: 'Sesiones de Prueba', detail: 'Agenda de trabajo de campo' },
  { to: '/observaciones', icon: Eye, label: 'Observaciones', detail: 'Registro de resultados' },
  { to: '/hallazgos', icon: Search, label: 'Hallazgos', detail: 'Síntesis de problemas' },
  { to: '/mejoras', icon: Lightbulb, label: 'Acciones de Mejora', detail: 'Plan de mejoras' },
]

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const activeItem = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )

  const breadcrumb = activeItem ? activeItem.label : 'Dashboard'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mx-2 sm:mx-3 mt-2 sm:mt-3 glass-panel overflow-hidden" role="banner">
        <div className="px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 border-b border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center flex-shrink-0 text-white hover:bg-white/20 transition-colors"
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/25 backdrop-blur flex items-center justify-center flex-shrink-0">
                <FolderKanban size={16} className="text-white sm:hidden" aria-hidden="true" />
                <FolderKanban size={18} className="text-white hidden sm:block" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-white text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-tight tracking-tight truncate">
                  Usability Test Plan Dashboard
                </h1>
                <p className="text-blue-100/85 text-[11px] sm:text-[12px] mt-0.5 hidden sm:block">
                  IHC · Evaluación con WAVE + Lighthouse + Stark
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-2 text-[11px] flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/25 text-blue-50 bg-white/10">
                <Sparkles size={12} aria-hidden="true" />
                <span className="hidden md:inline">Dashboard de Usabilidad</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/25 text-blue-50 bg-white/10">
                <ShieldCheck size={12} aria-hidden="true" />
                WCAG 2.1 AA
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-2 sm:p-3 pt-2 sm:pt-3 pb-4 sm:pb-5 flex flex-col lg:flex-row gap-2 sm:gap-3 min-h-[calc(100vh-100px)]">
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
            fixed top-0 left-0 z-50 h-full w-[280px] glass-panel p-4 flex flex-col gap-4 overflow-auto soft-scrollbar
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:static lg:translate-x-0 lg:w-[260px] lg:flex-shrink-0 lg:h-auto lg:z-auto
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
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-3">
              Navegación
            </div>
            <nav className="space-y-1.5" aria-label="Menú principal">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                  aria-current={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)) ? 'page' : undefined}
                >
                  <item.icon size={16} aria-hidden="true" className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold leading-tight">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.detail}</div>
                  </div>
                  {(location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))) && (
                    <ChevronRight size={14} className="text-blue-500 flex-shrink-0" aria-hidden="true" />
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="min-w-0 mt-auto">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-2">Stack de evaluación</div>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" /> WAVE Accessibility</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400" aria-hidden="true" /> Stark Contrast</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" /> Lighthouse Audit</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-500" aria-hidden="true" /> WCAG 2.1 Nivel AA</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden" role="main">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <span className="text-slate-400">Dashboard</span>
              <ChevronRight size={12} aria-hidden="true" />
              <span className="font-semibold text-slate-700">{breadcrumb}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto soft-scrollbar p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
