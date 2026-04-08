import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { testPlansApi, participantsApi, moderatorScriptsApi, testTasksApi, testSessionsApi, observationLogsApi } from '../api'

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
  refreshGates: () => Promise<void>
  loading: boolean
  canAccessPhase2: boolean
  canAccessPhase3: boolean
}

const PlanContext = createContext<PlanContextType>({
  plans: [],
  activePlanId: '',
  activePlan: null,
  setActivePlanId: () => {},
  isReadOnly: false,
  refreshPlans: async () => {},
  refreshGates: async () => {},
  loading: true,
  canAccessPhase2: false,
  canAccessPhase3: false,
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
  const [canAccessPhase2, setCanAccessPhase2] = useState(false)
  const [canAccessPhase3, setCanAccessPhase3] = useState(false)

  const refreshGates = useCallback(async () => {
    if (!activePlanId || activePlanId === UNSET) {
      setCanAccessPhase2(false)
      setCanAccessPhase3(false)
      return
    }
    try {
      const [participantsReq, scriptReq, tasksReq, sessionsReq, logsReq] = await Promise.all([
        participantsApi.getAll(),
        moderatorScriptsApi.getByPlan(activePlanId).catch(() => ({ data: null })),
        testTasksApi.getByPlan(activePlanId),
        testSessionsApi.getAll(activePlanId),
        observationLogsApi.getAll()
      ])

      const hasParticipants = (participantsReq.data?.length ?? 0) > 0
      const hasScript = !!scriptReq.data
      const hasTasks = (tasksReq.data?.length ?? 0) > 0

      const planSessions = sessionsReq.data ?? []
      const hasSessions = planSessions.length > 0

      const sessionIds = new Set(planSessions.map((s: any) => s.id))
      const allLogs = logsReq.data ?? []
      const planLogs = allLogs.filter((l: any) => sessionIds.has(l.testSessionId))
      const hasObservations = planLogs.length > 0

      const phase2 = hasParticipants && hasScript
      const phase3 = phase2 && hasTasks && hasSessions && hasObservations

      setCanAccessPhase2(phase2)
      setCanAccessPhase3(phase3)
    } catch {
      setCanAccessPhase2(false)
      setCanAccessPhase3(false)
    }
  }, [activePlanId])

  useEffect(() => {
    refreshGates()
  }, [activePlanId, refreshGates])

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
    refreshGates,
    loading,
    canAccessPhase2,
    canAccessPhase3
  }), [plans, activePlanId, activePlan, setActivePlanId, isReadOnly, refreshPlans, refreshGates, loading, canAccessPhase2, canAccessPhase3])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}
