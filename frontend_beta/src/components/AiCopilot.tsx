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
    sprintBacklogApi, testTasksApi, observationLogsApi
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
    const { activePlanId, activePlan, refreshGates } = usePlan()
    const { addToast } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)

    const [selectedTasksState, setSelectedTasksState] = useState<Record<string, boolean>>({})

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
            const contextData = await fetchContextData()

            // Interceptor del lado del cliente para no gastar tokens si no hay datos de usabilidad suficientes
            const findingsArr = (contextData as any).findings || []
            const obsLogsArr = (contextData as any).observationLogs || []
            const hasUsabilityData = findingsArr.length > 0 || obsLogsArr.length > 0

            const isRequestingBacklog = location.pathname.includes('/backlog') || 
                                         text.toLowerCase().includes('backlog') || 
                                         text.toLowerCase().includes('historia') ||
                                         text.toLowerCase().includes('generar')

            if (isRequestingBacklog && !hasUsabilityData) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        sender: 'ai',
                        text: '⚠️ **Copiloto de Usabilidad:** No hay información de usabilidad suficiente registrada en este plan. Se requiere registrar al menos una observación incidental en las sesiones de prueba o un hallazgo sintetizado para poder estructurar el Sprint Backlog. Por favor, registra observaciones para los participantes en sus sesiones primero.'
                    }
                ])
                setLoading(false)
                return
            }

            // 2. Query Gemini through backend secure proxy
            const aiRawText = await queryGemini(text, contextData)

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

                return {
                    id: usId,
                    title: story.title || `Historia de Usabilidad ${usId}`,
                    description: story.description,
                    priority: story.priority || 'Alta',
                    origen_hallazgo: story.origen_hallazgo || 'Copiloto IA - Sugerencia Contextual',
                    acceptanceCriteria: story.acceptanceCriteria || [],
                    technicalTasks
                }
            })

            backlogData.userStories = [...backlogData.userStories, ...newStories]

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

            // 5. Mark as inserted in state
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, inserted: true } : m))
            addToast(`¡${newStories.length} Historia(s) integrada(s) con éxito al Backlog!`, 'success')
            window.dispatchEvent(new CustomEvent('backlog-updated', { detail: { backlogData } }))
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
