import { useEffect, useState } from 'react'
import { sprintBacklogApi, testTasksApi, moderatorScriptsApi, testSessionsApi, findingsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import {
    Sparkles, Save, FileText, Printer, Plus, Trash2,
    AlertCircle, Cpu, CheckSquare, Layers,
    Hourglass, ClipboardList, ChevronDown,
    Database, BookOpen, Users, Search,
    ArrowUp, ArrowDown, Clock, CheckCircle2,
    Timer, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import Modal from '../components/Modal'

interface TechnicalTask {
    id: string
    title: string
    estimatedHours: number
}

interface UserStory {
    id: string
    title: string
    description: string
    priority: string // 'Alta' | 'Media' | 'Baja'
    acceptanceCriteria: string[]
    technicalTasks: TechnicalTask[]
    origen_hallazgo?: string
}

interface BacklogData {
    sprintName: string
    sprintGoal: string
    userStories: UserStory[]
}

/** Metadata about the data sources consumed during generation */
interface SourcesMetadata {
    tasksCount: number
    scriptExists: boolean
    sessionsCount: number
    findingsCount: number
    findingsCritical: number
    findingsMajor: number
    findingsMinor: number
}

export default function SprintBacklog() {
    const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()
    const { addToast } = useToast()

    const [loading, setLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [backlogData, setBacklogData] = useState<BacklogData | null>(null)
    const [backlogMeta, setBacklogMeta] = useState<{ createdAt?: string; updatedAt?: string }>({})

    // Sources panel
    const [sourcesData, setSourcesData] = useState<SourcesMetadata | null>(null)
    const [showSources, setShowSources] = useState(true)

    // Setup panel toggle
    const [showSetupPanel, setShowSetupPanel] = useState(true)

    // Traceability lists and active modal states
    const [findingsList, setFindingsList] = useState<any[]>([])
    const [selectedFinding, setSelectedFinding] = useState<any | null>(null)

    // Cascading loader step state
    const [generatingStep, setGeneratingStep] = useState(0)

    // Cascading generating steps timer (dynamic HCI loader)
    useEffect(() => {
        if (!isGenerating) {
            setGeneratingStep(0)
            return
        }
        const interval = setInterval(() => {
            setGeneratingStep(prev => (prev < 2 ? prev + 1 : 2))
        }, 3000)
        return () => clearInterval(interval)
    }, [isGenerating])

    // Load active plan backlog on plan changes
    useEffect(() => {
        if (activePlanId) {
            loadBacklog(activePlanId)
            loadSourcesMetadata(activePlanId)
        } else {
            setLoading(false)
        }
    }, [activePlanId])

    /** Fetch counts from each data source to display in the Sources panel */
    const loadSourcesMetadata = async (planId: string) => {
        try {
            const [tasksRes, scriptRes, sessionsRes, findingsRes] = await Promise.allSettled([
                testTasksApi.getByPlan(planId),
                moderatorScriptsApi.getByPlan(planId),
                testSessionsApi.getAll(planId),
                findingsApi.getByPlan(planId),
            ])

            const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value.data || []) : []
            const script = scriptRes.status === 'fulfilled' ? scriptRes.value.data : null
            const sessions = sessionsRes.status === 'fulfilled' ? (tasksRes.status === 'fulfilled' ? (sessionsRes.value.data || []) : []) : []
            const findings = findingsRes.status === 'fulfilled' ? (findingsRes.value.data || []) : []

            const findingsArr = Array.isArray(findings) ? findings : []
            setFindingsList(findingsArr)

            setSourcesData({
                tasksCount: Array.isArray(tasks) ? tasks.length : 0,
                scriptExists: !!script,
                sessionsCount: Array.isArray(sessions) ? sessions.length : 0,
                findingsCount: findingsArr.length,
                findingsCritical: findingsArr.filter((f: any) => f.severity === 'Critical' || f.severity === 'Crítico' || f.priority === 'High').length,
                findingsMajor: findingsArr.filter((f: any) => f.severity === 'Major' || f.severity === 'Mayor' || f.priority === 'Medium').length,
                findingsMinor: findingsArr.filter((f: any) => f.severity === 'Minor' || f.severity === 'Menor' || f.priority === 'Low').length,
            })
        } catch {
            // Silently fail — the panel just won't show data
        }
    }

    const loadBacklog = async (planId: string) => {
        setLoading(true)
        try {
            const res = await sprintBacklogApi.getByPlan(planId)
            if (res.data && res.data.contentJson) {
                try {
                    const parsed = JSON.parse(res.data.contentJson) as BacklogData
                    setBacklogData(parsed)
                    setBacklogMeta({ createdAt: res.data.createdAt, updatedAt: res.data.updatedAt })
                    setShowSetupPanel(false) // Hide setup panel if backlog already exists
                } catch (e) {
                    console.error("Error parsing contentJson from DB", e)
                    addToast("El backlog guardado contiene un formato no válido. Puedes volver a generarlo.", "error")
                }
            } else {
                setBacklogData(null)
                setShowSetupPanel(true)
            }
        } catch (err: any) {
            // 404 is expected if backlog does not exist yet
            if (err.response?.status === 404) {
                setBacklogData(null)
                setShowSetupPanel(true)
            } else {
                addToast(extractErrorMessage(err, 'Error al cargar el Sprint Backlog'), 'error')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleShowFindingDetail = (origen: string) => {
        if (!origen) return

        const origenLower = origen.toLowerCase()

        // 1. Try exact or substring match in description
        let found = findingsList.find(f => {
            const desc = (f.description || '').toLowerCase()
            return origenLower.includes(desc) || desc.includes(origenLower)
        })

        // 2. Try match by positional ID (e.g., "Hallazgo #1")
        if (!found) {
            const match = origen.match(/Hallazgo\s*#?\s*(\d+)/i)
            if (match && match[1]) {
                const index = parseInt(match[1]) - 1
                if (index >= 0 && index < findingsList.length) {
                    found = findingsList[index]
                }
            }
        }

        if (found) {
            setSelectedFinding({
                type: 'finding',
                title: origen,
                description: found.description,
                severity: found.severity || found.priority || 'Media',
                recommendation: found.recommendation || 'No hay recomendaciones de IHC registradas para este hallazgo.',
                tool: found.tool || 'Evaluación de Usabilidad',
                category: found.category || 'General'
            })
        } else {
            // Fallback generic card for task or Consolidated AI finding
            setSelectedFinding({
                type: 'generic',
                title: origen.startsWith('🔍') ? origen : `🔍 ${origen}`,
                description: 'Esta historia de usuario fue diseñada de forma inteligente analizando la sinergia general del plan de pruebas, guión del moderador y sesiones registradas.',
                recommendation: 'Aplicar estándares heurísticos de interacción humano-computador correspondientes a este flujo.',
                severity: 'Informativo',
                tool: 'Motor de IA de Usabilidad'
            })
        }
    }

    const handleGenerate = async (useAI: boolean) => {
        if (!activePlanId) {
            addToast('Debes seleccionar un plan de prueba activo', 'error')
            return
        }

        setIsGenerating(true)
        try {
            addToast(useAI ? 'Analizando datos y generando con IA (Gemini 2.5 Flash)...' : 'Generando backlog estructurado con el Motor Local...', 'success')

            const reqData = {
                testPlanId: activePlanId,
                userApiKey: undefined // Proxy handles environment key securely at server side
            }

            const res = await sprintBacklogApi.generate(reqData)

            if (res.data && res.data.contentJson) {
                const parsed = JSON.parse(res.data.contentJson) as BacklogData
                setBacklogData(parsed)
                setShowSetupPanel(false)
                addToast('¡Sprint Backlog generado exitosamente!', 'success')

                // Auto-save the initial draft
                await handleSaveDraft(parsed)
                refreshGates()
            } else {
                throw new Error('La respuesta del servidor no tiene un formato válido.')
            }
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al generar el Sprint Backlog'), 'error')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveDraft = async (dataToSave: BacklogData = backlogData!) => {
        if (!activePlanId || !dataToSave) return
        setIsSaving(true)
        setSaveSuccess(false)
        try {
            const markdown = generateMarkdownContent(dataToSave)
            const contentJson = JSON.stringify(dataToSave)

            const res = await sprintBacklogApi.save(activePlanId, {
                sprintName: dataToSave.sprintName,
                sprintGoal: dataToSave.sprintGoal,
                contentJson,
                rawMarkdown: markdown
            })

            // Update timestamps from server response
            if (res.data) {
                setBacklogMeta({ createdAt: res.data.createdAt, updatedAt: res.data.updatedAt })
            }

            addToast('Borrador del Sprint Backlog guardado en el servidor', 'success')
            refreshGates()

            // Visual confirmation on button
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2500)
        } catch (err) {
            addToast(extractErrorMessage(err, 'Error al guardar el Sprint Backlog'), 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // --- Inline Editors ---
    const handleUpdateSprintField = (field: 'sprintName' | 'sprintGoal', value: string) => {
        if (!backlogData) return
        setBacklogData({
            ...backlogData,
            [field]: value
        })
    }

    const handleUpdateStoryField = (storyIndex: number, field: keyof UserStory, value: any) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex] = {
            ...updatedStories[storyIndex],
            [field]: value
        }
        setBacklogData({
            ...backlogData,
            userStories: updatedStories
        })
    }

    // Acceptance Criteria operations
    const handleAddCriterion = (storyIndex: number) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex].acceptanceCriteria.push('')
        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    const handleUpdateCriterion = (storyIndex: number, criterionIndex: number, value: string) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex].acceptanceCriteria[criterionIndex] = value
        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    const handleDeleteCriterion = (storyIndex: number, criterionIndex: number) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex].acceptanceCriteria.splice(criterionIndex, 1)
        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    // Technical Tasks operations
    const handleAddTask = (storyIndex: number) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        const storyId = updatedStories[storyIndex].id
        const taskNum = updatedStories[storyIndex].technicalTasks.length + 1

        updatedStories[storyIndex].technicalTasks.push({
            id: `TA-${storyId.split('-')[1] || storyIndex + 1}.${taskNum}`,
            title: '',
            estimatedHours: 4
        })
        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    const handleUpdateTaskField = (storyIndex: number, taskIndex: number, field: keyof TechnicalTask, value: any) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex].technicalTasks[taskIndex] = {
            ...updatedStories[storyIndex].technicalTasks[taskIndex],
            [field]: value
        }
        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    const handleDeleteTask = (storyIndex: number, taskIndex: number) => {
        if (!backlogData) return
        const updatedStories = [...backlogData.userStories]
        updatedStories[storyIndex].technicalTasks.splice(taskIndex, 1)

        // Re-index tasks for clean output IDs
        const storyId = updatedStories[storyIndex].id
        updatedStories[storyIndex].technicalTasks = updatedStories[storyIndex].technicalTasks.map((t, idx) => ({
            ...t,
            id: `TA-${storyId.split('-')[1] || storyIndex + 1}.${idx + 1}`
        }))

        setBacklogData({ ...backlogData, userStories: updatedStories })
    }

    // Global Story operations
    const handleAddStory = () => {
        if (!backlogData) return
        const nextIndex = backlogData.userStories.length + 1
        const newStory: UserStory = {
            id: `US-${nextIndex}`,
            title: 'Nueva Historia de Usuario',
            description: 'Como [rol], quiero [acción] para [beneficio]',
            priority: 'Media',
            acceptanceCriteria: ['El flujo debe realizarse sin bloqueos ni errores de usabilidad.'],
            technicalTasks: [
                { id: `TA-${nextIndex}.1`, title: 'Rediseñar interfaz siguiendo criterios IHC', estimatedHours: 4 },
                { id: `TA-${nextIndex}.2`, title: 'Implementar código frontend y backend', estimatedHours: 6 }
            ]
        }
        setBacklogData({
            ...backlogData,
            userStories: [...backlogData.userStories, newStory]
        })
        addToast('Nueva Historia de Usuario agregada al borrador', 'success')
    }

    const handleDeleteStory = (storyIndex: number) => {
        if (!backlogData) return
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta Historia de Usuario del backlog?')) return

        const updatedStories = backlogData.userStories.filter((_, idx) => idx !== storyIndex)
            // Re-index stories for clean serial IDs
            .map((us, idx) => {
                const nextId = `US-${idx + 1}`
                return {
                    ...us,
                    id: nextId,
                    technicalTasks: us.technicalTasks.map((t, tIdx) => ({
                        ...t,
                        id: `TA-${idx + 1}.${tIdx + 1}`
                    }))
                }
            })

        setBacklogData({
            ...backlogData,
            userStories: updatedStories
        })
        addToast('Historia de Usuario eliminada', 'success')
    }

    // Reorder stories
    const handleMoveStory = (storyIndex: number, direction: 'up' | 'down') => {
        if (!backlogData) return
        const stories = [...backlogData.userStories]
        const targetIndex = direction === 'up' ? storyIndex - 1 : storyIndex + 1
        if (targetIndex < 0 || targetIndex >= stories.length) return

        // Swap
        ;[stories[storyIndex], stories[targetIndex]] = [stories[targetIndex], stories[storyIndex]]

        // Re-index IDs
        const reindexed = stories.map((us, idx) => ({
            ...us,
            id: `US-${idx + 1}`,
            technicalTasks: us.technicalTasks.map((t, tIdx) => ({
                ...t,
                id: `TA-${idx + 1}.${tIdx + 1}`
            }))
        }))

        setBacklogData({ ...backlogData, userStories: reindexed })
    }

    // Format date for display
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null
        try {
            return new Date(dateStr).toLocaleString('es-ES', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        } catch { return null }
    }

    // --- Export Utilities ---
    const generateMarkdownContent = (data: BacklogData) => {
        let md = `# Sprint Backlog: ${data.sprintName}\n\n`
        md += `**Meta del Sprint (Sprint Goal):**\n`
        md += `> ${data.sprintGoal}\n\n`
        md += `---\n\n`
        md += `## Historias de Usuario e Incremento del Product Backlog\n\n`

        data.userStories.forEach(us => {
            md += `### 📋 [${us.id}] ${us.title}\n\n`
            md += `**Descripción:**\n`
            md += `\`${us.description}\`\n\n`
            md += `* **Prioridad:** ${us.priority}\n\n`

            md += `**Criterios de Aceptación:**\n`
            us.acceptanceCriteria.forEach(ac => {
                md += `- [ ] ${ac}\n`
            })
            md += `\n`

            md += `**Tareas Técnicas y Estimaciones:**\n`
            md += `| ID Tarea | Descripción de la Tarea Técnica | Esfuerzo Estimado |\n`
            md += `| :--- | :--- | :--- |\n`
            us.technicalTasks.forEach(task => {
                md += `| ${task.id} | ${task.title} | ${task.estimatedHours} horas |\n`
            })
            md += `\n---\n\n`
        })

        return md
    }

    const handleExportMarkdown = () => {
        if (!backlogData) return
        const content = generateMarkdownContent(backlogData)
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        // Clean filename
        const sanitizedName = backlogData.sprintName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        link.href = url
        link.setAttribute('download', `Sprint_Backlog_${sanitizedName || 'Plan'}.md`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addToast('Archivo Markdown descargado con éxito', 'success')
    }

    const handlePrintPDF = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="sprint-loading" aria-live="polite">
                <div className="sprint-loading-spinner"></div>
                <p className="sprint-loading-text">Cargando borrador del Sprint Backlog...</p>
            </div>
        )
    }

    if (!activePlanId) {
        return (
            <div className="empty-state-card" style={{ maxWidth: 600, margin: 'var(--space-6) auto' }} role="alert">
                <AlertCircle className="empty-state-icon" size={64} style={{ color: 'var(--color-warning)' }} />
                <h2 className="empty-state-title">Falta Plan de Pruebas Activo</h2>
                <p className="empty-state-subtitle" style={{ maxWidth: 400, margin: 'var(--space-2) auto var(--space-4)' }}>
                    Para utilizar este módulo, debes seleccionar un plan de pruebas en el selector de la barra superior.
                    El backlog se compilará automáticamente analizando las tareas, guiones, sesiones y hallazgos asociados a dicho plan.
                </p>
            </div>
        )
    }

    const totalHours = backlogData?.userStories.reduce(
        (total, us) => total + us.technicalTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        0
    ) || 0

    return (
        <div className="page-container" style={{ paddingBottom: 'var(--space-10)' }}>

            {/* PRINT-ONLY VIEWPORT: Renders absolutely beautiful clean tables with academic headers for PDF */}
            <div className="sprint-print-preview">
                <div className="sprint-print-header">
                    <p className="sprint-print-institution">
                        Universidad - Ingeniería de Software
                    </p>
                    <p className="sprint-print-course">
                        Asignatura: Interacción Humano Computador (IHC) - Quinto Semestre
                    </p>
                    <h1 className="sprint-print-doc-title">
                        Reporte de Sprint Backlog de Usabilidad
                    </h1>
                    <p className="sprint-print-metadata">
                        Generado automáticamente asistido por IA - Caso: {activePlan?.projectName}
                    </p>
                </div>

                <div className="sprint-print-meta-grid">
                    <div>
                        <p><strong>Proyecto Evaluado:</strong> {activePlan?.projectName}</p>
                        <p><strong>Producto:</strong> {activePlan?.product}</p>
                        <p><strong>Módulo Evaluado:</strong> {activePlan?.evaluatedModule}</p>
                    </div>
                    <div className="sprint-print-meta-col-right">
                        <p><strong>Sprint:</strong> {backlogData?.sprintName}</p>
                        <p><strong>Esfuerzo Total:</strong> {totalHours} horas estimadas</p>
                        <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                    </div>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 className="sprint-print-section-title">Meta del Sprint (Sprint Goal)</h2>
                    <p className="sprint-print-goal-blockquote">
                        "{backlogData?.sprintGoal}"
                    </p>
                </div>

                <h2 className="sprint-print-section-title">Incremento y Planificación Ágil</h2>

                {backlogData?.userStories.map((us) => (
                    <div key={us.id} className="sprint-print-story">
                        <h3 className="sprint-print-story-title">
                            📋 [{us.id}] {us.title} <span className="sprint-print-priority-label">({us.priority === 'Alta' ? 'Prioridad Alta' : us.priority === 'Media' ? 'Prioridad Media' : 'Prioridad Baja'})</span>
                        </h3>
                        <p className="sprint-print-story-desc">
                            {us.description}
                        </p>

                        <div className="sprint-print-story-columns">
                            <div>
                                <h4 className="sprint-print-sub-header">Criterios de Aceptación</h4>
                                <ul className="sprint-print-crit-list">
                                    {us.acceptanceCriteria.map((ac, idx) => (
                                        <li key={idx}>{ac}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="sprint-print-sub-header">Tareas Técnicas</h4>
                                <table className="sprint-print-table">
                                    <thead>
                                        <tr>
                                            <th className="sprint-print-table-id">ID</th>
                                            <th>Descripción</th>
                                            <th className="sprint-print-table-hours">Esfuerzo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {us.technicalTasks.map((task) => (
                                            <tr key={task.id}>
                                                <td className="sprint-print-table-id">{task.id}</td>
                                                <td>{task.title}</td>
                                                <td className="sprint-print-table-hours">{task.estimatedHours} horas</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="sprint-print-story-divider" />
                    </div>
                ))}
            </div>

            {/* WEB VIEWPORT (Visible on screen, hidden on print) */}
            <div className="print:hidden sprint-editor-board" style={{ position: 'relative' }}>

                {/* Unified AI cascading loader screen */}
                {isGenerating && (
                    <div className="sprint-generating-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.88)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 99,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--space-6)',
                        color: 'white',
                        minHeight: '400px'
                    }}>
                        <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
                            <div className="sprint-loading-spinner" style={{ width: 64, height: 64, borderWidth: '3px', borderBottomColor: '#6366f1' }}></div>
                            <Sparkles size={24} style={{ color: '#818cf8', position: 'absolute', top: '20px', left: '20px', animation: 'pulse 1.5s infinite' }} />
                        </div>

                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
                            Procesando en cascada con Copiloto de IA
                        </h3>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-400)', marginBottom: 'var(--space-6)', maxWidth: '320px', textAlign: 'center' }}>
                            Consolidando base de datos del plan para estructurar tu Sprint Backlog ergonómico...
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', maxWidth: '340px', background: 'rgba(255, 255, 255, 0.03)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <div className={`cascading-step ${generatingStep === 0 ? 'cascading-step--active' : generatingStep > 0 ? 'cascading-step--done' : 'cascading-step--pending'}`}>
                                <div className={`cascading-dot ${generatingStep === 0 ? 'cascading-dot--active' : generatingStep > 0 ? 'cascading-dot--done' : 'cascading-dot--pending'}`} />
                                <span>{generatingStep > 0 ? '✓ Sesiones analizadas con éxito' : '🔍 Analizando sesiones de prueba y métricas...'}</span>
                            </div>

                            <div className={`cascading-step ${generatingStep === 1 ? 'cascading-step--active' : generatingStep > 1 ? 'cascading-step--done' : 'cascading-step--pending'}`}>
                                <div className={`cascading-dot ${generatingStep === 1 ? 'cascading-dot--active' : generatingStep > 1 ? 'cascading-dot--done' : 'cascading-dot--pending'}`} />
                                <span>{generatingStep > 1 ? '✓ Hallazgos de usabilidad identificados' : '📂 Identificando hallazgos críticos de usabilidad...'}</span>
                            </div>

                            <div className={`cascading-step ${generatingStep === 2 ? 'cascading-step--active' : 'cascading-step--pending'}`}>
                                <div className={`cascading-dot ${generatingStep === 2 ? 'cascading-dot--active' : 'cascading-dot--pending'}`} />
                                <span>🧠 Estructurando historias de usuario y tareas con Gemini...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="sprint-page-header">
                    <div className="sprint-header-info">
                        <h2 className="sprint-header-title">
                            <Sparkles size={24} style={{ color: 'var(--color-primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            Generación de Sprint Backlog Asistido por IA
                        </h2>
                        <p className="sprint-header-subtitle">
                            Consolida la información de Plan, Guía, Sesiones y Hallazgos para generar un Backlog de Sprint accionable.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowSetupPanel(!showSetupPanel)}
                        className={`btn btn-secondary ${showSetupPanel ? 'btn-secondary--active' : ''}`}
                        style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                    >
                        <Cpu size={14} />
                        Configurar Generador
                    </button>
                </div>

                {/* AI Configuration and Generation Panel */}
                {showSetupPanel && (
                    <div className="sprint-setup-panel" style={{ maxWidth: '800px', margin: '0 auto var(--space-6)' }}>
                        <div className="sprint-setup-panel-bg-icon">
                            <Sparkles size={120} />
                        </div>

                        <h3 className="sprint-setup-title">
                            <Cpu style={{ color: 'var(--color-primary)' }} size={16} />
                            Generación de Historias asistida por IA
                        </h3>

                        <p className="sprint-setup-description" style={{ marginBottom: 'var(--space-6)' }}>
                            El sistema procesará automáticamente toda la base de datos de tu plan de pruebas actual (los hallazgos de usabilidad y acciones de mejora) para modelar historias de usuario ("Como / Quiero / Para") detalladas y tareas técnicas estimadas utilizando el modelo de lenguaje Google Gemini de forma 100% segura y privada desde el servidor.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <button
                                type="button"
                                onClick={() => handleGenerate(true)}
                                disabled={isGenerating || isReadOnly}
                                className="sprint-btn-generate sprint-btn-generate--ai"
                                style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="sprint-loading-spinner" style={{ width: 16, height: 16, borderBottomColor: 'white', marginRight: 'var(--space-2)' }}></div>
                                        Generando Sprint Backlog con IA...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generar Sprint Backlog con IA
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleGenerate(false)}
                                disabled={isGenerating || isReadOnly}
                                className="sprint-btn-generate sprint-btn-generate--local"
                                style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-xs)' }}
                            >
                                Generar con Motor Local (Heurístico)
                            </button>
                        </div>
                    </div>
                )}

                {/* Backlog Editor Board */}
                {backlogData ? (
                    <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                        {/* Timestamps */}
                        {(backlogMeta.createdAt || backlogMeta.updatedAt) && (
                            <div className="sprint-timestamps">
                                {backlogMeta.createdAt && (
                                    <div className="sprint-timestamp-item">
                                        <Clock size={13} />
                                        <span className="sprint-timestamp-label">Creado:</span>
                                        {formatDate(backlogMeta.createdAt)}
                                    </div>
                                )}
                                {backlogMeta.updatedAt && (
                                    <div className="sprint-timestamp-item">
                                        <Clock size={13} />
                                        <span className="sprint-timestamp-label">Última edición:</span>
                                        {formatDate(backlogMeta.updatedAt)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sources Analyzed Panel */}
                        {sourcesData && (
                            <div className="sprint-sources-panel">
                                <button
                                    type="button"
                                    className="sprint-sources-toggle"
                                    onClick={() => setShowSources(!showSources)}
                                    aria-expanded={showSources}
                                >
                                    <span className="sprint-sources-toggle-left">
                                        <Database size={14} />
                                        Fuentes de Datos Analizadas
                                    </span>
                                    <ChevronDown size={16} className={`sprint-sources-chevron ${showSources ? 'is-open' : ''}`} />
                                </button>

                                {showSources && (
                                    <div className="sprint-sources-grid">
                                        <div className="sprint-source-card">
                                            <div className="sprint-source-icon sprint-source-icon--plan">
                                                <FileText size={16} />
                                            </div>
                                            <div className="sprint-source-info">
                                                <span className="sprint-source-label">Plan de Prueba</span>
                                                <span className="sprint-source-value">{sourcesData.tasksCount} tareas</span>
                                                <span className="sprint-source-detail">Escenarios definidos</span>
                                            </div>
                                        </div>

                                        <div className="sprint-source-card">
                                            <div className="sprint-source-icon sprint-source-icon--guide">
                                                <BookOpen size={16} />
                                            </div>
                                            <div className="sprint-source-info">
                                                <span className="sprint-source-label">Guión</span>
                                                <span className="sprint-source-value">{sourcesData.scriptExists ? 'Registrado' : 'Sin guión'}</span>
                                                <span className="sprint-source-detail">Guía del moderador</span>
                                            </div>
                                        </div>

                                        <div className="sprint-source-card">
                                            <div className="sprint-source-icon sprint-source-icon--sessions">
                                                <Users size={16} />
                                            </div>
                                            <div className="sprint-source-info">
                                                <span className="sprint-source-label">Sesiones</span>
                                                <span className="sprint-source-value">{sourcesData.sessionsCount} sesiones</span>
                                                <span className="sprint-source-detail">Trabajo de campo</span>
                                            </div>
                                        </div>

                                        <div className="sprint-source-card">
                                            <div className="sprint-source-icon sprint-source-icon--findings">
                                                <Search size={16} />
                                            </div>
                                            <div className="sprint-source-info">
                                                <span className="sprint-source-label">Hallazgos</span>
                                                <span className="sprint-source-value">{sourcesData.findingsCount} hallazgos</span>
                                                <span className="sprint-source-detail">
                                                    {sourcesData.findingsCritical > 0 && `${sourcesData.findingsCritical} críticos`}
                                                    {sourcesData.findingsCritical > 0 && sourcesData.findingsMajor > 0 && ' · '}
                                                    {sourcesData.findingsMajor > 0 && `${sourcesData.findingsMajor} mayores`}
                                                    {sourcesData.findingsCount === 0 && 'Sin hallazgos registrados'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* KPI Cards Strip */}
                        <div className="sprint-kpi-strip">
                            <div className="sprint-kpi-card">
                                <div className="sprint-kpi-icon sprint-kpi-icon--stories">
                                    <Layers size={18} />
                                </div>
                                <div className="sprint-kpi-content">
                                    <span className="sprint-kpi-value">{backlogData.userStories.length}</span>
                                    <span className="sprint-kpi-label">Historias</span>
                                </div>
                            </div>
                            <div className="sprint-kpi-card">
                                <div className="sprint-kpi-icon sprint-kpi-icon--hours">
                                    <Timer size={18} />
                                </div>
                                <div className="sprint-kpi-content">
                                    <span className="sprint-kpi-value">{totalHours}h</span>
                                    <span className="sprint-kpi-label">Esfuerzo Total</span>
                                </div>
                            </div>
                            <div className="sprint-kpi-card">
                                <div className="sprint-kpi-icon sprint-kpi-icon--high">
                                    <TrendingUp size={18} />
                                </div>
                                <div className="sprint-kpi-content">
                                    <span className="sprint-kpi-value">{backlogData.userStories.filter(s => s.priority === 'Alta').length}</span>
                                    <span className="sprint-kpi-label">Prioridad Alta</span>
                                </div>
                            </div>
                            <div className="sprint-kpi-card">
                                <div className="sprint-kpi-icon sprint-kpi-icon--medium">
                                    <Minus size={18} />
                                </div>
                                <div className="sprint-kpi-content">
                                    <span className="sprint-kpi-value">{backlogData.userStories.filter(s => s.priority === 'Media').length}</span>
                                    <span className="sprint-kpi-label">Prioridad Media</span>
                                </div>
                            </div>
                            <div className="sprint-kpi-card">
                                <div className="sprint-kpi-icon sprint-kpi-icon--low">
                                    <TrendingDown size={18} />
                                </div>
                                <div className="sprint-kpi-content">
                                    <span className="sprint-kpi-value">{backlogData.userStories.filter(s => s.priority === 'Baja').length}</span>
                                    <span className="sprint-kpi-label">Prioridad Baja</span>
                                </div>
                            </div>
                        </div>

                        {/* Sprint Info Card */}
                        <div className="sprint-def-card">
                            <h3 className="sprint-def-title">
                                <ClipboardList size={14} />
                                Definición del Sprint de Usabilidad
                            </h3>

                            <div className="sprint-def-grid">
                                <div className="sprint-def-field">
                                    <label className="sprint-def-label">
                                        Nombre del Sprint
                                    </label>
                                    <input
                                        type="text"
                                        value={backlogData.sprintName}
                                        onChange={(e) => handleUpdateSprintField('sprintName', e.target.value)}
                                        className="sprint-def-input"
                                        placeholder="Sprint 1 - Optimización ergonómica"
                                        disabled={isReadOnly}
                                    />
                                </div>

                                <div className="sprint-def-field">
                                    <label className="sprint-def-label">
                                        Meta del Sprint (Sprint Goal)
                                    </label>
                                    <input
                                        type="text"
                                        value={backlogData.sprintGoal}
                                        onChange={(e) => handleUpdateSprintField('sprintGoal', e.target.value)}
                                        className="sprint-def-input"
                                        placeholder="Describe el objetivo y los fallos de usabilidad a resolver"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stories Title */}
                        <div className="sprint-stories-header">
                            <h3 className="sprint-stories-title">
                                <Layers size={16} style={{ color: 'var(--color-primary)' }} />
                                Historias de Usuario e Incremento ({backlogData.userStories.length})
                            </h3>

                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={handleAddStory}
                                    className="btn btn-secondary"
                                    style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
                                >
                                    <Plus size={14} />
                                    Añadir Historia
                                </button>
                            )}
                        </div>

                        {/* Stories Loop */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            {backlogData.userStories.map((story, storyIdx) => (
                                <div
                                    key={story.id}
                                    className="sprint-story-card"
                                >

                                    {/* Story Header */}
                                    <div className="sprint-story-header">
                                        {/* Reorder buttons */}
                                        {!isReadOnly && (
                                            <div className="sprint-reorder-group">
                                                <button
                                                    type="button"
                                                    className="sprint-reorder-btn"
                                                    onClick={() => handleMoveStory(storyIdx, 'up')}
                                                    disabled={storyIdx === 0}
                                                    title="Mover arriba"
                                                    aria-label={`Mover ${story.id} hacia arriba`}
                                                >
                                                    <ArrowUp size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="sprint-reorder-btn"
                                                    onClick={() => handleMoveStory(storyIdx, 'down')}
                                                    disabled={storyIdx === backlogData.userStories.length - 1}
                                                    title="Mover abajo"
                                                    aria-label={`Mover ${story.id} hacia abajo`}
                                                >
                                                    <ArrowDown size={12} />
                                                </button>
                                            </div>
                                        )}

                                        <span className="sprint-story-id">
                                            {story.id}
                                        </span>

                                        {story.origen_hallazgo && (
                                            <button
                                                type="button"
                                                onClick={() => handleShowFindingDetail(story.origen_hallazgo!)}
                                                className="sprint-traceability-badge"
                                                title={`Trazabilidad: ${story.origen_hallazgo}. Haz clic para ver detalles del hallazgo.`}
                                            >
                                                🔍 Basado en: {story.origen_hallazgo}
                                            </button>
                                        )}

                                        <div className="sprint-story-title-field">
                                            <input
                                                type="text"
                                                value={story.title}
                                                onChange={(e) => handleUpdateStoryField(storyIdx, 'title', e.target.value)}
                                                className="sprint-story-title-input"
                                                placeholder="Título corto de la historia"
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        <div className="sprint-priority-wrapper">
                                            <label className="sprint-priority-label">Prioridad:</label>
                                            <select
                                                value={story.priority}
                                                onChange={(e) => handleUpdateStoryField(storyIdx, 'priority', e.target.value)}
                                                className={`sprint-priority-select sprint-priority-select--${story.priority === 'Alta' ? 'alta' : story.priority === 'Media' ? 'media' : 'baja'}`}
                                                disabled={isReadOnly}
                                            >
                                                <option value="Alta">Alta</option>
                                                <option value="Media">Media</option>
                                                <option value="Baja">Baja</option>
                                            </select>
                                        </div>

                                        {/* Delete story button */}
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteStory(storyIdx)}
                                                className="sprint-story-delete-btn"
                                                title="Eliminar Historia de Usuario"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Story description body */}
                                    <div className="sprint-story-desc-field">
                                        <label className="sprint-story-desc-label">
                                            Descripción (Como / Quiero / Para)
                                        </label>
                                        <textarea
                                            value={story.description}
                                            onChange={(e) => handleUpdateStoryField(storyIdx, 'description', e.target.value)}
                                            rows={2}
                                            className="sprint-story-desc-textarea"
                                            placeholder="Como [rol], quiero [acción] para [beneficio]..."
                                            disabled={isReadOnly}
                                        />
                                    </div>

                                    <div className="sprint-columns-grid">

                                        {/* Column 1: Acceptance Criteria */}
                                        <div className="sprint-col-section">
                                            <div className="sprint-col-header">
                                                <h4 className="sprint-col-title">
                                                    <CheckSquare size={13} style={{ color: 'var(--text-light)' }} />
                                                    Criterios de Aceptación
                                                </h4>
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddCriterion(storyIdx)}
                                                        className="sprint-col-btn-add"
                                                    >
                                                        <Plus size={10} /> Añadir
                                                    </button>
                                                )}
                                            </div>

                                            <div className="sprint-items-list">
                                                {story.acceptanceCriteria.map((criterion, crtIdx) => (
                                                    <div key={crtIdx} className="sprint-crit-item">
                                                        <span className="sprint-crit-number">{crtIdx + 1}.</span>
                                                        <input
                                                            type="text"
                                                            value={criterion}
                                                            onChange={(e) => handleUpdateCriterion(storyIdx, crtIdx, e.target.value)}
                                                            className="sprint-crit-input"
                                                            placeholder="Ej. El usuario no debe cometer errores en este campo."
                                                            disabled={isReadOnly}
                                                        />
                                                        {!isReadOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteCriterion(storyIdx, crtIdx)}
                                                                className="sprint-crit-delete-btn"
                                                                title="Eliminar criterio"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {story.acceptanceCriteria.length === 0 && (
                                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 'var(--font-size-xs)' }}>Sin criterios de aceptación declarados.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2: Technical Tasks and Estimates */}
                                        <div className="sprint-col-section">
                                            <div className="sprint-col-header">
                                                <h4 className="sprint-col-title">
                                                    <Hourglass size={13} style={{ color: 'var(--text-light)' }} />
                                                    Tareas Técnicas y Horas
                                                </h4>
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddTask(storyIdx)}
                                                        className="sprint-col-btn-add"
                                                    >
                                                        <Plus size={10} /> Añadir
                                                    </button>
                                                )}
                                            </div>

                                            <div className="sprint-items-list">
                                                {story.technicalTasks.map((task, taskIdx) => (
                                                    <div key={task.id} className="sprint-task-item">
                                                        <span className="sprint-task-badge">
                                                            {task.id}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={task.title}
                                                            onChange={(e) => handleUpdateTaskField(storyIdx, taskIdx, 'title', e.target.value)}
                                                            className="sprint-task-input"
                                                            placeholder="Ej. Rediseñar modal ergonómico"
                                                            disabled={isReadOnly}
                                                        />

                                                        <div className="sprint-task-hours-wrapper">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={100}
                                                                value={task.estimatedHours}
                                                                onChange={(e) => handleUpdateTaskField(storyIdx, taskIdx, 'estimatedHours', parseInt(e.target.value) || 0)}
                                                                className="sprint-task-hours-input"
                                                                disabled={isReadOnly}
                                                            />
                                                            <span className="sprint-task-hours-label">h</span>
                                                        </div>

                                                        {!isReadOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteTask(storyIdx, taskIdx)}
                                                                className="sprint-crit-delete-btn"
                                                                title="Eliminar tarea"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {story.technicalTasks.length === 0 && (
                                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 'var(--font-size-xs)' }}>Sin tareas técnicas asociadas.</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Big Save & Export Banner */}
                        <div className="sprint-summary-banner">
                            <div className="sprint-summary-info">
                                <p className="sprint-summary-subtitle">Sprint Resumen</p>
                                <h4 className="sprint-summary-title">
                                    Backlog del Sprint: <span className="sprint-summary-highlight">{backlogData.sprintName}</span>
                                </h4>
                                <p className="sprint-summary-desc">
                                    Se estimaron <strong style={{ color: 'var(--white)' }}>{totalHours} horas</strong> de esfuerzo técnico distribuidas en <strong style={{ color: 'var(--white)' }}>{backlogData.userStories.length} historias</strong>.
                                </p>
                            </div>

                            <div className="sprint-summary-actions">
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => handleSaveDraft()}
                                        disabled={isSaving || saveSuccess}
                                        className={`sprint-summary-actions-btn ${saveSuccess ? 'sprint-summary-actions-btn--saved' : 'sprint-summary-actions-btn--save'}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="sprint-loading-spinner" style={{ width: 12, height: 12, borderBottomColor: 'white' }}></div>
                                                Guardando...
                                            </>
                                        ) : saveSuccess ? (
                                            <>
                                                <CheckCircle2 size={14} />
                                                ✓ Guardado
                                            </>
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                Guardar Borrador
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleExportMarkdown}
                                    className="sprint-summary-actions-btn sprint-summary-actions-btn--export"
                                >
                                    <FileText size={14} />
                                    Exportar .md
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrintPDF}
                                    className="sprint-summary-actions-btn sprint-summary-actions-btn--print"
                                >
                                    <Printer size={14} />
                                    Imprimir PDF
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="sprint-empty-state">
                        <ClipboardList className="sprint-empty-state-icon" />
                        <h3 className="sprint-empty-state-title">Ningún borrador creado aún</h3>
                        <p className="sprint-empty-state-subtitle">
                            El plan "{activePlan?.projectName}" no cuenta con un backlog de sprint. Genera de forma automática un borrador detallado asistido por Inteligencia Artificial analizando la base de datos de tu plan actual de forma segura.
                        </p>

                        <button
                            onClick={() => {
                                setShowSetupPanel(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn btn-primary"
                            style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-xs)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                            <Sparkles size={14} />
                            Generar Borrador Asistido por IA
                        </button>
                    </div>
                )}

            </div>

            {/* Traceability Details Popover Modal */}
            <Modal
                isOpen={!!selectedFinding}
                onClose={() => setSelectedFinding(null)}
                title={selectedFinding?.title || 'Origen de la Historia de Usuario'}
                maxWidth="550px"
            >
                {selectedFinding && (
                    <div className="traceability-modal-grid">
                        <div className="traceability-modal-section">
                            <span className="traceability-modal-label">Tipo de Origen</span>
                            <span className="traceability-modal-value">
                                {selectedFinding.type === 'finding' ? '🔍 Hallazgo de Usabilidad de Origen' : '⚡ Análisis de Consolidación de Plan'}
                            </span>
                        </div>

                        <div className="traceability-modal-section">
                            <span className="traceability-modal-label">Descripción / Detalle</span>
                            <p className="traceability-modal-value" style={{ fontStyle: 'italic', background: 'var(--neutral-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: 'var(--space-1) 0' }}>
                                "{selectedFinding.description}"
                            </p>
                        </div>

                        {selectedFinding.severity && (
                            <div className="traceability-modal-section">
                                <span className="traceability-modal-label">Severidad / Prioridad</span>
                                <div style={{ marginTop: '4px' }}>
                                    <span className={`traceability-severity-badge ${
                                        selectedFinding.severity.toLowerCase().includes('crit') ? 'traceability-severity--critical' :
                                        selectedFinding.severity.toLowerCase().includes('may') || selectedFinding.severity.toLowerCase().includes('maj') || selectedFinding.severity.toLowerCase().includes('high') ? 'traceability-severity--major' :
                                        'traceability-severity--minor'
                                    }`}>
                                        {selectedFinding.severity}
                                    </span>
                                </div>
                            </div>
                        )}

                        {selectedFinding.tool && (
                            <div className="traceability-modal-section">
                                <span className="traceability-modal-label">Herramienta de Diagnóstico</span>
                                <span className="traceability-modal-value" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                    {selectedFinding.tool}
                                </span>
                            </div>
                        )}

                        <div className="traceability-modal-section">
                            <span className="traceability-modal-label">Recomendación / Criterio IHC</span>
                            <p className="traceability-modal-value" style={{ color: 'var(--color-success-text)', background: 'var(--color-success-light)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-success-border)', fontWeight: 'var(--font-weight-medium)', margin: 'var(--space-1) 0' }}>
                                {selectedFinding.recommendation}
                            </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                            <button 
                                onClick={() => setSelectedFinding(null)} 
                                className="btn btn-secondary"
                                style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-xs)' }}
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
