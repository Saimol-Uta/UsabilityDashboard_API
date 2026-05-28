import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, FileText, ListChecks, MessageSquareText,
    Eye, Search, Lightbulb, ChevronRight, FolderKanban, Sparkles, Users, CalendarRange,
    Menu, X, Lock, ShieldCheck, ClipboardList
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
            { to: '/backlog', icon: ClipboardList, label: 'Sprint Backlog', detail: 'Backlog de desarrollo ágil', sectionKey: 'backlog' },
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

    // Close sidebar on resize to desktop (768px breakpoint)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 769) {
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

    // Determine active label for breadcrumb
    let activeLabel = 'Dashboard'
    let activePhaseTitle = ''
    if (location.pathname !== '/') {
        for (const phase of phases) {
            for (const item of phase.items) {
                if (location.pathname.startsWith(item.to)) {
                    activeLabel = item.label
                    activePhaseTitle = phase.title
                }
            }
        }
        if (location.pathname.startsWith('/planes')) {
            activeLabel = planItem.label
        }
    }

    return (
        <div className="layout-shell">
            {/* ── Header ── */}
            <header className="layout-header glass-panel" role="banner">
                <div className="layout-header-bar">
                    <div className="layout-header-inner">
                        <div className="layout-header-left">
                            {/* Hamburger — 44px touch target (Ley de Fitts / WCAG 2.5.8) */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="layout-hamburger"
                                aria-label={sidebarOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                                aria-expanded={sidebarOpen}
                                aria-controls="sidebar-nav"
                            >
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>

                            <div className="layout-logo">
                                <FolderKanban size={20} aria-hidden="true" />
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <p className="layout-context-label">Contexto Activo</p>
                                <h1 className="layout-context-title">
                                    {activePlan ? `Plan: ${activePlan.projectName}` : 'Selecciona o crea un plan de prueba...'}
                                </h1>
                            </div>
                        </div>

                        <div className="layout-header-right">
                            <div className="layout-app-badge">
                                <span className="layout-app-badge-pill">
                                    <Sparkles size={12} aria-hidden="true" />
                                    Dashboard de Usabilidad
                                </span>
                            </div>
                            <div className="layout-plan-selector">
                                <PlanSelector />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="layout-body">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="layout-overlay"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* ── Sidebar ── */}
                <aside
                    id="sidebar-nav"
                    className={`layout-sidebar glass-panel soft-scrollbar ${sidebarOpen ? 'is-open' : ''}`}
                    role="navigation"
                    aria-label="Navegación principal"
                >
                    {/* Mobile close header */}
                    <div className="layout-sidebar-mobile-header">
                        <span className="layout-sidebar-mobile-title">Menú</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="layout-sidebar-close"
                            aria-label="Cerrar menú de navegación"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="layout-nav">
                        <nav className="layout-nav-sections" aria-label="Menú principal">
                            {/* Dashboard Global */}
                            <div>
                                <NavLink
                                    to={dashboardItem.to}
                                    end={true}
                                    aria-current={location.pathname === '/' ? 'page' : undefined}
                                    className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                                >
                                    <dashboardItem.icon size={18} aria-hidden="true" className="nav-icon" />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div className="nav-item-label">{dashboardItem.label}</div>
                                    </div>
                                </NavLink>
                            </div>

                            {/* Plan de Prueba — standalone */}
                            <div>
                                <NavLink
                                    to={planItem.to}
                                    aria-current={location.pathname.startsWith('/planes') ? 'page' : undefined}
                                    className={({ isActive }) => {
                                        const done = sectionDone[planItem.sectionKey]
                                        const base = 'nav-item'
                                        if (isActive) return `${base} is-active nav-item--active-phase`
                                        if (done) return `${base} nav-item--done`
                                        return `${base} nav-item--default`
                                    }}
                                >
                                    {sectionDone[planItem.sectionKey] ? (
                                        /* ACCESIBILIDAD: SVG con role="img" y title (WCAG 1.1.1) */
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="nav-check-icon" role="img" aria-label="Sección completada">
                                            <title>Sección completada</title>
                                            <circle cx="8" cy="8" r="7" fill="#10b981" opacity="0.15" />
                                            <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.2" />
                                            <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <planItem.icon size={16} aria-hidden="true" className="nav-icon" />
                                    )}
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div className={`nav-item-label ${sectionDone[planItem.sectionKey] ? 'nav-item-label--done' : ''}`}>
                                            {planItem.label}
                                        </div>
                                        <div className={`nav-item-detail ${sectionDone[planItem.sectionKey] ? 'nav-item-detail--done' : 'nav-item-detail--muted'}`}>
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
                                const phaseComplete = isPhase1
                                    ? sectionDone.guion && sectionDone.participantes
                                    : isPhase2
                                        ? sectionDone.tareas && sectionDone.sesiones && sectionDone.observaciones
                                        : sectionDone.hallazgos && sectionDone.mejoras
                                const phaseLocked = (isPhase2 && !canAccessPhase2) || (isPhase3 && !canAccessPhase3)

                                const phaseState = phaseComplete ? 'is-complete' : phaseLocked ? 'is-locked' : 'is-active'

                                return (
                                    <div key={idx} className="layout-nav-phase">
                                        {/* Phase header */}
                                        <div className={`phase-header ${phaseComplete ? 'is-complete' : phaseLocked ? 'is-locked' : ''}`}>
                                            <div className={`phase-indicator ${phaseState}`} aria-hidden="true">
                                                {phaseComplete ? (
                                                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                ) : phaseLocked ? (
                                                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><rect x="3" y="1.5" width="4" height="3" rx="1" stroke="white" strokeWidth="1.2" /><rect x="1.5" y="4" width="7" height="5" rx="1" stroke="white" strokeWidth="1.2" /></svg>
                                                ) : (
                                                    <div className="phase-indicator-dot" />
                                                )}
                                            </div>
                                            <span className={`phase-title ${phaseState}`}>
                                                {phase.title}
                                                {/* ACCESIBILIDAD: estado de fase anunciado a lectores de pantalla */}
                                                <span className="sr-only">
                                                    {phaseComplete ? ' — Completada' : phaseLocked ? ' — Bloqueada' : ' — En progreso'}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="layout-nav-phase-items">
                                            {phase.items.map(item => {
                                                const itemLocked = (isPhase2 && !canAccessPhase2) || (isPhase3 && !canAccessPhase3)

                                                if (itemLocked) {
                                                    const missingList = isPhase2 ? phase2Missing : phase3Missing
                                                    const tooltipText = missingList.length > 0
                                                        ? `Falta: ${missingList.join(', ')}`
                                                        : isPhase2 ? 'Requiere Participantes y Guión del Moderador' : 'Requiere datos de Fase 2'
                                                    const sublabel = missingList.length > 0
                                                        ? `Falta: ${missingList.join(' • ')}`
                                                        : isPhase2 ? 'Requiere requisitos previos' : 'Requiere datos de Fase 2'
                                                    return (
                                                        <div
                                                            key={item.to}
                                                            className="nav-item is-disabled nav-item--default"
                                                            aria-disabled="true"
                                                            title={tooltipText}
                                                        >
                                                            <Lock size={16} aria-hidden="true" className="nav-icon" />
                                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                                <div className="nav-item-label" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                                                                <div className="nav-item-sublabel">{sublabel}</div>
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                                return (
                                                    <NavLink
                                                        key={item.to}
                                                        to={item.to}
                                                        aria-current={location.pathname.startsWith(item.to) ? 'page' : undefined}
                                                        className={({ isActive }) => {
                                                            const done = sectionDone[item.sectionKey]
                                                            const base = 'nav-item'
                                                            if (isActive) return `${base} is-active nav-item--active-phase`
                                                            if (done) return `${base} nav-item--done`
                                                            return `${base} nav-item--default`
                                                        }}
                                                    >
                                                        {sectionDone[item.sectionKey] ? (
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="nav-check-icon" role="img" aria-label="Completado">
                                                                <title>Completado</title>
                                                                <circle cx="8" cy="8" r="7" fill="#10b981" opacity="0.15" />
                                                                <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.2" />
                                                                <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        ) : (
                                                            <item.icon size={16} aria-hidden="true" className="nav-icon" />
                                                        )}
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div className={`nav-item-label ${sectionDone[item.sectionKey] ? 'nav-item-label--done' : ''}`}>
                                                                {item.label}
                                                            </div>
                                                            <div className={`nav-item-detail ${sectionDone[item.sectionKey] ? 'nav-item-detail--done' : 'nav-item-detail--muted'}`}>
                                                                {item.detail}
                                                            </div>
                                                        </div>
                                                    </NavLink>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </nav>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                {/* ACCESIBILIDAD: id="main-content" como destino del skip link (WCAG 2.4.1) */}
                <main id="main-content" className="layout-main glass-panel">
                    <div className="layout-breadcrumb-bar">
                        {/* ACCESIBILIDAD: Breadcrumb semántico con <ol> (WCAG 1.3.1) */}
                        <nav aria-label="Ruta de navegación">
                            <ol className="breadcrumb">
                                {location.pathname === '/' ? (
                                    <li>
                                        <span className="breadcrumb-current" aria-current="page">Dashboard</span>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <NavLink to="/" className="breadcrumb-link">Inicio</NavLink>
                                        </li>
                                        {activePhaseTitle && (
                                            <>
                                                <li aria-hidden="true"><ChevronRight size={12} className="breadcrumb-separator" /></li>
                                                <li><span className="breadcrumb-phase">{activePhaseTitle}</span></li>
                                            </>
                                        )}
                                        <li aria-hidden="true"><ChevronRight size={12} className="breadcrumb-separator" /></li>
                                        <li>
                                            <span className="breadcrumb-current" aria-current="page">{activeLabel}</span>
                                        </li>
                                    </>
                                )}
                            </ol>
                        </nav>
                    </div>
                    <div className="layout-content soft-scrollbar">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}