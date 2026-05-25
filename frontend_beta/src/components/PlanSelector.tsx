import { useState } from 'react'
import Select from 'react-select'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlan } from '../context/PlanContext'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'


interface PlanOption {
  value: string
  label: string
  status: string
}

const statusLabels: Record<string, string> = {
  Draft: 'Borrador',
  InProgress: 'En Progreso',
  Completed: 'Completado',
  Cancelled: 'Cancelado',
}

const statusDots: Record<string, string> = {
  Draft: 'var(--neutral-400)',
  InProgress: 'var(--color-warning)',
  Completed: 'var(--color-success)',
  Cancelled: 'var(--color-error)',
}

function formatOption(option: PlanOption) {
  return (
    <div className="plan-option">
      {option.value !== '' && (
        <span
          className="plan-option-dot"
          style={{ background: statusDots[option.status] || 'var(--neutral-400)' }}
        />
      )}
      <span className="plan-option-label">{option.label}</span>
      {option.value !== '' && option.status && (
        <span className="plan-option-status">
          {statusLabels[option.status] || option.status}
        </span>
      )}
    </div>
  )
}

interface PlanSelectorProps {
  /**
   * If true, adds "Todas las Evaluaciones (Global)" as first option.
   * In this mode you MUST pass value + onChange to control the local filter —
   * selecting Global will NOT affect the global PlanContext.
   */
  showAll?: boolean
  /** Override controlled value — required when showAll=true */
  value?: string
  /** Override onChange — required when showAll=true */
  onChange?: (id: string) => void
  className?: string
}

/*
 * Estilos de react-select consumiendo tokens del Design System.
 * Se reemplazan todos los valores hardcodeados (#hex) por variables CSS
 * leídas desde getComputedStyle para mantener consistencia.
 */
const getTokenValue = (token: string): string => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: 'var(--radius-md)',
    borderColor: state.isFocused ? 'var(--color-primary-500)' : 'var(--border-color)',
    boxShadow: state.isFocused ? 'var(--shadow-focus)' : 'none',
    minHeight: 'var(--touch-target-min)',
    fontSize: 'var(--font-size-sm)',
    '&:hover': { borderColor: 'var(--color-primary-border)' },
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 12px 40px rgba(15,23,42,0.15)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: 'var(--font-size-sm)',
    padding: '10px 14px',
    backgroundColor: state.isSelected
      ? 'var(--color-primary-light)'
      : state.isFocused
        ? 'var(--neutral-50)'
        : 'var(--surface-card)',
    color: state.isSelected ? 'var(--color-primary)' : 'var(--neutral-700)',
    fontWeight: state.isSelected ? 600 : 400,
    cursor: 'pointer',
    '&:active': { backgroundColor: 'var(--color-primary-100)' },
  }),
  singleValue: (base: any) => ({
    ...base,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-primary)',
    fontWeight: 600,
  }),
  input: (base: any) => ({
    ...base,
    fontSize: 'var(--font-size-sm)',
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-disabled)',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
}

export default function PlanSelector({ showAll, value: valueProp, onChange: onChangeProp, className }: PlanSelectorProps) {
  const { plans, activePlanId, setActivePlanId, needsPlanSelection } = usePlan()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)

  // When showAll is used with external value/onChange, use those.
  // Otherwise fall back to the global context.
  const currentValue = valueProp !== undefined ? valueProp : activePlanId
  const handleChange = onChangeProp ?? setActivePlanId

  const options: PlanOption[] = [
    ...(showAll ? [{ value: '', label: 'Todas las Evaluaciones (Global)', status: '' }] : []),
    ...plans.map(p => ({ value: p.id, label: p.projectName, status: p.status })),
  ]

  // When needsPlanSelection is true (first visit), show nothing selected (null)
  // Once a plan is chosen, find normally without falling back to options[0]
  const selected = (needsPlanSelection && valueProp === undefined)
    ? null
    : options.find(o => o.value === currentValue) || null

  return (
    <div className={className} style={{ width: 300 }}>
      <Select<PlanOption>
        options={options}
        value={selected}
        onChange={(opt) => {
          if (opt !== null) {
            if (location.pathname.includes('/ejecutar')) {
              setPendingPlanId(opt.value)
            } else {
              handleChange(opt.value)
            }
          }
        }}
        formatOptionLabel={formatOption}
        placeholder={needsPlanSelection && valueProp === undefined ? '— Selecciona o crea un plan —' : 'Buscar plan...'}
        noOptionsMessage={() => 'No se encontraron planes'}
        isSearchable
        classNamePrefix="plan-select"
        menuPortalTarget={document.body}
        styles={selectStyles}
        aria-label="Seleccionar plan de prueba"
      />

      <Modal isOpen={!!pendingPlanId} onClose={() => setPendingPlanId(null)} title="Sesión en Curso" maxWidth="480px">
        <div className="plan-confirm-body">
          <div className="plan-confirm-alert">
            <AlertTriangle size={24} className="plan-confirm-alert-icon" aria-hidden="true" />
            <p className="plan-confirm-alert-text">
              Hay una sesión de prueba activa en ejecución.<br /><br />
              Si cambias de plan ahora, se cerrará la sesión actual y <strong style={{ fontWeight: 700, color: 'var(--color-error)' }}>perderás de forma permanente</strong> los resultados de esta sesión que aún no has registrado. <br /><br />¿Deseas salir de todas formas?
            </p>
          </div>
          <div className="plan-confirm-actions">
            <button onClick={() => setPendingPlanId(null)} className="btn btn-secondary">Cancelar</button>
            <button onClick={() => {
              if (pendingPlanId) {
                handleChange(pendingPlanId)
                navigate('/sesiones')
                setPendingPlanId(null)
              }
            }} className="btn btn-danger">Sí, salir y cambiar plan</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
