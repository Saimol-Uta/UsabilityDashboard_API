import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Sparkles, Send, X, Brain, PlusCircle, CheckCircle2,
    ClipboardList, HelpCircle, FileText, Users, LayoutDashboard
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import { useToast } from '../App'
import {
    findingsApi, testSessionsApi, moderatorScriptsApi,
    sprintBacklogApi, testTasksApi, observationLogsApi,
    improvementActionsApi
} from '../api'

interface ChatMessage {
    id: number
    sender: 'user' | 'ai'
    text: string
    isAction?: boolean
    actionData?: any
    inserted?: boolean
}

export default function AiCopilot() {
    const location = useLocation()
    const navigate = useNavigate()
    const {
        activePlanId,
        activePlan,
        refreshGates,
        processedIds,
        setProcessedIds,
        userStories,
        setUserStories,
        setBacklogData,
        setHasGenerated,
        setCurrentView,
        calculateDataDelta,
        findings,
        sessions
    } = usePlan()
    const { addToast } = useToast()
    const latestDeltaRef = useRef<string[]>([])

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)

    const [selectedTasksState, setSelectedTasksState] = useState<Record<string, boolean>>({})
    const [selectedFindingsState, setSelectedFindingsState] = useState<Record<string, boolean>>({})
    const [selectedImprovementsState, setSelectedImprovementsState] = useState<Record<string, boolean>>({})
    const [findingsList, setFindingsList] = useState<any[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Set initial greeting
    useEffect(() => {
        setMessages([
            {
                id: 1,
                sender: 'ai',
                text: '👋 ¡Hola! Soy tu **Copiloto de IA**. Estoy aquí para ayudarte a transformar tus hallazgos y observaciones de usabilidad directamente en historias de usuario y tareas técnicas para el **Sprint Backlog**.\n\n¿En qué sección deseas trabajar hoy?'
            }
        ])
    }, [])

    // Scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, loading])

    // Event listener for automated Copilot triggers (HCI interactions)
    useEffect(() => {
        const handleCopilotTrigger = async (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (!detail) return

            setIsOpen(true)

            if (detail.action === 'suggest-tasks') {
                setLoading(true)

                // Render user-friendly query card in chat logs
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() - 1,
                        sender: 'user',
                        text: '✨ Sugerir tareas ergonómicas con Inteligencia Artificial'
                    }
                ])

                try {
                    const prompt = `Actúa como un experto en interacción humano-computador y diseño centrado en el usuario.
Sugiere exactamente 3 tareas de usabilidad realistas y relevantes para evaluar el siguiente producto de software:
- Proyecto: ${detail.projectName || activePlan?.projectName || 'N/A'}
- Producto: ${detail.product || activePlan?.product || 'N/A'}
- Módulo Evaluado: ${detail.evaluatedModule || activePlan?.evaluatedModule || 'N/A'}
- Objetivo del Plan: ${detail.objective || activePlan?.objective || 'N/A'}

Por favor, asegúrate de que las tareas sean accionables, específicas y ergonómicas, conteniendo escenario, resultado esperado, métrica principal, criterio de éxito y tiempo estimado máximo en segundos.

Debes responder amigablemente y incluir estrictamente un bloque [TASK_ACTION] conteniendo únicamente un JSON con el array de tareas sugeridas para que el usuario las inserte con un solo clic.

ESTRUCTURA DE RESPUESTA EXIGIDA:
Presentación amigable con tips ergonómicos para el test.
[TASK_ACTION]
{
  "tasks": [
    {
      "scenario": "[Descripción clara del escenario de prueba]",
      "expectedResult": "[Resultado que el usuario final debe lograr]",
      "mainMetric": "[Métrica, ej: Tasa de éxito]",
      "successCriteria": "[Criterio exacto de satisfacción]",
      "maxTimeSeconds": 90
    }
  ]
}
[/TASK_ACTION]
`;

                    const aiRawReply = await queryGemini(prompt, { action: 'suggest-tasks' })

                    let cleanText = aiRawReply
                    let isAction = false
                    let actionData = undefined

                    if (aiRawReply.includes('[TASK_ACTION]')) {
                        const parts = aiRawReply.split('[TASK_ACTION]')
                        cleanText = parts[0]
                        const actionPart = parts[1].split('[/TASK_ACTION]')[0]
                        try {
                            actionData = JSON.parse(actionPart.trim())
                            isAction = true
                        } catch (err) {
                            console.error('Error parsing suggest tasks action JSON:', err)
                        }
                    }

                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: cleanText,
                            isAction,
                            actionData
                        }
                    ])
                } catch (err: any) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: `❌ **Error al sugerir tareas:** ${err.message || 'No se pudo conectar con el servidor de IA.'}`
                        }
                    ])
                } finally {
                    setLoading(false)
                }
            } else if (detail.action === 'suggest-findings') {
                if (!activePlanId) return
                setLoading(true)

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() - 1,
                        sender: 'user',
                        text: '✨ Sugerir hallazgos de usabilidad con Inteligencia Artificial'
                    }
                ])

                try {
                    // Fetch observations client-side first
                    const [sessionsRes, observationLogsRes] = await Promise.all([
                        testSessionsApi.getAll(activePlanId).catch(() => ({ data: [] })),
                        observationLogsApi.getAll().catch(() => ({ data: [] }))
                    ])
                    const sessions = sessionsRes.data || []
                    const sessionIds = new Set(sessions.map((s: any) => s.id))
                    const relevantLogs = (observationLogsRes.data || []).filter((log: any) => sessionIds.has(log.testSessionId))

                    if (relevantLogs.length === 0) {
                        setMessages(prev => [
                            ...prev,
                            {
                                id: Date.now(),
                                sender: 'ai',
                                text: '⚠️ **Copiloto de Usabilidad:** No hay observaciones u incidentes registrados en las sesiones de los participantes para este plan de pruebas. Por favor, realiza la fase de ejecución de pruebas y registra observaciones primero para poder sugerir hallazgos de usabilidad.'
                            }
                        ])
                        setLoading(false)
                        return
                    }

                    const prompt = `Actúa como un experto en interacción humano-computador, diseño centrado en el usuario y accesibilidad.
Analiza las siguientes observaciones y registros de incidentes recopilados durante las sesiones con participantes para el producto "${detail.projectName || activePlan?.projectName || 'N/A'}" (${detail.product || activePlan?.product || 'N/A'}):

Observaciones / Incidentes registrados:
${JSON.stringify(relevantLogs.map((log: any) => ({
    tarea: log.taskScenario || `Tarea ${log.testTaskId}`,
    severidad: log.severity,
    dificultadDetectada: log.problemDetected,
    mejoraPropuesta: log.proposedImprovement,
    exitoso: log.completedSuccessfully ? "Sí" : "No"
})), null, 2)}

Sugiere exactamente hasta 3 hallazgos (findings) de usabilidad y accesibilidad realistas y críticos basados en estas observaciones.
Para cada hallazgo, define:
- description: Descripción clara y concisa del problema de usabilidad.
- severity: Severidad del hallazgo (debe ser uno de: "Critical", "High", "Medium", "Low").
- priority: Prioridad de corrección (debe ser uno de: "High", "Medium", "Low").
- category: Categoría del problema (ej. "Formularios", "Navegación", "Diseño Visual", "Accesibilidad").
- tool: Herramienta o método de detección (debe ser uno de: "WAVE", "Lighthouse", "Stark", "WAVE + Lighthouse", "Observación manual").
- frequency: Frecuencia de aparición (ej. "2 de 3 participantes" o "66%").
- recommendation: Recomendación ergonómica detallada y específica de Interacción Humano-Computador (IHC) para solucionar el problema.

Debes responder amigablemente y incluir estrictamente un bloque [FINDING_ACTION] conteniendo únicamente un JSON con el array de hallazgos sugeridos para que el usuario pueda insertarlos con un solo clic.

ESTRUCTURA DE RESPUESTA EXIGIDA:
Breve introducción amigable y análisis ergonómico sintético.
[FINDING_ACTION]
{
  "findings": [
    {
      "description": "[Descripción clara]",
      "severity": "Critical",
      "priority": "High",
      "category": "Navegación",
      "tool": "Observación manual",
      "frequency": "2/3",
      "recommendation": "[Recomendación IHC detallada]"
    }
  ]
}
[/FINDING_ACTION]
`;

                    const aiRawReply = await queryGemini(prompt, { action: 'suggest-findings' })

                    let cleanText = aiRawReply
                    let isAction = false
                    let actionData = undefined

                    if (aiRawReply.includes('[FINDING_ACTION]')) {
                        const parts = aiRawReply.split('[FINDING_ACTION]')
                        cleanText = parts[0]
                        const actionPart = parts[1].split('[/FINDING_ACTION]')[0]
                        try {
                            actionData = JSON.parse(actionPart.trim())
                            isAction = true
                        } catch (err) {
                            console.error('Error parsing suggest findings action JSON:', err)
                        }
                    }

                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: cleanText,
                            isAction,
                            actionData
                        }
                    ])
                } catch (err: any) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: `❌ **Error al sugerir hallazgos:** ${err.message || 'No se pudo conectar con el servidor de IA.'}`
                        }
                    ])
                } finally {
                    setLoading(false)
                }
            } else if (detail.action === 'suggest-improvements') {
                if (!activePlanId) return
                setLoading(true)

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() - 1,
                        sender: 'user',
                        text: '✨ Sugerir acciones de mejora ergonómicas con IA'
                    }
                ])

                try {
                    // Fetch findings list first
                    const findingsRes = await findingsApi.getByPlan(activePlanId)
                    const findingsListFetched = findingsRes.data || []
                    setFindingsList(findingsListFetched)

                    if (findingsListFetched.length === 0) {
                        setMessages(prev => [
                            ...prev,
                            {
                                id: Date.now(),
                                sender: 'ai',
                                text: '⚠️ **Copiloto de Usabilidad:** No hay hallazgos sintetizados en este plan. Registra al menos un hallazgo de usabilidad primero para que la IA pueda sugerir las acciones de mejora correspondientes.'
                            }
                        ])
                        setLoading(false)
                        return
                    }

                    const prompt = `Actúa como un experto en interacción humano-computador, ingeniería de usabilidad y optimización de software.
Analiza los siguientes hallazgos sintetizados para el plan de prueba "${detail.projectName || activePlan?.projectName || 'N/A'}" (${detail.product || activePlan?.product || 'N/A'}):

Hallazgos sintetizados:
${JSON.stringify(findingsListFetched.map((f: any) => ({
    id: f.id,
    description: f.description,
    severity: f.severity,
    priority: f.priority,
    category: f.category,
    recommendation: f.recommendation
})), null, 2)}

Sugiere exactamente una acción de mejora priorizada y de alto impacto ergonómico para cada uno de los hallazgos anteriores.
Para cada acción de mejora, define:
- findingId: El ID del hallazgo correspondiente (¡debe coincidir exactamente con el ID provisto!).
- description: Descripción clara, accionable y técnica de la mejora propuesta.
- priority: Prioridad (debe ser uno de: "High", "Medium", "Low").

Debes responder amigablemente y incluir estrictamente un bloque [IMPROVEMENT_ACTION] conteniendo únicamente un JSON con el array de acciones de mejora sugeridas para que el usuario pueda insertarlas con un solo clic.

ESTRUCTURA DE RESPUESTA EXIGIDA:
Breve explicación ergonómica de las mejoras.
[IMPROVEMENT_ACTION]
{
  "improvements": [
    {
      "findingId": "[ID_DEL_HALLAZGO]",
      "description": "[Descripción técnica y accionable]",
      "priority": "High"
    }
  ]
}
[/IMPROVEMENT_ACTION]
`;

                    const aiRawReply = await queryGemini(prompt, { action: 'suggest-improvements' })

                    let cleanText = aiRawReply
                    let isAction = false
                    let actionData = undefined

                    if (aiRawReply.includes('[IMPROVEMENT_ACTION]')) {
                        const parts = aiRawReply.split('[IMPROVEMENT_ACTION]')
                        cleanText = parts[0]
                        const actionPart = parts[1].split('[/IMPROVEMENT_ACTION]')[0]
                        try {
                            actionData = JSON.parse(actionPart.trim())
                            isAction = true
                            if (actionData && Array.isArray(actionData.improvements)) {
                                actionData.improvements = actionData.improvements.map((imp: any, idx: number) => {
                                    let realFindingId = imp.findingId;
                                    const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realFindingId);
                                    const existsInList = findingsListFetched.some((f: any) => f.id === realFindingId);
                                    if (!isValidGuid || !existsInList) {
                                        const matchedFinding = findingsListFetched[idx % findingsListFetched.length];
                                        realFindingId = matchedFinding?.id;
                                    }
                                    return {
                                        ...imp,
                                        findingId: realFindingId
                                    };
                                });
                            }
                        } catch (err) {
                            console.error('Error parsing suggest improvements action JSON:', err)
                        }
                    }

                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: cleanText,
                            isAction,
                            actionData
                        }
                    ])
                } catch (err: any) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: `❌ **Error al sugerir acciones de mejora:** ${err.message || 'No se pudo conectar con el servidor de IA.'}`
                        }
                    ])
                } finally {
                    setLoading(false)
                }
            } else if (detail.action === 'participant-saved') {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: 'ai',
                        text: `🎉 ¡Espectacular! Se ha registrado con éxito al participante **${detail.participantName}**.\n\nCon esto finalizas la fase de preparación de participantes. ¿Deseas avanzar paso a paso hacia la síntesis de **Hallazgos y Acciones de Mejora**, o prefieres ir directo a planificar el **Sprint Backlog**?`
                    }
                ])
            }
        }

        window.addEventListener('copilot-trigger', handleCopilotTrigger)
        return () => window.removeEventListener('copilot-trigger', handleCopilotTrigger)
    }, [activePlanId, activePlan])

    const handleInsertTasks = async (msgId: number, tasks: any[]) => {
        if (!activePlanId) return

        try {
            addToast('Agregando tareas seleccionadas al plan...', 'success')
            
            // Filter only selected tasks
            const selectedTasks = tasks.filter((_, idx) => {
                const uniqueKey = `task-sug-${msgId}-${idx}`
                return selectedTasksState[uniqueKey] !== false // Default is checked
            })

            if (selectedTasks.length === 0) {
                addToast('No seleccionaste ninguna tarea', 'error')
                return
            }

            // 1. Fetch current task list to know the starting task number
            const currentTasksRes = await testTasksApi.getByPlan(activePlanId)
            const currentTasks = currentTasksRes.data || []
            const startingTaskNumber = currentTasks.length + 1

            // 2. Create tasks one by one
            await Promise.all(selectedTasks.map((task, idx) => {
                return testTasksApi.create({
                    testPlanId: activePlanId,
                    taskNumber: startingTaskNumber + idx,
                    scenario: task.scenario,
                    expectedResult: task.expectedResult || '',
                    mainMetric: task.mainMetric || 'Tasa de éxito',
                    successCriteria: task.successCriteria || '',
                    maxTimeSeconds: task.maxTimeSeconds || 120
                })
            }))

            // 3. Mark as inserted in state
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, inserted: true } : m))
            addToast(`¡${selectedTasks.length} tarea(s) agregada(s) con éxito!`, 'success')
            
            // Trigger a general custom event to tell the Tareas page to reload its task list!
            window.dispatchEvent(new CustomEvent('tasks-updated'))
            refreshGates()
        } catch (err) {
            console.error(err)
            addToast('Error al agregar tareas al plan', 'error')
        }
    }

    const handleInsertFindings = async (msgId: number, findings: any[]) => {
        if (!activePlanId) return

        try {
            addToast('Agregando hallazgos seleccionados al plan...', 'success')
            
            const selected = findings.filter((_, idx) => {
                const uniqueKey = `finding-sug-${msgId}-${idx}`
                return selectedFindingsState[uniqueKey] !== false // Default is checked
            })

            if (selected.length === 0) {
                addToast('No seleccionaste ningún hallazgo', 'error')
                return
            }

            await Promise.all(selected.map(f => {
                return findingsApi.create({
                    testPlanId: activePlanId,
                    description: f.description,
                    frequency: f.frequency || 'N/A',
                    severity: f.severity || 'Medium',
                    priority: f.priority || 'Medium',
                    recommendation: f.recommendation || '',
                    category: f.category || 'General',
                    tool: f.tool || 'Observación manual',
                    status: 'Open'
                })
            }))

            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, inserted: true } : m))
            addToast(`¡${selected.length} hallazgo(s) agregado(s) con éxito!`, 'success')
            
            window.dispatchEvent(new CustomEvent('findings-updated'))
            refreshGates()
        } catch (err) {
            console.error(err)
            addToast('Error al agregar hallazgos al plan', 'error')
        }
    }

    const handleInsertImprovements = async (msgId: number, improvements: any[]) => {
        if (!activePlanId) return

        try {
            addToast('Agregando acciones de mejora al plan...', 'success')
            
            const selected = improvements.filter((_, idx) => {
                const uniqueKey = `improvement-sug-${msgId}-${idx}`
                return selectedImprovementsState[uniqueKey] !== false // Default is checked
            })

            if (selected.length === 0) {
                addToast('No seleccionaste ninguna acción de mejora', 'error')
                return
            }

            // Fetch latest findings list from database to resolve GUIDs reliably
            const findingsRes = await findingsApi.getByPlan(activePlanId)
            const currentFindings = findingsRes.data || []

            await Promise.all(selected.map((imp, idx) => {
                let realFindingId = imp.findingId;
                const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realFindingId);
                const existsInList = currentFindings.some((f: any) => f.id === realFindingId);
                
                if (!isValidGuid || !existsInList) {
                    const matchedFinding = currentFindings[idx % currentFindings.length];
                    realFindingId = matchedFinding?.id;
                }

                if (!realFindingId) {
                    throw new Error('No se pudo encontrar un hallazgo asociado para esta acción.');
                }

                return improvementActionsApi.create({
                    findingId: realFindingId,
                    description: imp.description,
                    priority: imp.priority || 'Medium'
                })
            }))

            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, inserted: true } : m))
            addToast(`¡${selected.length} acción(es) de mejora agregada(s) con éxito!`, 'success')
            
            window.dispatchEvent(new CustomEvent('improvements-updated'))
            refreshGates()
        } catch (err) {
            console.error(err)
            addToast('Error al agregar acciones de mejora al plan', 'error')
        }
    }

    // Get current context metadata based on path
    const getContextMeta = () => {
        const path = location.pathname
        if (path.includes('/hallazgos')) {
            return {
                name: 'Hallazgos de Usabilidad',
                icon: HelpCircle,
                color: '#f59e0b',
                suggestions: [
                    '💡 Redactar Historias de Usuario para corregir mis Hallazgos',
                    '💡 Analizar la severidad e impacto técnico de los hallazgos'
                ]
            }
        }
        if (path.includes('/mejoras')) {
            return {
                name: 'Acciones de Mejora',
                icon: Sparkles,
                color: '#10b981',
                suggestions: [
                    '💡 Traducir Acciones de Mejora prioritarias a Historias de Scrum',
                    '💡 Estimar esfuerzo y horas técnicas para las mejoras'
                ]
            }
        }
        if (path.includes('/sesiones') || path.includes('/observaciones')) {
            return {
                name: 'Ejecución y Observaciones',
                icon: Users,
                color: '#0ea5e9',
                suggestions: [
                    '💡 Extraer historias de usabilidad de los logs de incidentes',
                    '💡 Analizar la tasa de éxito de las tareas completadas'
                ]
            }
        }
        if (path.includes('/guion')) {
            return {
                name: 'Guión del Moderador',
                icon: FileText,
                color: '#a855f7',
                suggestions: [
                    '💡 Crear Criterios de Aceptación basados en los escenarios del guión',
                    '💡 ¿Cómo puedo mejorar las tareas antes del test?'
                ]
            }
        }
        if (path.includes('/backlog')) {
            return {
                name: 'Sprint Backlog',
                icon: ClipboardList,
                color: '#6366f1',
                suggestions: [
                    '💡 Evaluar coherencia de mis historias y metas de sprint',
                    '💡 Sugerir tareas técnicas adicionales para mi sprint'
                ]
            }
        }
        return {
            name: 'Dashboard General',
            icon: LayoutDashboard,
            color: 'var(--color-primary)',
            suggestions: [
                '💡 ¿Cómo puedo estructurar un Sprint Backlog asistido por IA?',
                '💡 Sugerir mejoras generales de usabilidad para mi app'
            ]
        }
    }

    const contextMeta = getContextMeta()

    // Call Gemini API through backend proxy endpoint
    const queryGemini = async (prompt: string, planData: any) => {
        const activePageName = contextMeta.name
        const contextJson = JSON.stringify(planData)

        const res = await sprintBacklogApi.chat({
            prompt,
            activePageName,
            contextJson
        })

        if (res.data && res.data.reply) {
            return res.data.reply
        }
        
        throw new Error('La respuesta del servidor no tiene un formato válido.')
    }

    // Load contextual data from backend to feed the prompt
    const fetchContextData = async () => {
        if (!activePlanId) return { info: 'No hay ningún plan de pruebas seleccionado actualmente.' }
        
        const path = location.pathname
        try {
            if (path.includes('/hallazgos')) {
                const res = await findingsApi.getByPlan(activePlanId)
                return res.data || []
            }
            if (path.includes('/mejoras')) {
                const res = await findingsApi.getByPlan(activePlanId)
                // Filter only improvement actions from findings
                const findings = res.data || []
                return findings.flatMap((f: any) => (f.improvementActions || []).map((a: any) => ({
                    findingDescription: f.description,
                    findingSeverity: f.severity,
                    actionDescription: a.description,
                    actionPriority: a.priority
                })))
            }
            if (path.includes('/sesiones') || path.includes('/observaciones')) {
                const [sessionsRes, tasksRes, observationLogsRes] = await Promise.all([
                    testSessionsApi.getAll(activePlanId).catch(() => ({ data: [] })),
                    testTasksApi.getByPlan(activePlanId).catch(() => ({ data: [] })),
                    observationLogsApi.getAll().catch(() => ({ data: [] }))
                ])
                const sessions = sessionsRes.data || []
                const sessionIds = new Set(sessions.map((s: any) => s.id))
                const relevantLogs = (observationLogsRes.data || []).filter((log: any) => sessionIds.has(log.testSessionId))
                const detailedSessions = sessions.map((s: any) => ({
                    ...s,
                    observationLogs: relevantLogs.filter((log: any) => log.testSessionId === s.id)
                }))
                return {
                    sessions: detailedSessions,
                    observationLogs: relevantLogs,
                    tasksCount: (tasksRes.data || []).length
                }
            }
            if (path.includes('/guion')) {
                const res = await moderatorScriptsApi.getByPlan(activePlanId)
                return res.data || {}
            }
            if (path.includes('/backlog')) {
                const [findingsRes, scriptRes, sessionsRes, tasksRes, observationLogsRes] = await Promise.all([
                    findingsApi.getByPlan(activePlanId).catch(() => ({ data: [] })),
                    moderatorScriptsApi.getByPlan(activePlanId).catch(() => ({ data: null })),
                    testSessionsApi.getAll(activePlanId).catch(() => ({ data: [] })),
                    testTasksApi.getByPlan(activePlanId).catch(() => ({ data: [] })),
                    observationLogsApi.getAll().catch(() => ({ data: [] }))
                ])
                const sessions = sessionsRes.data || []
                const sessionIds = new Set(sessions.map((s: any) => s.id))
                const relevantLogs = (observationLogsRes.data || []).filter((log: any) => sessionIds.has(log.testSessionId))
                
                // Build detailed sessions that include their observations/logs for Copilot context
                const detailedSessions = sessions.map((s: any) => ({
                    ...s,
                    observationLogs: relevantLogs.filter((log: any) => log.testSessionId === s.id)
                }))

                return {
                    projectName: activePlan?.projectName,
                    product: activePlan?.product,
                    evaluatedModule: activePlan?.evaluatedModule,
                    objective: activePlan?.objective,
                    userProfile: activePlan?.userProfile,
                    scope: activePlan?.scope,
                    script: scriptRes.data,
                    tasks: tasksRes.data || [],
                    sessions: detailedSessions,
                    observationLogs: relevantLogs,
                    findings: findingsRes.data || []
                }
            }
            
            // Default: general plan stats
            const res = await findingsApi.getByPlan(activePlanId)
            return {
                projectName: activePlan?.projectName,
                totalFindings: (res.data || []).length
            }
        } catch (err) {
            console.error('Error fetching copilot context data:', err)
            return { error: 'No se pudo leer la base de datos de esta sección en tiempo real.' }
        }
    }



    // Handle sending a message
    const handleSendMessage = async (text: string) => {
        if (!text.trim() || loading) return
        if (!activePlanId) {
            addToast('Selecciona un plan de prueba activo primero', 'error')
            return
        }

        // Add user message
        const userMsgId = Date.now()
        setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }])
        setInputText('')
        setLoading(true)

        try {
            // 1. Fetch relevant page context data
            let fetchedContext = await fetchContextData()

            // Bug 1 — Contexto vacío fallback
            const hallazgos = findings
            const isFetchedEmpty = !fetchedContext || 
                (Array.isArray(fetchedContext) && fetchedContext.length === 0) || 
                (typeof fetchedContext === 'object' && Object.keys(fetchedContext).length === 0)

            if (isFetchedEmpty) {
                fetchedContext = hallazgos?.length > 0
                  ? hallazgos
                  : sessions.flatMap((s: any) => s.observations ?? s.observationLogs ?? [])
            }

            const isFinalEmpty = !fetchedContext || 
                (Array.isArray(fetchedContext) && fetchedContext.length === 0) || 
                (typeof fetchedContext === 'object' && Object.keys(fetchedContext).length === 0)

            if (isFinalEmpty) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: 'ai',
                        text: '⚠️ No hay datos de sesiones disponibles para analizar.'
                    }
                ])
                setLoading(false)
                return
            }

            const isRequestingBacklog = location.pathname.includes('/backlog') || 
                                         text.toLowerCase().includes('backlog') || 
                                         text.toLowerCase().includes('historia') ||
                                         text.toLowerCase().includes('generar')

            let finalContextData = fetchedContext
            let promptText = text

            if (isRequestingBacklog) {
                // FASE 4 — calculateDataDelta
                const { hasNew, delta } = calculateDataDelta()
                if (!hasNew) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            sender: 'ai',
                            text: '✅ El Sprint Backlog ya está al día con los datos existentes. No se encontraron observaciones nuevas.'
                        }
                    ])
                    setLoading(false)
                    return
                }

                finalContextData = delta
                latestDeltaRef.current = delta.map((o: any) => o.id)
                promptText = `${text}\n\nNo dupliques requerimientos ya existentes en el backlog actual: ${userStories.map((s: any) => s.title).join(', ')}`
            }

            // 2. Query Gemini through backend secure proxy
            const aiRawText = await queryGemini(promptText, finalContextData)

            // 3. Parse BACKLOG_ACTION if any
            let cleanText = aiRawText
            let isAction = false
            let actionData = undefined

            if (aiRawText.includes('[BACKLOG_ACTION]')) {
                const parts = aiRawText.split('[BACKLOG_ACTION]')
                cleanText = parts[0]
                const actionPart = parts[1].split('[/BACKLOG_ACTION]')[0]
                try {
                    actionData = JSON.parse(actionPart.trim())
                    isAction = true
                } catch (e) {
                    console.error('Error parsing backlog action JSON:', e)
                }
            } else if (aiRawText.includes('[TASK_ACTION]')) {
                const parts = aiRawText.split('[TASK_ACTION]')
                cleanText = parts[0]
                const actionPart = parts[1].split('[/TASK_ACTION]')[0]
                try {
                    actionData = JSON.parse(actionPart.trim())
                    isAction = true
                } catch (err) {
                    console.error('Error parsing task action JSON:', err)
                }
            } else if (aiRawText.includes('[FINDING_ACTION]')) {
                const parts = aiRawText.split('[FINDING_ACTION]')
                cleanText = parts[0]
                const actionPart = parts[1].split('[/FINDING_ACTION]')[0]
                try {
                    actionData = JSON.parse(actionPart.trim())
                    isAction = true
                } catch (err) {
                    console.error('Error parsing finding action JSON:', err)
                }
            } else if (aiRawText.includes('[IMPROVEMENT_ACTION]')) {
                const parts = aiRawText.split('[IMPROVEMENT_ACTION]')
                cleanText = parts[0]
                const actionPart = parts[1].split('[/IMPROVEMENT_ACTION]')[0]
                try {
                    actionData = JSON.parse(actionPart.trim())
                    isAction = true
                } catch (err) {
                    console.error('Error parsing improvement action JSON:', err)
                }
            }

            // Add AI response
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: 'ai',
                    text: cleanText,
                    isAction,
                    actionData
                }
            ])
        } catch (err: any) {
            console.error(err)
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: 'ai',
                    text: `❌ **Error del Asistente:** ${err.message || 'No se pudo conectar con el servidor de IA de forma segura.'}`
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    // Handle quick suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion.replace('💡 ', ''))
    }

    // Inject generated stories directly into the existing Backlog
    const handleInsertIntoBacklog = async (msgId: number, actionData: any) => {
        if (!activePlanId || !actionData?.stories) return

        try {
            addToast('Conectando con el Sprint Backlog...', 'success')
            
            // 1. Fetch existing backlog
            let existingBacklog: any = null
            try {
                const res = await sprintBacklogApi.getByPlan(activePlanId)
                existingBacklog = res.data
            } catch (e) {
                // If 404, remains null
            }

            let backlogData: any = {
                sprintName: 'Sprint 1 - Optimización de Usabilidad y HCI',
                sprintGoal: 'Corregir fallos críticos de accesibilidad y diseño táctil identificados en la evaluación.',
                userStories: []
            }

            if (existingBacklog && existingBacklog.contentJson) {
                try {
                    backlogData = JSON.parse(existingBacklog.contentJson)
                } catch (e) {
                    console.error('Error parsing existing backlog JSON:', e)
                }
            } else if (existingBacklog) {
                backlogData.sprintName = existingBacklog.sprintName || backlogData.sprintName
                backlogData.sprintGoal = existingBacklog.sprintGoal || backlogData.sprintGoal
            }

            // 2. Map and append new stories incrementing US-IDs
            const currentUSCount = backlogData.userStories.length
            const newStories = actionData.stories.map((story: any, idx: number) => {
                const usIdNum = currentUSCount + idx + 1
                const usId = `US-${usIdNum}`
                
                // Map technical tasks
                const technicalTasks = (story.technicalTasks || []).map((t: any, tIdx: number) => ({
                    id: `TA-${usIdNum}.${tIdx + 1}`,
                    title: t.title,
                    estimatedHours: t.estimatedHours || 4
                }))

                const storyHours = technicalTasks.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)

                // Map heuristics
                let heuristic = story.heuristic
                if (!heuristic) {
                    const text = `${story.title} ${story.description}`.toLowerCase()
                    if (text.includes('visibilidad') || text.includes('estado')) {
                        heuristic = 'Visibilidad del estado del sistema'
                    } else if (text.includes('coincidencia') || text.includes('mundo real')) {
                        heuristic = 'Coincidencia entre el sistema y el mundo real'
                    } else if (text.includes('control') || text.includes('libertad')) {
                        heuristic = 'Control y libertad del usuario'
                    } else if (text.includes('consistencia') || text.includes('estandar') || text.includes('estándar') || text.includes('consistente')) {
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
                        heuristic = 'Prevención de errores'
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

            // Append new stories
            backlogData.userStories = [...backlogData.userStories, ...newStories]

            const usedObservationIds = [...processedIds, ...latestDeltaRef.current]

            const parsedBacklog = {
                sprintName: backlogData.sprintName,
                sprintGoal: backlogData.sprintGoal,
                userStories: backlogData.userStories
            }

            // 3. Construct markdown
            const generateMarkdown = (data: any) => {
                let md = `# Sprint Backlog: ${data.sprintName}\n\n`;
                md += `**Meta del Sprint:** ${data.sprintGoal}\n\n`;
                md += `## Historias de Usuario\n\n`;
                data.userStories.forEach((us: any) => {
                    md += `### 📋 [${us.id}] ${us.title}\n`;
                    if (us.origen_hallazgo) {
                        md += `* **Origen:** 🔍 ${us.origen_hallazgo}\n`;
                    }
                    if (us.heuristic) {
                        md += `* **Heurística de Nielsen:** ${us.heuristic}\n`;
                    }
                    md += `**Descripción:** ${us.description}\n`;
                    md += `**Prioridad:** ${us.priority}\n\n`;
                    md += `#### Criterios de Aceptación:\n`;
                    us.acceptanceCriteria.forEach((crit: string) => {
                        md += `- [ ] ${crit}\n`;
                    });
                    md += `\n#### Tareas Técnicas:\n`;
                    us.technicalTasks.forEach((task: any) => {
                        md += `- [ ] **${task.id}**: ${task.title} (${task.estimatedHours}h)\n`;
                    });
                    md += `\n---\n\n`;
                });
                return md
            }

            const markdown = generateMarkdown(backlogData)
            const contentJson = JSON.stringify(backlogData)

            // 4. Save to backend
            await sprintBacklogApi.save(activePlanId, {
                sprintName: backlogData.sprintName,
                sprintGoal: backlogData.sprintGoal,
                contentJson,
                rawMarkdown: markdown
            })

            // 5. Trigger exactly the Bug 2 callbacks
            setBacklogData(parsedBacklog)
            setUserStories(parsedBacklog.userStories)
            setProcessedIds(new Set(usedObservationIds))
            setHasGenerated(true)
            setCurrentView('insights')  // redirige a pantalla intermedia, no al board directamente

            // 6. Mark as inserted in state
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, inserted: true } : m))
            addToast(`¡${newStories.length} Historia(s) integrada(s) con éxito al Backlog!`, 'success')
            window.dispatchEvent(new CustomEvent('backlog-updated', { detail: { backlogData: parsedBacklog } }))
            refreshGates()
        } catch (err) {
            console.error(err)
            addToast('Error al insertar historias en el backlog', 'error')
        }
    }

    // Helper to render markdown simply
    const renderMessageText = (text: string) => {
        const paragraphs = text.split('\n\n')
        return paragraphs.map((p, pIdx) => {
            let rendered = p
            
            // Bold
            rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            
            // Inline code
            rendered = rendered.replace(/`(.*?)`/g, '<code class="code-pill">$1</code>')

            // Bullet points
            if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
                const items = p.split(/\n[*-] /)
                return (
                    <ul key={pIdx} style={{ margin: 'var(--space-2) 0', paddingLeft: 'var(--space-4)', listStyleType: 'disc' }}>
                        {items.map((item, i) => {
                            const cleanItem = item.replace(/^[*-] /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            return <li key={i} dangerouslySetInnerHTML={{ __html: cleanItem }} />
                        })}
                    </ul>
                )
            }

            // Headings
            if (p.trim().startsWith('### ')) {
                return <h4 key={pIdx} style={{ color: 'white', margin: 'var(--space-3) 0 var(--space-1)', fontSize: 'var(--font-size-sm)' }} dangerouslySetInnerHTML={{ __html: rendered.replace('### ', '') }} />
            }

            return <p key={pIdx} dangerouslySetInnerHTML={{ __html: rendered }} />
        })
    }

    return (
        <div className="copilot-widget print:hidden">
            {/* Pulsing button when closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="copilot-btn"
                    aria-label="Abrir Asistente Copiloto IA"
                    title="Copiloto IA Contextual"
                >
                    <div className="copilot-pulse" />
                    <Brain size={24} style={{ color: 'white', position: 'relative', zIndex: 2 }} />
                </button>
            )}

            {/* Chat Drawer Panel */}
            {isOpen && (
                <div className="copilot-panel">
                    {/* Header */}
                    <div className="copilot-header">
                        <div className="copilot-header-title" style={{ color: contextMeta.color }}>
                            <contextMeta.icon size={16} />
                            <span>Copiloto IA — {contextMeta.name}</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="copilot-close"
                            aria-label="Cerrar Copiloto"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="copilot-body">
                        {/* Chat Messages Log */}
                        <div className="copilot-messages soft-scrollbar">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`copilot-msg copilot-msg--${msg.sender}`}
                                >
                                    {renderMessageText(msg.text)}

                                    {/* Actionable Button to inject backlog */}
                                    {msg.isAction && msg.actionData?.stories && (
                                        <div>
                                            {msg.inserted ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10b981', marginTop: 'var(--space-2)', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>¡Historias integradas al Backlog!</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleInsertIntoBacklog(msg.id, msg.actionData)}
                                                    className="copilot-msg-insert-btn"
                                                >
                                                    <PlusCircle size={12} />
                                                    <span>Insertar {msg.actionData.stories.length} Historia(s) en Backlog</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Actionable checkbox tasks suggestion block */}
                                    {msg.isAction && msg.actionData?.tasks && (
                                        <div style={{ marginTop: 'var(--space-3)', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {msg.inserted ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>¡Tareas agregadas exitosamente!</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <p style={{ fontSize: '11px', color: 'var(--neutral-300)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-semibold)' }}>Selecciona las tareas que deseas agregar:</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                                        {msg.actionData.tasks.map((task: any, idx: number) => {
                                                            const uniqueKey = `task-sug-${msg.id}-${idx}`
                                                            const isChecked = selectedTasksState[uniqueKey] !== false
                                                            return (
                                                                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: '11px', color: 'white', cursor: 'pointer' }}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            setSelectedTasksState(prev => ({
                                                                                ...prev,
                                                                                [uniqueKey]: e.target.checked
                                                                            }))
                                                                        }}
                                                                        style={{ marginTop: '3px', cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ flex: 1 }}>
                                                                        <strong>T{idx+1}: {task.scenario}</strong>
                                                                        <div style={{ color: 'var(--neutral-400)', fontSize: '10px', marginTop: '1px' }}>
                                                                            ⏱️ {task.maxTimeSeconds}s | 📊 {task.mainMetric}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    <button
                                                        onClick={() => handleInsertTasks(msg.id, msg.actionData.tasks)}
                                                        className="copilot-msg-insert-btn"
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)' }}
                                                    >
                                                        <PlusCircle size={12} />
                                                        <span>Agregar Tareas Seleccionadas</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Actionable checkbox findings suggestion block */}
                                    {msg.isAction && msg.actionData?.findings && (
                                        <div style={{ marginTop: 'var(--space-3)', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {msg.inserted ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>¡Hallazgos agregados exitosamente!</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <p style={{ fontSize: '11px', color: 'var(--neutral-300)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-semibold)' }}>Selecciona los hallazgos que deseas sintetizar:</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                                        {msg.actionData.findings.map((finding: any, idx: number) => {
                                                            const uniqueKey = `finding-sug-${msg.id}-${idx}`
                                                            const isChecked = selectedFindingsState[uniqueKey] !== false
                                                            return (
                                                                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: '11px', color: 'white', cursor: 'pointer' }}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            setSelectedFindingsState(prev => ({
                                                                                ...prev,
                                                                                [uniqueKey]: e.target.checked
                                                                            }))
                                                                        }}
                                                                        style={{ marginTop: '3px', cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ flex: 1 }}>
                                                                        <strong>H{idx+1}: {finding.description}</strong>
                                                                        <div style={{ color: 'var(--neutral-400)', fontSize: '10px', marginTop: '1px' }}>
                                                                            ⚠️ {finding.severity === 'Critical' ? 'Crítica' : finding.severity === 'High' ? 'Alta' : finding.severity === 'Medium' ? 'Media' : 'Baja'} | 🏷️ {finding.category} | ⏱️ Frecuencia: {finding.frequency}
                                                                        </div>
                                                                        <div style={{ color: '#93c5fd', fontSize: '10px', marginTop: '2px', fontStyle: 'italic' }}>
                                                                            💡 Recomendación: {finding.recommendation}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    <button
                                                        onClick={() => handleInsertFindings(msg.id, msg.actionData.findings)}
                                                        className="copilot-msg-insert-btn"
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)' }}
                                                    >
                                                        <PlusCircle size={12} />
                                                        <span>Sintetizar Hallazgos Seleccionados</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Actionable checkbox improvements suggestion block */}
                                    {msg.isAction && msg.actionData?.improvements && (
                                        <div style={{ marginTop: 'var(--space-3)', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {msg.inserted ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={12} />
                                                    <span>¡Acciones de mejora agregadas exitosamente!</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <p style={{ fontSize: '11px', color: 'var(--neutral-300)', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-semibold)' }}>Selecciona las acciones de mejora que deseas registrar:</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                                        {msg.actionData.improvements.map((imp: any, idx: number) => {
                                                            const uniqueKey = `improvement-sug-${msg.id}-${idx}`
                                                            const isChecked = selectedImprovementsState[uniqueKey] !== false
                                                            const associatedFinding = findingsList.find((f: any) => f.id === imp.findingId);
                                                            return (
                                                                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: '11px', color: 'white', cursor: 'pointer' }}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            setSelectedImprovementsState(prev => ({
                                                                                ...prev,
                                                                                [uniqueKey]: e.target.checked
                                                                            }))
                                                                        }}
                                                                        style={{ marginTop: '3px', cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ flex: 1 }}>
                                                                        <strong>M{idx+1}: {imp.description}</strong>
                                                                        <div style={{ color: 'var(--neutral-400)', fontSize: '10px', marginTop: '1px' }}>
                                                                            Prioridad: {imp.priority === 'High' ? 'Alta' : imp.priority === 'Medium' ? 'Media' : 'Baja'}
                                                                        </div>
                                                                        {associatedFinding && (
                                                                            <div style={{ color: 'var(--neutral-500)', fontSize: '10px', marginTop: '2px' }}>
                                                                                🔍 Hallazgo: {associatedFinding.description.substring(0, 60)}...
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    <button
                                                        onClick={() => handleInsertImprovements(msg.id, msg.actionData.improvements)}
                                                        className="copilot-msg-insert-btn"
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1)' }}
                                                    >
                                                        <PlusCircle size={12} />
                                                        <span>Registrar Mejoras Seleccionadas</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="copilot-loading">
                                    <Sparkles size={12} className="sprint-spin" />
                                    <span>Analizando pantalla...</span>
                                    <div className="copilot-loading-dot" />
                                    <div className="copilot-loading-dot" />
                                    <div className="copilot-loading-dot" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion Action Chips */}
                        {messages.length < 3 && !loading && (
                            <div className="copilot-quick-actions">
                                <p className="copilot-quick-actions-title">Sugerencias del asistente:</p>
                                <div className="copilot-quick-actions-grid">
                                    {contextMeta.suggestions.map((sug, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(sug)}
                                            className="copilot-action-chip"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Persistent Quick Replies / Navigation Row */}
                        {activePlanId && !loading && (
                            <div className="copilot-quick-replies" style={{ padding: '0 var(--space-4) var(--space-2)' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate('/backlog')
                                        handleSendMessage('Ir directo al Sprint Backlog')
                                    }}
                                    className="copilot-action-chip"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                                        border: '1px solid rgba(99, 102, 241, 0.5)',
                                        color: '#818cf8',
                                        padding: '10px var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '11px',
                                        fontWeight: 'var(--font-weight-bold)',
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    ⚡ Ir directo al Sprint Backlog (Recomendado)
                                </button>
                            </div>
                        )}

                        {/* Message Prompt input area */}
                        <div className="copilot-input-area">
                            <textarea
                                placeholder={!activePlanId ? 'Selecciona un plan activo primero' : 'Pregúntame sobre esta sección...'}
                                disabled={!activePlanId || loading}
                                className="copilot-textarea soft-scrollbar"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage(inputText)
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleSendMessage(inputText)}
                                disabled={!inputText.trim() || !activePlanId || loading}
                                className="copilot-send-btn"
                                aria-label="Enviar prompt"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
