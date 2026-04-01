import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useCallback } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TestPlans from './pages/TestPlans'
import TestPlanForm from './pages/TestPlanForm'
import Tasks from './pages/Tasks'
import ModeratorScript from './pages/ModeratorScript'
import Observations from './pages/Observations'
import Findings from './pages/Findings'
import ImprovementActions from './pages/ImprovementActions'
import Participants from './pages/Participants'
import TestSessions from './pages/TestSessions'
import SessionRunner from './pages/SessionRunner'

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
    <ToastContext.Provider value={{ addToast }}>
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'success' ? '✓' : '✗'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="planes" element={<TestPlans />} />
          <Route path="planes/nuevo" element={<TestPlanForm />} />
          <Route path="planes/:id/editar" element={<TestPlanForm />} />
          <Route path="tareas" element={<Tasks />} />
          <Route path="guion" element={<ModeratorScript />} />
          <Route path="observaciones" element={<Observations />} />
          <Route path="participantes" element={<Participants />} />
          <Route path="sesiones" element={<TestSessions />} />
          <Route path="sesiones/:sessionId/ejecutar" element={<SessionRunner />} />
          <Route path="hallazgos" element={<Findings />} />
          <Route path="mejoras" element={<ImprovementActions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastContext.Provider>
  )
}
