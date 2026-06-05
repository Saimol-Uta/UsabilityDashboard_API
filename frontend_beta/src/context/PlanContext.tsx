import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { testPlansApi, participantsApi, moderatorScriptsApi, testTasksApi, testSessionsApi, observationLogsApi, findingsApi, improvementActionsApi, sprintBacklogApi } from '../api'

export interface Plan {
  id: string
  projectName: string
  status: string
  workflowState?: string
  [key: string]: any
}

export interface TechnicalTask {
  id: string
  title: string
  estimatedHours: number
}

export interface UserStory {
  id: string
  title: string
  description: string
  priority: string // 'Alta' | 'Media' | 'Baja'
  acceptanceCriteria: string[]
  technicalTasks: TechnicalTask[]
  origen_hallazgo?: string
  estimatedHours?: number
  heuristic?: string
}

export interface BacklogData {
  sprintName: string
  sprintGoal: string
  userStories: UserStory[]
}

interface PlanContextType {
  plans: Plan[]
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
  sectionDone: Record<string, boolean>
  needsPlanSelection: boolean
  
  // Backlog states
  processedIds: Set<string>
  setProcessedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  backlogData: BacklogData | null
  setBacklogData: React.Dispatch<React.SetStateAction<BacklogData | null>>
  userStories: UserStory[]
  setUserStories: React.Dispatch<React.SetStateAction<UserStory[]>>
  archivedSprints: any[]
  setArchivedSprints: React.Dispatch<React.SetStateAction<any[]>>
  currentView: 'empty' | 'insights' | 'board'
  setCurrentView: React.Dispatch<React.SetStateAction<'empty' | 'insights' | 'board'>>
  hasGenerated: boolean
  setHasGenerated: React.Dispatch<React.SetStateAction<boolean>>
  
  // DB entities cache
  observations: any[]
  sessions: any[]
  findings: any[]
  
  // Actions
  calculateDataDelta: () => { hasNew: boolean; delta: any[] }
  appendUserStories: (newStories: any[]) => void
  archiveCurrentSprintDraft: (backlogData: BacklogData) => void
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
  
  processedIds: new Set<string>(),
  setProcessedIds: () => {},
  backlogData: null,
  setBacklogData: () => {},
  userStories: [],
  setUserStories: () => {},
  archivedSprints: [],
  setArchivedSprints: () => {},
  currentView: 'empty',
  setCurrentView: () => {},
  hasGenerated: false,
  setHasGenerated: () => {},
  
  observations: [],
  sessions: [],
  findings: [],
  
  calculateDataDelta: () => ({ hasNew: false, delta: [] }),
  appendUserStories: () => {},
  archiveCurrentSprintDraft: () => {}
})

export const usePlan = () => useContext(PlanContext)

const STORAGE_KEY = 'usability_active_plan_id'
const UNSET = '__UNSET__'

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [activePlanId, setActivePlanIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
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
  
  // Centralized Backlog States
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set<string>())
  const [backlogData, setBacklogData] = useState<BacklogData | null>(null)
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [currentView, setCurrentView] = useState<'empty' | 'insights' | 'board'>('empty')
  const [hasGenerated, setHasGenerated] = useState<boolean>(false)
  
  // Local cache for DB entities
  const [observations, setObservations] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [findings, setFindings] = useState<any[]>([])

  // Archived sprints list with localStorage persistence
  const [archivedSprints, setArchivedSprints] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("usability_archived_sprints")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Reset local state when active plan changes
  useEffect(() => {
    setProcessedIds(new Set<string>())
    setBacklogData(null)
    setUserStories([])
    setHasGenerated(false)
    setCurrentView('empty')
  }, [activePlanId])

  const refreshGates = useCallback(async () => {
    if (!activePlanId || activePlanId === UNSET) {
      setCanAccessPhase2(false)
      setCanAccessPhase3(false)
      return
    }
    try {
      const [participantsReq, scriptReq, tasksReq, sessionsReq, logsReq, findingsReq, backlogReq] = await Promise.all([
        participantsApi.getAll(),
        moderatorScriptsApi.getByPlan(activePlanId).catch(() => ({ data: null })),
        testTasksApi.getByPlan(activePlanId),
        testSessionsApi.getAll(activePlanId),
        observationLogsApi.getAll(),
        findingsApi.getByPlan(activePlanId).catch(() => ({ data: [] })),
        sprintBacklogApi.getByPlan(activePlanId).catch(() => ({ data: null }))
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

      // Cache raw DB lists
      setObservations(planLogs)
      setSessions(planSessions)
      setFindings(findingsReq.data ?? [])

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

      // Check if there are accessibility-specific findings
      const accessibilityTools = ['WAVE', 'Lighthouse', 'Stark', 'Observación manual']
      const allFindings: any[] = findingsReq.data ?? []
      const hasAccessibility = allFindings.some(f => accessibilityTools.includes(f.tool))

      const hasBacklog = !!backlogReq.data

      // Load backlog details if saved
      // NOTE: We do NOT call setCurrentView here because refreshGates runs
      // after saves (e.g., from handleInsertIntoBacklog) and would override
      // the 'insights' view that was just set. View transitions are managed
      // exclusively by loadBacklog() (in SprintBacklog) and the save handlers.
      if (backlogReq.data && backlogReq.data.contentJson) {
        try {
          const parsed = JSON.parse(backlogReq.data.contentJson) as BacklogData
          setBacklogData(parsed)
          setUserStories(parsed.userStories || [])
          setHasGenerated(true)
          // Do NOT setCurrentView here — avoids race condition with 'insights'
        } catch {
          // parsing error
        }
      }

      setSectionDone({
        guion: hasScript,
        participantes: hasParticipants,
        tareas: hasTasks,
        sesiones: hasSessions,
        observaciones: hasObservations,
        hallazgos: hasFindings,
        mejoras: hasActions,
        accesibilidad: hasAccessibility,
        backlog: hasBacklog,
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

  // FASE 4 — calculateDataDelta
  const calculateDataDelta = useCallback(() => {
    const allIds = observations.map(o => o.id)
    const newIds = allIds.filter(id => !processedIds.has(id))
    return {
      hasNew: newIds.length > 0,
      delta: observations.filter(o => newIds.includes(o.id))
    }
  }, [observations, processedIds])

  // FASE 4 — appendUserStories
  const appendUserStories = useCallback((newStories: any[]) => {
    const { delta } = calculateDataDelta()
    
    // Map tasks and stories securely, injecting estimatedHours and Nielsen heuristics
    const mapped = newStories.map((story: any, idx: number) => {
      const currentUSCount = userStories.length
      const usIdNum = currentUSCount + idx + 1
      const usId = `US-${usIdNum}`
      
      const technicalTasks = (story.technicalTasks || []).map((t: any, tIdx: number) => ({
        id: `TA-${usIdNum}.${tIdx + 1}`,
        title: t.title,
        estimatedHours: t.estimatedHours || 4
      }))

      const storyHours = technicalTasks.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)

      // Deduce heuristic from text if not explicitly provided
      let heuristic = story.heuristic
      if (!heuristic) {
        const text = `${story.title} ${story.description}`.toLowerCase()
        if (text.includes('visibilidad') || text.includes('estado')) {
          heuristic = 'Visibilidad del estado del sistema'
        } else if (text.includes('coincidencia') || text.includes('mundo real')) {
          heuristic = 'Coincidencia entre el sistema y el mundo real'
        } else if (text.includes('control') || text.includes('libertad')) {
          heuristic = 'Control y libertad del usuario'
        } else if (text.includes('consistencia') || text.includes('estándar') || text.includes('consistente')) {
          heuristic = 'Consistencia y estándares'
        } else if (text.includes('prevención') || text.includes('error') || text.includes('prevenir')) {
          heuristic = 'Prevención de errores'
        } else if (text.includes('reconocimiento') || text.includes('recuerdo')) {
          heuristic = 'Reconocimiento antes que recuerdo'
        } else if (text.includes('flexibilidad') || text.includes('eficiencia')) {
          heuristic = 'Flexibilidad y eficiencia de uso'
        } else if (text.includes('estética') || text.includes('minimalista') || text.includes('estético')) {
          heuristic = 'Estética y diseño minimalista'
        } else if (text.includes('recuperar') || text.includes('diagnosticar')) {
          heuristic = 'Ayuda a los usuarios a reconocer, diagnosticar y recuperarse de los errores'
        } else if (text.includes('ayuda') || text.includes('documentación')) {
          heuristic = 'Ayuda y documentación'
        } else {
          heuristic = 'Prevención de errores' // Default fallback
        }
      }

      return {
        id: usId,
        title: story.title || `Historia de Usabilidad ${usId}`,
        description: story.description,
        priority: story.priority || 'Alta',
        origen_hallazgo: story.origen_hallazgo || 'Copiloto IA - Sugerencia Contextual',
        acceptanceCriteria: story.acceptanceCriteria || [],
        technicalTasks,
        estimatedHours: storyHours,
        heuristic
      }
    })

    const updatedStories = [...userStories, ...mapped]
    setUserStories(updatedStories)

    const updatedProcessed = new Set([...processedIds, ...delta.map(o => o.id)])
    setProcessedIds(updatedProcessed)

    setBacklogData(prev => {
      const base = prev || {
        sprintName: 'Sprint 1 - Optimización de Usabilidad y HCI',
        sprintGoal: 'Corregir fallos críticos de accesibilidad y diseño táctil identificados en la evaluación.',
        userStories: []
      }
      return {
        ...base,
        userStories: updatedStories
      }
    })

    setHasGenerated(true)
    setCurrentView('insights')
  }, [userStories, processedIds, calculateDataDelta])

  // FASE 3 — archiveCurrentSprintDraft
  const archiveCurrentSprintDraft = useCallback((backlogToArchive: BacklogData) => {
    const nextVersion = archivedSprints.length + 1
    const label = `Borrador Archivado V${nextVersion}`
    const archivedItem = {
      ...backlogToArchive,
      versionLabel: label,
      archivedAt: new Date().toISOString()
    }
    const updated = [...archivedSprints, archivedItem]
    setArchivedSprints(updated)
    localStorage.setItem("usability_archived_sprints", JSON.stringify(updated))

    // Clear active state
    setUserStories([])
    setProcessedIds(new Set<string>())
    setHasGenerated(false)
    setBacklogData(null)
    setCurrentView('empty')
  }, [archivedSprints])

  const setActivePlanId = useCallback((id: string) => {
    if (!id) return
    setActivePlanIdState(id)
    setNeedsPlanSelection(false)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
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
        setNeedsPlanSelection(true)
      } else if (!currentPlans.find((p: Plan) => p.id === activePlanId)) {
        if (currentPlans.length > 0) setActivePlanId(currentPlans[0].id)
        else setNeedsPlanSelection(true)
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
    refreshGates,
    loading,
    canAccessPhase2,
    canAccessPhase3,
    phase2Missing,
    phase3Missing,
    sectionDone,
    needsPlanSelection,
    
    processedIds,
    setProcessedIds,
    backlogData,
    setBacklogData,
    userStories,
    setUserStories,
    archivedSprints,
    setArchivedSprints,
    currentView,
    setCurrentView,
    hasGenerated,
    setHasGenerated,
    
    observations,
    sessions,
    findings,
    
    calculateDataDelta,
    appendUserStories,
    archiveCurrentSprintDraft
  }), [
    plans, activePlanId, activePlan, setActivePlanId, isReadOnly, refreshPlans, refreshGates, loading,
    canAccessPhase2, canAccessPhase3, phase2Missing, phase3Missing, sectionDone, needsPlanSelection,
    processedIds, setProcessedIds, backlogData, setBacklogData, userStories, setUserStories,
    archivedSprints, setArchivedSprints, currentView, setCurrentView, hasGenerated, setHasGenerated,
    observations, sessions, findings, calculateDataDelta, appendUserStories, archiveCurrentSprintDraft
  ])

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}
