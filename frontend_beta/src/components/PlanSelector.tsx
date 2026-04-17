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
  Draft: '#94a3b8',
  InProgress: '#f59e0b',
  Completed: '#16a34a',
  Cancelled: '#ef4444',
}

function formatOption(option: PlanOption) {
  return (
    <div className="flex items-center gap-2">
      {option.value !== '' && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: statusDots[option.status] || '#94a3b8' }}
        />
      )}
      <span className="truncate">{option.label}</span>
      {option.value !== '' && option.status && (
        <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">
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
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: 10,
            borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
            minHeight: 42,
            fontSize: 14,
            '&:hover': { borderColor: '#93c5fd' },
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(15,23,42,0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 9999,
          }),
          option: (base, state) => ({
            ...base,
            fontSize: 13,
            padding: '10px 14px',
            backgroundColor: state.isSelected
              ? '#eef5ff'
              : state.isFocused
                ? '#f8fafc'
                : 'white',
            color: state.isSelected ? '#0f4fbf' : '#334155',
            fontWeight: state.isSelected ? 600 : 400,
            cursor: 'pointer',
            '&:active': { backgroundColor: '#dbeafe' },
          }),
          singleValue: (base) => ({
            ...base,
            fontSize: 14,
            color: '#0f172a',
            fontWeight: 600,
          }),
          input: (base) => ({
            ...base,
            fontSize: 14,
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: 14,
            color: '#94a3b8',
          }),
          indicatorSeparator: () => ({ display: 'none' }),
        }}
        aria-label="Seleccionar plan de prueba"
      />

      <Modal isOpen={!!pendingPlanId} onClose={() => setPendingPlanId(null)} title="Sesión en Curso" maxWidth="480px">
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[14px] text-amber-900 leading-relaxed font-medium">
              Hay una sesión de prueba activa en ejecución.<br /><br />
              Si cambias de plan ahora, se cerrará la sesión actual y <strong className="font-bold text-red-600">perderás de forma permanente</strong> los resultados de esta sesión que aún no has registrado. <br /><br />¿Deseas salir de todas formas?
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setPendingPlanId(null)} className="btn btn-secondary font-semibold">Cancelar</button>
            <button onClick={() => {
              if (pendingPlanId) {
                handleChange(pendingPlanId)
                navigate('/sesiones')
                setPendingPlanId(null)
              }
            }} className="btn btn-danger px-5 font-bold">Sí, salir y cambiar plan</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
