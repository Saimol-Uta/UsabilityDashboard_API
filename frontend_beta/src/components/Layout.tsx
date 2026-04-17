import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ListChecks, MessageSquareText,
  Eye, Search, Lightbulb, ChevronRight, FolderKanban, Sparkles, Users, CalendarRange,
  Menu, X, Lock, ShieldCheck
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import PlanSelector from './PlanSelector'

const dashboardItem = { to: '/', icon: LayoutDashboard, label: 'Dashboard', detail: 'Progreso y métricas' }
const planItem = { to: '/planes', icon: FileText, label: 'Plan de Prueba', detail: 'Gestión de planes de test', sectionKey: 'plan_de_prueba' }

const phases = [
  {
    title: 'Fase 1 — Preparación',
    items: [
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
      { to: '/accesibilidad', icon: ShieldCheck, label: 'Accesibilidad', detail: 'Auditorías WAVE, Stark, Lighthouse', sectionKey: 'accesibilidad' },
    ]
  }
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { activePlan, canAccessPhase2, canAccessPhase3, phase2Missing, phase3Missing, sectionDone, needsPlanSelection, loading } = usePlan()

  // Redirect first-time users to /planes so they can create or pick a plan
  useEffect(() => {
    if (!loading && needsPlanSelection && location.pathname !== '/planes') {
      navigate('/planes', { replace: true })
    }
  }, [loading, needsPlanSelection, location.pathname, navigate])

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
                  {activePlan ? `Plan: ${activePlan.projectName}` : 'Selecciona o crea un plan de prueba...'}
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

                  {/* Plan de Prueba — standalone, below dashboard */}
              <div>
                <NavLink
                  to={planItem.to}
                  className={({ isActive }) => {
                    const done = sectionDone[planItem.sectionKey]
                    if (isActive) return 'nav-item group relative is-active border-l-2 border-blue-500 bg-blue-50/50'
                    if (done) return 'nav-item group relative border-l-2 border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50'
                    return 'nav-item group relative pl-[14px] border-l-2 border-transparent'
                  }}
                >
                  {sectionDone[planItem.sectionKey] ? (
                    /* ACCESIBILIDAD: SVG con role="img" y title (WCAG 1.1.1) */
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" role="img" aria-label="Sección completada">
                      <title>Sección completada</title>
                      <circle cx="8" cy="8" r="7" fill="#10b981" opacity="0.15"/>
                      <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.2"/>
                      <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <planItem.icon size={16} aria-hidden="true" className="flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] font-medium transition-colors ${sectionDone[planItem.sectionKey] ? 'text-emerald-800' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {planItem.label}
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${sectionDone[planItem.sectionKey] ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {planItem.detail}
                    </div>
                  </div>
                </NavLink>
              </div>

              {/* Phased Navigation */}
              {phases.map((phase, idx) => {
                const isPhase1 = idx === 0
                const isPhase2 = idx === 1
                const isPhase3 = idx === 2
                // "Complete" means all sections inside the phase have records
                const phaseComplete = isPhase1
                  ? sectionDone.guion && sectionDone.participantes
                  : isPhase2
                    ? sectionDone.tareas && sectionDone.sesiones && sectionDone.observaciones
                    : sectionDone.hallazgos && sectionDone.mejoras
                const phaseLocked = (isPhase2 && !canAccessPhase2) || (isPhase3 && !canAccessPhase3)

                return (
                <div key={idx} className="space-y-1.5">
                  {/* Phase header */}
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    phaseComplete ? 'bg-emerald-50 border border-emerald-200' :
                    phaseLocked ? 'bg-slate-50 border border-slate-200' :
                    'border border-transparent'
                  }`}>
                    {/* ACCESIBILIDAD: SVG de estado de fase con title descriptivo (WCAG 1.1.1) */}
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      phaseComplete ? 'bg-emerald-500' : phaseLocked ? 'bg-slate-300' : 'bg-blue-400'
                    }`} aria-hidden="true">
                      {phaseComplete ? (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : phaseLocked ? (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><rect x="3" y="1.5" width="4" height="3" rx="1" stroke="white" strokeWidth="1.2"/><rect x="1.5" y="4" width="7" height="5" rx="1" stroke="white" strokeWidth="1.2"/></svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.12em] font-bold flex-1 ${
                      phaseComplete ? 'text-emerald-700' : phaseLocked ? 'text-slate-400' : 'text-blue-600'
                    }`}>
                      {phase.title}
                      {/* ACCESIBILIDAD: estado de fase anunciado a lectores de pantalla */}
                      <span className="sr-only">
                        {phaseComplete ? ' — Completada' : phaseLocked ? ' — Bloqueada' : ' — En progreso'}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {phase.items.map(item => {
                      const itemLocked = (isPhase2 && !canAccessPhase2) || (isPhase3 && !canAccessPhase3);

                      if (itemLocked) {
                        const missingList = isPhase2 ? phase2Missing : phase3Missing
                        const tooltipText = missingList.length > 0
                          ? `Falta: ${missingList.join(', ')}`
                          : isPhase2 ? 'Requiere Participantes y Guión del Moderador' : 'Requiere datos de Fase 2'
                        const sublabel = missingList.length > 0
                          ? `Falta: ${missingList.join(' • ')}`
                          : isPhase2 ? 'Requiere requisitos previos' : 'Requiere datos de Fase 2'
                        return (
                          <div key={item.to} className="nav-item pl-[14px] opacity-60 cursor-not-allowed" title={tooltipText}>
                            <Lock size={16} aria-hidden="true" className="flex-shrink-0 text-slate-400" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-slate-500">{item.label}</div>
                              <div className="text-[10px] text-amber-600 mt-0.5 truncate font-medium">{sublabel}</div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) => {
                            const done = sectionDone[item.sectionKey]
                            if (isActive) return 'nav-item group relative is-active border-l-2 border-blue-500 bg-blue-50/50'
                            if (done) return 'nav-item group relative border-l-2 border-emerald-400 bg-emerald-50/60 hover:bg-emerald-50'
                            return 'nav-item group relative pl-[14px] border-l-2 border-transparent'
                          }}
                        >
                          {sectionDone[item.sectionKey] ? (
                            /* ACCESIBILIDAD: SVG de sección completada con texto alternativo (WCAG 1.1.1) */
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" role="img" aria-label="Completado">
                              <title>Completado</title>
                              <circle cx="8" cy="8" r="7" fill="#10b981" opacity="0.15"/>
                              <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.2"/>
                              <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <item.icon size={16} aria-hidden="true" className="flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] font-medium transition-colors ${
                              sectionDone[item.sectionKey] ? 'text-emerald-800 group-hover:text-emerald-900' : 'text-slate-600 group-hover:text-slate-800'
                            }`}>{item.label}</div>
                            {/* ACCESIBILIDAD: contraste mejorado de text-slate-400 a text-slate-500 (ratio 4.6:1, WCAG 1.4.3) */}
                            <div className={`text-[11px] mt-0.5 truncate ${
                              sectionDone[item.sectionKey] ? 'text-emerald-600' : 'text-slate-500'
                            }`}>{item.detail}</div>
                          </div>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              )})}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        {/* ACCESIBILIDAD: id="main-content" como destino del skip link (WCAG 2.4.1) */}
        <main id="main-content" className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden relative z-0" role="main">
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
