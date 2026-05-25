import { useEffect, useState } from 'react'
import { sprintBacklogApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import { extractErrorMessage } from '../hooks/useApiError'
import { 
  Sparkles, Save, FileText, Printer, Plus, Trash2, 
  AlertCircle, Key, Cpu, CheckSquare, Layers, 
  Hourglass, ClipboardList, CheckCircle2,
  HelpCircle
} from 'lucide-react'

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
}

interface BacklogData {
  sprintName: string
  sprintGoal: string
  userStories: UserStory[]
}

const API_KEY_STORAGE_KEY = 'gemini_user_api_key'

export default function SprintBacklog() {
  const { activePlanId, activePlan, isReadOnly, refreshGates } = usePlan()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [backlogData, setBacklogData] = useState<BacklogData | null>(null)
  
  // API Key management
  const [userApiKey, setUserApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSetupPanel, setShowSetupPanel] = useState(true)

  // Load active plan backlog and stored API key
  useEffect(() => {
    // Load API Key from localStorage
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (savedKey) {
      setUserApiKey(savedKey)
    }

    if (activePlanId) {
      loadBacklog(activePlanId)
    } else {
      setLoading(false)
    }
  }, [activePlanId])

  const loadBacklog = async (planId: string) => {
    setLoading(true)
    try {
      const res = await sprintBacklogApi.getByPlan(planId)
      if (res.data && res.data.contentJson) {
        try {
          const parsed = JSON.parse(res.data.contentJson) as BacklogData
          setBacklogData(parsed)
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

  const handleSaveApiKey = () => {
    const trimmed = userApiKey.trim()
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmed)
      addToast('API Key de Gemini guardada de forma segura en este navegador', 'success')
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      addToast('API Key eliminada del almacenamiento local', 'success')
    }
  }

  const handleGenerate = async (useAI: boolean) => {
    if (!activePlanId) {
      addToast('Debes seleccionar un plan de prueba activo', 'error')
      return
    }

    if (useAI && !userApiKey.trim()) {
      addToast('Por favor, ingresa una API Key de Gemini válida para usar la generación por IA', 'error')
      return
    }

    setIsGenerating(true)
    try {
      addToast(useAI ? 'Analizando datos y generando con IA (Gemini 2.5 Flash)...' : 'Generando backlog estructurado con el Motor Local...', 'success')
      
      const reqData = {
        testPlanId: activePlanId,
        userApiKey: useAI ? userApiKey.trim() : undefined
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
    try {
      const markdown = generateMarkdownContent(dataToSave)
      const contentJson = JSON.stringify(dataToSave)

      await sprintBacklogApi.save(activePlanId, {
        sprintName: dataToSave.sprintName,
        sprintGoal: dataToSave.sprintGoal,
        contentJson,
        rawMarkdown: markdown
      })
      
      addToast('Borrador del Sprint Backlog guardado en el servidor', 'success')
      refreshGates()
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-600 font-medium animate-pulse text-sm">Cargando borrador del Sprint Backlog...</p>
      </div>
    )
  }

  if (!activePlanId) {
    return (
      <div className="glass-panel p-8 text-center max-w-xl mx-auto my-12" role="alert">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Falta Plan de Pruebas Activo</h2>
        <p className="text-slate-500 text-sm mb-6">
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
    <div className="relative pb-16">
      
      {/* PRINT-ONLY VIEWPORT: Renders absolutely beautiful clean tables with academic headers for PDF */}
      <div className="hidden print:block print-preview font-serif text-slate-900 bg-white p-8">
        <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
          <p className="text-[11px] uppercase tracking-widest font-sans font-bold text-slate-600">
            Universidad - Ingeniería de Software
          </p>
          <p className="text-[10px] uppercase font-sans text-slate-500">
            Asignatura: Interacción Humano Computador (IHC) - Quinto Semestre
          </p>
          <h1 className="text-2xl font-bold mt-2 text-slate-900">
            Reporte de Sprint Backlog de Usabilidad
          </h1>
          <p className="text-[12px] italic text-slate-500 mt-1">
            Generado automáticamente asistido por IA - Caso: {activePlan?.projectName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <p><strong>Proyecto Evaluado:</strong> {activePlan?.projectName}</p>
            <p><strong>Producto:</strong> {activePlan?.product}</p>
            <p><strong>Módulo Evaluado:</strong> {activePlan?.evaluatedModule}</p>
          </div>
          <div className="text-right">
            <p><strong>Sprint:</strong> {backlogData?.sprintName}</p>
            <p><strong>Esfuerzo Total:</strong> {totalHours} horas estimadas</p>
            <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2">Meta del Sprint (Sprint Goal)</h2>
          <p className="text-sm italic text-slate-700 bg-slate-50 p-4 rounded-md border-l-4 border-indigo-500">
            "{backlogData?.sprintGoal}"
          </p>
        </div>

        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-4">Incremento y Planificación Ágil</h2>

        {backlogData?.userStories.map((us) => (
          <div key={us.id} className="mb-8 avoid-break">
            <h3 className="text-md font-bold text-slate-900 mb-1">
              📋 [{us.id}] {us.title} <span className="text-xs font-normal text-slate-500 font-sans">({us.priority === 'Alta' ? 'Prioridad Alta' : us.priority === 'Media' ? 'Prioridad Media' : 'Prioridad Baja'})</span>
            </h3>
            <p className="text-xs font-mono bg-slate-50 p-2 border rounded border-slate-200 mb-3 text-slate-700">
              {us.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mt-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider font-sans">Criterios de Aceptación</h4>
                <ul className="list-disc pl-4 text-xs space-y-1 text-slate-700">
                  {us.acceptanceCriteria.map((ac, idx) => (
                    <li key={idx}>{ac}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider font-sans">Tareas Técnicas</h4>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold">
                      <th className="py-1 w-16">ID</th>
                      <th className="py-1">Descripción</th>
                      <th className="py-1 text-right w-20">Esfuerzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {us.technicalTasks.map((task) => (
                      <tr key={task.id} className="border-b border-slate-100">
                        <td className="py-1 font-mono text-slate-600">{task.id}</td>
                        <td className="py-1 text-slate-700">{task.title}</td>
                        <td className="py-1 text-right text-slate-600">{task.estimatedHours} horas</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border-b border-dashed border-slate-200 mt-6 pb-2" />
          </div>
        ))}
      </div>

      {/* WEB VIEWPORT (Visible on screen, hidden on print) */}
      <div className="print:hidden space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-500 w-6 h-6 animate-pulse" />
              Generación de Sprint Backlog Asistido por IA
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Consolida la información de Plan, Guía, Sesiones y Hallazgos para generar un Backlog de Sprint accionable.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowSetupPanel(!showSetupPanel)}
              className={`btn text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                showSetupPanel 
                  ? 'bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <Cpu size={14} />
              Configurar Generador
            </button>
          </div>
        </div>

        {/* AI Key and Generation Panel */}
        {showSetupPanel && (
          <div className="glass-panel border-indigo-200 bg-gradient-to-br from-indigo-900/5 via-purple-900/5 to-slate-900/5 p-5 rounded-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={120} className="text-indigo-600" />
            </div>

            <h3 className="text-sm font-semibold text-indigo-950 flex items-center gap-2 mb-2">
              <Cpu className="text-indigo-500" size={16} />
              Motor de Planificación y Generación de Historias
            </h3>
            
            <p className="text-slate-600 text-xs mb-5 max-w-2xl leading-relaxed">
              El sistema procesará automáticamente toda la base de datos de tu plan actual (los hallazgos de usabilidad y acciones de mejora) para modelar historias de usuario ("Como/Quiero/Para") detalladas. Tienes dos maneras de generarlo:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Gemini AI */}
              <div className="bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-purple-600 animate-pulse" />
                    Opción A: Generación Inteligente (Gemini 2.5 Flash)
                  </h4>
                  <p className="text-slate-500 text-[11px] mb-4">
                    Utiliza LLM avanzado de Google para crear historias contextualizadas que combinan el guión de moderación, observaciones críticas y principios ergonómicos de IHC.
                  </p>

                  <div className="space-y-2 mb-4">
                    <label className="block text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                      <span>API Key Personal de Gemini</span>
                      <a 
                        href="https://aistudio.google.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        Obtener llave gratis <HelpCircle size={10} />
                      </a>
                    </label>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={userApiKey}
                          onChange={(e) => setUserApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          disabled={isReadOnly}
                        />
                        <Key className="absolute left-2.5 top-2 text-slate-400" size={13} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
                        title={showApiKey ? 'Ocultar llave' : 'Mostrar llave'}
                      >
                        {showApiKey ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
                        disabled={isReadOnly}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating || isReadOnly}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      Generando Backlog con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generar Backlog Inteligente
                    </>
                  )}
                </button>
              </div>

              {/* Option B: Local Heuristics */}
              <div className="bg-white/60 backdrop-blur-sm border border-slate-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Cpu size={13} className="text-slate-500" />
                    Opción B: Motor Heurístico Determinista (Local)
                  </h4>
                  <p className="text-slate-500 text-[11px] mb-4">
                    Funciona de forma instantánea 100% offline. Mapea directamente cada hallazgo registrado en una historia de usuario de corrección ergonómica, y asocia las acciones de mejora en tareas técnicas con esfuerzo estimado preestablecido.
                  </p>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[11px] text-slate-600 leading-relaxed mb-4 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Garantiza resultados ergonómicos e IHC válidos al estructurar el incremento del backlog basándose estrictamente en tu tabla de Hallazgos y Acciones de Mejora.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating || isReadOnly}
                  className="w-full py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-600"></div>
                      Ejecutando fallbacks...
                    </>
                  ) : (
                    <>
                      <Cpu size={14} />
                      Generar con Motor Local
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Backlog Editor Board */}
        {backlogData ? (
          <div className="space-y-6">
            
            {/* Sprint Info Card */}
            <div className="glass-panel p-5 rounded-2xl border-white/40 bg-white/70 backdrop-blur-md shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                <ClipboardList size={14} />
                Definición del Sprint de Usabilidad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Nombre del Sprint
                  </label>
                  <input
                    type="text"
                    value={backlogData.sprintName}
                    onChange={(e) => handleUpdateSprintField('sprintName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    placeholder="Sprint 1 - Optimización ergonómica"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Meta del Sprint (Sprint Goal)
                  </label>
                  <input
                    type="text"
                    value={backlogData.sprintGoal}
                    onChange={(e) => handleUpdateSprintField('sprintGoal', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    placeholder="Describe el objetivo y los fallos de usabilidad a resolver"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Stories Title */}
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                Historias de Usuario e Incremento ({backlogData.userStories.length})
              </h3>
              
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddStory}
                  className="btn-accent text-xs px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 font-semibold transition-all border border-indigo-200"
                >
                  <Plus size={14} />
                  Añadir Historia
                </button>
              )}
            </div>

            {/* Stories Loop */}
            <div className="space-y-6">
              {backlogData.userStories.map((story, storyIdx) => (
                <div 
                  key={story.id} 
                  className="glass-panel p-5 rounded-2xl border-white/40 bg-white/80 hover:bg-white/95 transition-all shadow-sm hover:shadow-md relative group border border-slate-200/50"
                >
                  
                  {/* Delete story button (Absolute right) */}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStory(storyIdx)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Eliminar Historia de Usuario"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  {/* Story Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs rounded-lg font-bold">
                      {story.id}
                    </span>
                    
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => handleUpdateStoryField(storyIdx, 'title', e.target.value)}
                        className="w-full text-sm font-semibold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent py-0.5"
                        placeholder="Título corto de la historia"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Prioridad:</label>
                      <select
                        value={story.priority}
                        onChange={(e) => handleUpdateStoryField(storyIdx, 'priority', e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          story.priority === 'Alta' 
                            ? 'text-rose-700 bg-rose-50 border-rose-200' 
                            : story.priority === 'Media'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}
                        disabled={isReadOnly}
                      >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                  </div>

                  {/* Story description body */}
                  <div className="space-y-1 mb-6">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Descripción (Como / Quiero / Para)
                    </label>
                    <textarea
                      value={story.description}
                      onChange={(e) => handleUpdateStoryField(storyIdx, 'description', e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed"
                      placeholder="Como [perfil], quiero [acción] para [beneficio]..."
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    
                    {/* Column 1: Acceptance Criteria */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare size={13} className="text-slate-400" />
                          Criterios de Aceptación
                        </h4>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleAddCriterion(storyIdx)}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                          >
                            <Plus size={10} /> Añadir
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {story.acceptanceCriteria.map((criterion, crtIdx) => (
                          <div key={crtIdx} className="flex gap-2 items-center group/item">
                            <span className="text-slate-400 font-mono text-[10px]">{crtIdx + 1}.</span>
                            <input
                              type="text"
                              value={criterion}
                              onChange={(e) => handleUpdateCriterion(storyIdx, crtIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Ej. El usuario no debe cometer errores en este campo."
                              disabled={isReadOnly}
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCriterion(storyIdx, crtIdx)}
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                                title="Eliminar criterio"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {story.acceptanceCriteria.length === 0 && (
                          <p className="text-slate-400 italic text-[11px] py-1">Sin criterios de aceptación declarados.</p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Technical Tasks and Estimates */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Hourglass size={13} className="text-slate-400" />
                          Tareas Técnicas y Horas
                        </h4>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleAddTask(storyIdx)}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                          >
                            <Plus size={10} /> Añadir
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {story.technicalTasks.map((task, taskIdx) => (
                          <div key={task.id} className="flex gap-2 items-center group/item">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded font-semibold flex-shrink-0">
                              {task.id}
                            </span>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTaskField(storyIdx, taskIdx, 'title', e.target.value)}
                              className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Ej. Rediseñar modal ergonómico"
                              disabled={isReadOnly}
                            />
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={task.estimatedHours}
                                onChange={(e) => handleUpdateTaskField(storyIdx, taskIdx, 'estimatedHours', parseInt(e.target.value) || 0)}
                                className="w-12 px-1 py-1 text-xs text-center rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                                disabled={isReadOnly}
                              />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">h</span>
                            </div>

                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(storyIdx, taskIdx)}
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                                title="Eliminar tarea"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {story.technicalTasks.length === 0 && (
                          <p className="text-slate-400 italic text-[11px] py-1">Sin tareas técnicas asociadas.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Big Save & Export Banner */}
            <div className="bg-slate-900 border border-slate-800 text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg mt-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-0.5">Sprint Resumen</p>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Backlog del Sprint: <span className="text-indigo-200">{backlogData.sprintName}</span>
                </h4>
                <p className="text-slate-400 text-xs mt-1">
                  Se estimaron <span className="font-semibold text-indigo-300 font-mono text-xs">{totalHours} horas</span> de esfuerzo técnico distribuidas en <span className="font-semibold text-indigo-300 font-mono text-xs">{backlogData.userStories.length} historias</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleSaveDraft()}
                    disabled={isSaving}
                    className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Guardando...
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
                  className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileText size={14} />
                  Exportar .md
                </button>

                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer size={14} />
                  Imprimir PDF
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-panel p-12 text-center max-w-xl mx-auto my-6 border-dashed border-slate-350">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-md font-bold text-slate-700 mb-1">Ningún borrador creado aún</h3>
            <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
              El plan "{activePlan?.projectName}" no cuenta con un backlog de sprint. Utiliza el panel superior para generar uno con la API Key de Gemini o el motor heurístico local.
            </p>
            
            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || isReadOnly}
              className="py-2 px-5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
            >
              {isGenerating ? 'Generando...' : 'Generación rápida (Motor Local)'}
            </button>
          </div>
        )}

      </div>
      
      {/* CUSTOM PRINT STYLING INJECTED VIA JSX */}
      <style>{`
        @media print {
          /* Hide sidebar, headers, configurations, backdrops and control panels */
          header, aside, main > div:first-child, .print\\:hidden, button, select, input[type="password"], input[type="text"]:not(.print-preview input), textarea:not(.print-preview textarea) {
            display: none !important;
          }
          
          /* Unset layout restraints for full-page standard printing */
          body, .min-h-screen, .flex, main, #main-content {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
          }

          .print-preview {
            display: block !important;
          }

          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          thead {
            display: table-header-group;
          }
          
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
