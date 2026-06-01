import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useCallback } from 'react'
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
import SprintBacklog from './pages/SprintBacklog'

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

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <PlanProvider>
      <ToastContext.Provider value={{ addToast }}>
        {/* ACCESIBILIDAD: Skip link para navegación por teclado (WCAG 2.4.1)
            Clase CSS nativa .skip-link — visible solo al recibir foco */}
        <a href="#main-content" className="skip-link">
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
            <Route path="backlog" element={<SprintBacklog />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastContext.Provider>
    </PlanProvider>
  )
}
