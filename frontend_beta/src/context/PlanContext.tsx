import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { testPlansApi, participantsApi, moderatorScriptsApi, testTasksApi, testSessionsApi, observationLogsApi, findingsApi, improvementActionsApi } from '../api'

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
  phase2Missing: string[]
  phase3Missing: string[]
  /** Map of sectionKey → true if that section has at least 1 record for the active plan */
  sectionDone: Record<string, boolean>
  /** True when the user has never selected a plan (first visit) — redirect to /planes */
  needsPlanSelection: boolean
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
  phase2Missing: [],
  phase3Missing: [],
  sectionDone: {},
  needsPlanSelection: false,
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
  const [needsPlanSelection, setNeedsPlanSelection] = useState(false)
  const [canAccessPhase2, setCanAccessPhase2] = useState(false)
  const [canAccessPhase3, setCanAccessPhase3] = useState(false)
  const [phase2Missing, setPhase2Missing] = useState<string[]>([])
  const [phase3Missing, setPhase3Missing] = useState<string[]>([])
  const [sectionDone, setSectionDone] = useState<Record<string, boolean>>({})

  const refreshGates = useCallback(async () => {
    if (!activePlanId || activePlanId === UNSET) {
      setCanAccessPhase2(false)
      setCanAccessPhase3(false)
      return
    }
    try {
      const [participantsReq, scriptReq, tasksReq, sessionsReq, logsReq, findingsReq] = await Promise.all([
        participantsApi.getAll(),
        moderatorScriptsApi.getByPlan(activePlanId).catch(() => ({ data: null })),
        testTasksApi.getByPlan(activePlanId),
        testSessionsApi.getAll(activePlanId),
        observationLogsApi.getAll(),
        findingsApi.getByPlan(activePlanId).catch(() => ({ data: [] }))
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

      const missing2: string[] = []
      if (!hasParticipants) missing2.push('Participantes')
      if (!hasScript) missing2.push('Guión del Moderador')

      const missing3: string[] = []
      if (!hasTasks) missing3.push('Tareas')
      if (!hasSessions) missing3.push('Sesiones programadas')
      if (!hasObservations) missing3.push('Observaciones registradas')

      setCanAccessPhase2(phase2)
      setCanAccessPhase3(phase3)
      setPhase2Missing(missing2)
      setPhase3Missing(phase2 ? missing3 : [])
      const hasFindings = (findingsReq.data?.length ?? 0) > 0

      // Check if any improvement actions exist for this plan's findings
      let hasActions = false
      if (hasFindings) {
        const planFindings: any[] = findingsReq.data ?? []
        const actionsResults = await Promise.all(
          planFindings.map(f => improvementActionsApi.getByFinding(f.id).catch(() => ({ data: [] })))
        )
        hasActions = actionsResults.some(r => (r.data?.length ?? 0) > 0)
      }

      // Check if there are accessibility-specific findings (WAVE, Lighthouse, Stark)
      const accessibilityTools = ['WAVE', 'Lighthouse', 'Stark', 'Observación manual']
      const allFindings: any[] = findingsReq.data ?? []
      const hasAccessibility = allFindings.some(f => accessibilityTools.includes(f.tool))

      setSectionDone({
        guion: hasScript,
        participantes: hasParticipants,
        tareas: hasTasks,
        sesiones: hasSessions,
        observaciones: hasObservations,
        hallazgos: hasFindings,
        mejoras: hasActions,
        accesibilidad: hasAccessibility,
      })
    } catch {
      setCanAccessPhase2(false)
      setCanAccessPhase3(false)
      setPhase2Missing([])
      setPhase3Missing([])
      setSectionDone({})
    }
  }, [activePlanId])

  useEffect(() => {
    refreshGates()
  }, [activePlanId, refreshGates])

  const setActivePlanId = useCallback((id: string) => {
    if (!id) return // Never store empty — context always holds a specific plan
    setActivePlanIdState(id)
    setNeedsPlanSelection(false) // User has now chosen a plan
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
        // First time ever — no plan stored → send to /planes to choose
        setNeedsPlanSelection(true)
      } else if (!currentPlans.find((p: Plan) => p.id === activePlanId)) {
        // Stored plan no longer exists — pick the first one silently
        if (currentPlans.length > 0) setActivePlanId(currentPlans[0].id)
        else setNeedsPlanSelection(true)
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
    canAccessPhase3,
    phase2Missing,
    phase3Missing,
    sectionDone,
    needsPlanSelection
  }), [plans, activePlanId, activePlan, setActivePlanId, isReadOnly, refreshPlans, refreshGates, loading, canAccessPhase2, canAccessPhase3, phase2Missing, phase3Missing, sectionDone, needsPlanSelection])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}
