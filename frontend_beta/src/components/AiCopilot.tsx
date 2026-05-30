import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Sparkles, Send, X, Brain, PlusCircle, CheckCircle2,
    ClipboardList, HelpCircle, Settings,
    FileText, ShieldAlert, Users, LayoutDashboard, ArrowRight
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import { useToast } from '../App'
import {
    findingsApi, testSessionsApi, moderatorScriptsApi,
    sprintBacklogApi, testTasksApi
} from '../api'

const API_KEY_STORAGE_KEY = 'gemini_user_api_key'

interface ChatMessage {
    id: number
    sender: 'user' | 'ai'
    text: string
    isAction?: boolean
    actionData?: {
        stories: Array<{
            title: string
            description: string
            priority: string
            acceptanceCriteria: string[]
            technicalTasks: Array<{ title: string; estimatedHours: number }>
        }>
    }
    inserted?: boolean
}

export default function AiCopilot() {
    const location = useLocation()
    const { activePlanId, activePlan, refreshGates } = usePlan()
    const { addToast } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [userApiKey, setUserApiKey] = useState('')
    const [isKeySetup, setIsKeySetup] = useState(false)
    const [inputApiKey, setInputApiKey] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load stored key and set initial greeting
    useEffect(() => {
        const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
        if (savedKey) {
            setUserApiKey(savedKey)
            setIsKeySetup(true)
        }

        // Initial Greeting
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
                    '💡 Sugerir tareas técnicas adicionales para mis historias'
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

    // Handle key setup
    const handleSaveApiKey = () => {
        if (!inputApiKey.trim()) {
            addToast('Por favor, ingresa una API Key válida', 'error')
            return
        }
        localStorage.setItem(API_KEY_STORAGE_KEY, inputApiKey.trim())
        setUserApiKey(inputApiKey.trim())
        setIsKeySetup(true)
        addToast('Gemini API Key configurada con éxito', 'success')
        
        // Add follow-up AI message
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: 'ai',
                text: '🚀 **¡API Key configurada!** Ahora puedo acceder al modelo Gemini 2.5 Flash en tiempo real. \n\nSelecciona cualquiera de las sugerencias rápidas abajo o escríbeme una consulta contextual.'
            }
        ])
    }

    const handleDisconnectKey = () => {
        localStorage.removeItem(API_KEY_STORAGE_KEY)
        setUserApiKey('')
        setIsKeySetup(false)
        setInputApiKey('')
        addToast('API Key desconectada', 'success')
    }

    // Call Gemini API directly
    const queryGemini = async (prompt: string, planData: any) => {
        const activePageName = contextMeta.name
        const pathname = location.pathname

        const systemPrompt = `
Eres Copiloto IA, el asistente inteligente y experto en Ingeniería de Software e Interacción Humano-Computador (IHC) para el "Usability Test Dashboard".
Tu objetivo es ayudar al usuario a analizar sus pruebas de usabilidad y planificar el desarrollo ágil alimentando el Sprint Backlog de forma orgánica.

CONTEXTO ACTUAL DEL USUARIO:
- Proyecto evaluado: ${activePlan ? activePlan.projectName : 'Sin plan activo'}
- Pantalla actual en la que navega el usuario: ${activePageName} (Ruta: ${pathname})
- Datos registrados en esta pantalla:
${JSON.stringify(planData, null, 2)}

INSTRUCCIONES DE RESPUESTA:
1. Responde a la consulta del usuario de manera técnica, profesional y concisa (máximo 3 párrafos).
2. Si propones agregar historias de usuario específicas para corregir fallos o mejorar la usabilidad, redacta historias bien formadas ("Como... quiero... para...") y divídelas en tareas técnicas y criterios de aceptación.
3. Para permitir que el usuario las integre instantáneamente a su backlog sin tener que transcribirlas, si tu respuesta propone historias de usuario concretas para el Sprint Backlog, debes adjuntar AL FINAL de tu respuesta un bloque especial JSON delimitado exactamente por las etiquetas \`[BACKLOG_ACTION]\` y \`[/BACKLOG_ACTION]\`. No incluyas marcas markdown de código (\`\`\`json) dentro de este bloque especial. Formato:

[BACKLOG_ACTION]
{
  "stories": [
    {
      "title": "Optimizar el menú de hamburguesa móvil",
      "description": "Como usuario móvil quiero un botón de menú con área de contacto de al menos 44px para navegar sin cometer errores táctiles.",
      "priority": "Alta",
      "acceptanceCriteria": [
        "El botón de menú hamburguesa tiene dimensiones de al menos 44x44px.",
        "Se puede interactuar fluidamente usando navegación por teclado."
      ],
      "technicalTasks": [
        { "title": "Refactorizar CSS de .layout-hamburger para Ley de Fitts", "estimatedHours": 3 },
        { "title": "Implementar focus trap en menú colapsable", "estimatedHours": 5 }
      ]
    }
  ]
}
[/BACKLOG_ACTION]

4. Mantén tus respuestas textuales bellamente redactadas en Markdown (con listas, negritas y encabezados).
`

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey}`
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        { text: `Consulta del usuario:\n${prompt}` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            throw new Error(errData?.error?.message || `HTTP ${response.status} Error`)
        }

        const resData = await response.json()
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
            throw new Error('El modelo de lenguaje devolvió una respuesta vacía.')
        }

        return text
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
                const [sessionsRes, tasksRes] = await Promise.all([
                    testSessionsApi.getAll(activePlanId),
                    testTasksApi.getByPlan(activePlanId)
                ])
                return {
                    sessions: sessionsRes.data || [],
                    tasksCount: (tasksRes.data || []).length
                }
            }
            if (path.includes('/guion')) {
                const res = await moderatorScriptsApi.getByPlan(activePlanId)
                return res.data || {}
            }
            if (path.includes('/backlog')) {
                const res = await sprintBacklogApi.getByPlan(activePlanId)
                return res.data || {}
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

            // 2. Query Gemini
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
                    text: `❌ **Error del Asistente:** ${err.message || 'No se pudo establecer conexión con la IA. Por favor, verifica tu API Key y conexión a internet.'}`
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
                    md += `### [${us.id}] ${us.title}\n`;
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
            refreshGates()
        } catch (err) {
            console.error(err)
            addToast('Error al insertar historias en el backlog', 'error')
        }
    }

    // Helper to render markdown simply
    const renderMessageText = (text: string) => {
        // Simple regex-based markdown renderer
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
                        {/* ── Key Setup Area if no Gemini Key ── */}
                        {!isKeySetup ? (
                            <div className="copilot-setup">
                                <ShieldAlert size={36} style={{ color: 'var(--color-warning)' }} />
                                <h4 className="copilot-setup-title">Activar Asistente de IA</h4>
                                <p>
                                    Este asistente utiliza **Gemini 2.5 Flash** para leer el contexto de tus pantallas en tiempo real y sugerir historias de usuario directas.
                                </p>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    Introduce tu API Key de Google. Es 100% gratuita y se almacena únicamente en tu navegador de forma local.
                                </p>
                                <a
                                    href="https://aistudio.google.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="copilot-setup-link"
                                >
                                    Obtener API Key gratis <ArrowRight size={12} />
                                </a>
                                <input
                                    type="password"
                                    placeholder="AIzaSy..."
                                    className="copilot-setup-input"
                                    value={inputApiKey}
                                    onChange={(e) => setInputApiKey(e.target.value)}
                                />
                                <button
                                    onClick={handleSaveApiKey}
                                    className="copilot-setup-save-btn"
                                >
                                    Conectar Asistente
                                </button>
                            </div>
                        ) : (
                            <>
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
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="copilot-loading">
                                            <Sparkles size={12} className="sprint-spin" />
                                            <span>Copiloto analizando pantalla...</span>
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
                                    <button
                                        onClick={handleDisconnectKey}
                                        className="copilot-close"
                                        title="Desconectar API Key"
                                        style={{ padding: '8px' }}
                                    >
                                        <Settings size={14} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
