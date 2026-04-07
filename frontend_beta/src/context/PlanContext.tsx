import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { testPlansApi } from '../api'

interface Plan {
  id: string
  projectName: string
  status: string
  [key: string]: any
}

interface PlanContextType {
  plans: Plan[]
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

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [activePlanId, setActivePlanIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })
  const [loading, setLoading] = useState(true)

  const setActivePlanId = useCallback((id: string) => {
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
      // If stored plan no longer exists, pick the first one
      if (activePlanId && !currentPlans.find((p: Plan) => p.id === activePlanId)) {
        setActivePlanId(currentPlans[0]?.id ?? '')
      } else if (!activePlanId && currentPlans.length > 0) {
        setActivePlanId(currentPlans[0].id)
      }
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
    loading,
  }), [plans, activePlanId, activePlan, setActivePlanId, isReadOnly, refreshPlans, loading])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}
