import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useCallback, useEffect } from 'react'
import { PlanProvider } from './context/PlanContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TestPlans from './pages/TestPlans'
import Tasks from './pages/Tasks'
import ModeratorScript from './pages/ModeratorScript'
import Observations from './pages/Observations'
import Findings from './pages/Findings'
import ImprovementActions from './pages/ImprovementActions'
import Participants from './pages/Participants'
import TestSessions from './pages/TestSessions'
import SessionRunner from './pages/SessionRunner'
import Accessibility from './pages/Accessibility'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void
}

export const ToastContext = createContext<ToastContextType>({ addToast: () => { } })
export const useToast = () => useContext(ToastContext)

let toastId = 0

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [theme, setTheme] = useState<'hifi' | 'midfi' | 'lofi'>('hifi')

  useEffect(() => {
    document.body.classList.remove('theme-lofi', 'theme-midfi')
    if (theme === 'lofi') document.body.classList.add('theme-lofi')
    if (theme === 'midfi') document.body.classList.add('theme-midfi')
  }, [theme])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <PlanProvider>
      <ToastContext.Provider value={{ addToast }}>
        {/* ACCESIBILIDAD: Skip link para navegación por teclado (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>

        {/* ACCESIBILIDAD: role="alert" en toasts de error para anuncio inmediato (WCAG 4.1.3) */}
        <div className="toast-container" aria-live="polite">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`toast toast-${t.type}`}
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              <span aria-hidden="true">{t.type === 'success' ? '✓' : '✗'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="planes" element={<TestPlans />} />
            <Route path="tareas" element={<Tasks />} />
            <Route path="guion" element={<ModeratorScript />} />
            <Route path="observaciones" element={<Observations />} />
            <Route path="participantes" element={<Participants />} />
            <Route path="sesiones" element={<TestSessions />} />
            <Route path="sesiones/:sessionId/ejecutar" element={<SessionRunner />} />
            <Route path="hallazgos" element={<Findings />} />
            <Route path="mejoras" element={<ImprovementActions />} />
            <Route path="accesibilidad" element={<Accessibility />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastContext.Provider>

      {/* APE 4: Selector de Wireframes Flotante */}
      <div className="fixed bottom-4 right-4 z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 flex gap-1 animate-rise">
        <button 
          onClick={() => setTheme('lofi')} 
          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-colors ${theme === 'lofi' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Lo-Fi
        </button>
        <button 
          onClick={() => setTheme('midfi')} 
          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-colors ${theme === 'midfi' ? 'bg-slate-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Mid-Fi
        </button>
        <button 
          onClick={() => setTheme('hifi')} 
          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-colors ${theme === 'hifi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Hi-Fi
        </button>
      </div>

    </PlanProvider>
  )
}
