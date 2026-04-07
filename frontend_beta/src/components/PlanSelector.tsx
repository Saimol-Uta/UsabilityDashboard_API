import Select from 'react-select'
import { usePlan } from '../context/PlanContext'

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
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: statusDots[option.status] || '#94a3b8' }}
      />
      <span className="truncate">{option.label}</span>
      <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">
        {statusLabels[option.status] || option.status}
      </span>
    </div>
  )
}

interface PlanSelectorProps {
  /** Show "Todas las Evaluaciones" as first option */
  showAll?: boolean
  className?: string
}

export default function PlanSelector({ showAll, className }: PlanSelectorProps) {
  const { plans, activePlanId, setActivePlanId } = usePlan()

  const options: PlanOption[] = [
    ...(showAll ? [{ value: '', label: 'Todas las Evaluaciones (Global)', status: '' }] : []),
    ...plans.map(p => ({ value: p.id, label: p.projectName, status: p.status })),
  ]

  const selected = options.find(o => o.value === activePlanId) || options[0] || null

  return (
    <div className={className} style={{ minWidth: 220 }}>
      <Select<PlanOption>
        options={options}
        value={selected}
        onChange={(opt) => {
          if (opt) setActivePlanId(opt.value)
        }}
        formatOptionLabel={formatOption}
        placeholder="Buscar plan..."
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
    </div>
  )
}
