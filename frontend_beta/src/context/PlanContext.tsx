import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { testPlansApi } from '../api'

interface Plan {
  id: string
  projectName: string
  status: string
  workflowState?: string
  [key: string]: any
}

interface PlanContextType {
  plans: Plan[]
  /** Always a specific plan ID — never empty string */
  activePlanId: string
  activePlan: Plan | null
  setActivePlanId: (id: string) => void
  isReadOnly: boolean
  refreshPlans: () => Promise<void>
  loading: boolean
}

const PlanContext = createContext<PlanContextType>({
  plans: [],
  activePlanId: '',
  activePlan: null,
  setActivePlanId: () => {},
  isReadOnly: false,
  refreshPlans: async () => {},
  loading: true,
})

export const usePlan = () => useContext(PlanContext)

const STORAGE_KEY = 'usability_active_plan_id'
const UNSET = '__UNSET__'

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [activePlanId, setActivePlanIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      // null → never stored → use UNSET so we auto-select first plan on load
      // Non-empty string → a real plan id → use it directly
      // Empty string → old broken state → treat as UNSET
      return stored && stored !== '__UNSET__' ? stored : UNSET
    } catch {
      return UNSET
    }
  })
  const [loading, setLoading] = useState(true)

  const setActivePlanId = useCallback((id: string) => {
    if (!id) return // Never store empty — context always holds a specific plan
    setActivePlanIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const refreshPlans = useCallback(async () => {
    try {
      const res = await testPlansApi.getAll()
      const fetched = res.data ?? []
      setPlans(fetched)
      return fetched
    } catch {
      setPlans([])
      return []
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    refreshPlans().then((fetched: any) => {
      const currentPlans = fetched as Plan[]

      if (activePlanId === UNSET) {
        // First time ever — auto-select first plan
        if (currentPlans.length > 0) setActivePlanId(currentPlans[0].id)
      } else if (!currentPlans.find((p: Plan) => p.id === activePlanId)) {
        // Stored plan no longer exists — pick the first one
        if (currentPlans.length > 0) setActivePlanId(currentPlans[0].id)
      }
      // Otherwise: stored plan still exists → keep it as-is

      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activePlan = useMemo(
    () => plans.find(p => p.id === activePlanId) ?? null,
    [plans, activePlanId]
  )

  const isReadOnly = useMemo(
    () => activePlan?.status === 'Completed' || activePlan?.status === 'Cancelled',
    [activePlan]
  )



  const value = useMemo(() => ({
    plans,
    activePlanId,
    activePlan,
    setActivePlanId,
    isReadOnly,
    refreshPlans,
    loading
  }), [plans, activePlanId, activePlan, setActivePlanId, isReadOnly, refreshPlans, loading])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}
