import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testSessionsApi, moderatorScriptsApi, testTasksApi, observationLogsApi, participantsApi } from '../api'
import { useToast } from '../App'
import { usePlan } from '../context/PlanContext'
import Modal from '../components/Modal'
import {
    ArrowLeft, Play, BookOpen, MessageSquareText, CheckCircle2, XCircle,
    Clock, AlertTriangle, ChevronRight, Save, HelpCircle, Mic,
    ArrowRight, ClipboardCheck, Timer, Sparkles
} from 'lucide-react'

type SessionPhase = 'loading' | 'opening' | 'testing' | 'closing' | 'saved'

interface ObservationForm {
    testTaskId: string
    taskSuccess: boolean
    timeSeconds: number
    errorCount: number
    comments: string
    detectedProblem: string
    severity: string
    proposedImprovement: string
    submitted: boolean
}

export default function SessionRunner() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const navigate = useNavigate()
    const { addToast } = useToast()
    const { refreshGates } = usePlan()

    const [phase, setPhase] = useState<SessionPhase>('loading')
    const [session, setSession] = useState<any>(null)
    const [participant, setParticipant] = useState<any>(null)
    const [script, setScript] = useState<any>(null)
    const [tasks, setTasks] = useState<any[]>([])
    const [activeTaskIndex, setActiveTaskIndex] = useState(0)
    const [observations, setObservations] = useState<ObservationForm[]>([])
    const [saving, setSaving] = useState(false)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [scriptTab, setScriptTab] = useState<'intro' | 'questions' | 'closing'>('questions')

    // Timer state
    const [timerRunning, setTimerRunning] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Load all data
    useEffect(() => {
        if (!sessionId) return
        const load = async () => {
            try {
                const sessionRes = await testSessionsApi.get(sessionId)
                const sess = sessionRes.data
                setSession(sess)

                const [scriptRes, tasksRes, participantRes] = await Promise.all([
                    moderatorScriptsApi.getByPlan(sess.testPlanId).catch(() => ({ data: null })),
                    testTasksApi.getByPlan(sess.testPlanId),
                    participantsApi.get(sess.participantId),
                ])

                setScript(scriptRes.data)
                setParticipant(participantRes.data)

                const sortedTasks = (tasksRes.data ?? []).sort((a: any, b: any) => a.taskNumber - b.taskNumber)
                setTasks(sortedTasks)

                // Initialize observation forms
                setObservations(sortedTasks.map((t: any) => ({
                    testTaskId: t.id,
                    taskSuccess: true,
                    timeSeconds: 0,
                    errorCount: 0,
                    comments: '',
                    detectedProblem: '',
                    severity: 'Medium',
                    proposedImprovement: '',
                    submitted: false,
                })))

                if (scriptRes.data) {
                    setPhase('opening')
                } else {
                    setPhase('testing')
                    setTimerRunning(true) // Start timer if jumping directly to testing
                }
            } catch {
                addToast('Error al cargar la sesión', 'error')
                navigate('/sesiones')
            }
        }
        load()
    }, [sessionId])

    // Timer logic
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(s => s + 1)
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [timerRunning])

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const updateObservation = (index: number, field: string, value: any) => {
        setObservations(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o))
    }

    const handleStartTest = () => {
        setPhase('testing')
        setTimerRunning(true)
    }

    const handleSubmitTask = (index: number) => {
        const obs = observations[index]
        if (obs.timeSeconds <= 0) {
            // Auto-fill time from timer
            updateObservation(index, 'timeSeconds', timerSeconds)
        }
        if ((!obs.taskSuccess || obs.errorCount > 0) && !obs.detectedProblem.trim()) {
            addToast('El problema detectado es obligatorio cuando hay errores o la tarea falló', 'error')
            return
        }
        updateObservation(index, 'submitted', true)

        // Move to next task or closing
        if (index < tasks.length - 1) {
            setActiveTaskIndex(index + 1)
            setTimerSeconds(0)
        } else {
            // All tasks done
            setTimerRunning(false)
            setPhase('closing')
        }
        addToast(`Tarea T${tasks[index].taskNumber} registrada ✓`, 'success')
    }

    const handleSaveAndClose = async () => {
        setSaving(true)
        try {
            for (const obs of observations) {
                if (obs.submitted) {
                    await observationLogsApi.create({
                        testSessionId: sessionId,
                        testTaskId: obs.testTaskId,
                        taskSuccess: obs.taskSuccess,
                        timeSeconds: obs.timeSeconds > 0 ? obs.timeSeconds : 1,
                        errorCount: obs.errorCount,
                        comments: obs.comments,
                        detectedProblem: obs.detectedProblem,
                        severity: obs.severity,
                        proposedImprovement: obs.proposedImprovement,
                    })
                }
            }
            addToast('Sesión guardada correctamente', 'success')
            await refreshGates()
            setPhase('saved')
            setTimeout(() => navigate('/sesiones'), 1500)
        } catch {
            addToast('Error al guardar las observaciones', 'error')
        } finally {
            setSaving(false)
        }
    }

    const completedCount = observations.filter(o => o.submitted).length

    // ──────────── LOADING ────────────
    if (phase === 'loading') {
        return (
            <div className="dashboard-loader" style={{ padding: 'var(--space-20) 0' }}>
                <div className="dashboard-spinner" aria-label="Cargando..." />
                <p className="dashboard-loader-text">Cargando sesión de prueba...</p>
            </div>
        )
    }

    // ──────────── OPENING PHASE ────────────
    if (phase === 'opening' && script) {
        return (
            <div className="runner-page-narrow">
                {/* Exit button */}
                <button onClick={() => setShowExitConfirm(true)} className="btn btn-secondary">
                    <ArrowLeft size={14} aria-hidden="true" /> Salir de la Sesión
                </button>

                {/* Hero card */}
                <div className="runner-hero-card">
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <span className="runner-badge-pill">
                                <Mic size={14} style={{ color: 'var(--color-primary-300)' }} aria-hidden="true" />
                                Modo Guía de Sesión
                            </span>
                        </div>
                        <h1 className="runner-hero-title">Apertura de la Sesión</h1>
                        <p className="runner-hero-subtitle">Lee en voz alta la siguiente introducción al participante antes de comenzar las tareas.</p>

                        <div className="runner-meta-row">
                            <span className="runner-meta-pill">
                                👤 {participant?.name || 'Participante'}
                            </span>
                            <span className="runner-meta-pill">
                                🖥️ {session?.platformTested}
                            </span>
                            <span className="runner-meta-pill">
                                📋 {tasks.length} tareas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Introduction text */}
                <div className="runner-section-card">
                    <div className="runner-section-header">
                        <div className="runner-section-icon-box">
                            <BookOpen size={20} aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="runner-section-title">Texto de Introducción</h3>
                            <p className="runner-section-subtitle">Léelo completo al participante</p>
                        </div>
                    </div>
                    <div className="runner-section-body">
                        <div className="runner-script-text">
                            {script.introduction}
                        </div>
                    </div>
                </div>

                <div className="runner-button-container">
                    <button
                        onClick={handleStartTest}
                        className="btn btn-primary"
                        aria-label="Comenzar Prueba de Usabilidad"
                        style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-xl)', fontSize: 'var(--font-size-base)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}
                    >
                        <Play size={20} aria-hidden="true" />
                        Comenzar Prueba
                        <ChevronRight size={18} aria-hidden="true" />
                    </button>
                </div>

                <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="¿Salir de la sesión?" maxWidth="440px">
                    <div className="modal-body">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height)' }}>
                            Se perderá el progreso de esta sesión. ¿Deseas salir?
                        </p>
                        <div className="modal-footer">
                            <button onClick={() => setShowExitConfirm(false)} className="btn btn-secondary">Cancelar</button>
                            <button onClick={() => navigate('/sesiones')} className="btn btn-danger">Salir</button>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }

    // ──────────── TESTING PHASE ────────────
    if (phase === 'testing') {
        const currentTask = tasks[activeTaskIndex]
        const currentObs = observations[activeTaskIndex]

        return (
            <div className="page-container">
                {/* Top bar */}
                <div className="page-header">
                    <div className="runner-header-left">
                        <button onClick={() => setShowExitConfirm(true)} className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px', height: 'auto', minHeight: 'unset' }}>
                            <ArrowLeft size={14} aria-hidden="true" /> Salir
                        </button>
                        <div>
                            <h2 className="page-header-title" style={{ fontSize: 18 }}>Sesión en Curso</h2>
                            <p className="page-header-subtitle">
                                {participant?.name} · {session?.platformTested}
                            </p>
                        </div>
                    </div>
                    <div className="runner-header-right">
                        <span className="badge badge-completada" style={{ padding: '6px 12px', gap: 'var(--space-2)', borderRadius: 'var(--radius-full)' }}>
                            <CheckCircle2 size={14} aria-hidden="true" />
                            <span>{completedCount}/{tasks.length} tareas</span>
                        </span>
                        <span className="runner-timer-badge">
                            <Timer size={14} aria-hidden="true" />
                            <span>{formatTime(timerSeconds)}</span>
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="runner-progress-card">
                    <div className="runner-progress-steps-row">
                        {tasks.map((t: any, i: number) => (
                            <button
                                key={t.id}
                                onClick={() => !observations[i].submitted && setActiveTaskIndex(i)}
                                className={`runner-progress-step ${observations[i].submitted
                                    ? 'runner-progress-step--complete'
                                    : i === activeTaskIndex
                                        ? 'runner-progress-step--active'
                                        : 'runner-progress-step--pending'
                                    }`}
                                title={`T${t.taskNumber}: ${observations[i].submitted ? 'Completada' : i === activeTaskIndex ? 'Actual' : 'Pendiente'}`}
                                aria-label={`Tarea ${t.taskNumber}: ${observations[i].submitted ? 'Completada' : i === activeTaskIndex ? 'Actual' : 'Pendiente'}`}
                            />
                        ))}
                    </div>
                    <div className="runner-progress-labels">
                        <span>Tarea {activeTaskIndex + 1} de {tasks.length}</span>
                        <span>{completedCount} completadas</span>
                    </div>
                </div>

                {/* Main layout: Script sidebar + Task panel */}
                <div className="runner-main-grid">
                    {/* Script sidebar */}
                    {script && (
                        <div className="runner-sidebar-col">
                            <div className="runner-sidebar-card">
                                <div className="runner-sidebar-header">
                                    <div className="runner-sidebar-header-inner">
                                        <MessageSquareText size={16} aria-hidden="true" />
                                        <h3 className="runner-sidebar-title">Guía del Moderador</h3>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="runner-sidebar-tabs">
                                    {([
                                        { key: 'intro', label: 'Intro', icon: BookOpen },
                                        { key: 'questions', label: 'Preguntas', icon: HelpCircle },
                                        { key: 'closing', label: 'Cierre', icon: ClipboardCheck },
                                    ] as { key: 'intro' | 'questions' | 'closing'; label: string; icon: typeof BookOpen }[]).map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setScriptTab(tab.key)}
                                            className={`runner-sidebar-tab ${scriptTab === tab.key ? 'is-active' : ''}`}
                                            aria-selected={scriptTab === tab.key}
                                            role="tab"
                                        >
                                            <tab.icon size={12} aria-hidden="true" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab content */}
                                <div className="runner-sidebar-content soft-scrollbar">
                                    {scriptTab === 'intro' && (
                                        <div className="runner-script-text" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)' }}>
                                            {script.introduction}
                                        </div>
                                    )}
                                    {scriptTab === 'questions' && (
                                        <div>
                                            <div className="runner-questions-hint">
                                                <p className="runner-questions-hint-text">
                                                    <HelpCircle size={12} aria-hidden="true" />
                                                    Usa estas preguntas si el participante se queda en silencio
                                                </p>
                                            </div>
                                            <div className="runner-questions-list">
                                                {script.followUpQuestions.split(/[?\n]/).filter((q: string) => q.trim()).map((q: string, i: number) => (
                                                    <div key={i} className="runner-question-item">
                                                        <span className="runner-question-number">{i + 1}.</span>
                                                        <span className="runner-question-text">{q.trim()}?</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {scriptTab === 'closing' && (
                                        <div className="runner-script-text" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)' }}>
                                            {script.closingInstructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Task observation panel */}
                    <div className="runner-content-col" style={script ? undefined : { gridColumn: 'span 12' }}>
                        {currentTask && currentObs && (
                            <div className="runner-obs-card">
                                {/* Task header */}
                                <div className="runner-obs-header">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                                        <div className="runner-task-badge">
                                            T{currentTask.taskNumber}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className="runner-obs-title">{currentTask.scenario}</h3>
                                            {currentTask.expectedResult && (
                                                <p className="runner-obs-meta-row">
                                                    <strong>Resultado esperado:</strong> {currentTask.expectedResult}
                                                </p>
                                            )}
                                            <div className="runner-obs-badge-row">
                                                <span className="runner-obs-meta-badge">
                                                    <Clock size={10} aria-hidden="true" /> Máx: {currentTask.maxTimeSeconds}s
                                                </span>
                                                <span className="runner-obs-meta-badge">
                                                    📊 {currentTask.mainMetric}
                                                </span>
                                            </div>
                                        </div>
                                        {currentObs.submitted && (
                                            <span className="badge badge-completada">
                                                <CheckCircle2 size={12} aria-hidden="true" /> Registrada
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Observation form */}
                                {!currentObs.submitted ? (
                                    <div className="form-layout">
                                        <div className="form-grid-3">
                                            <div>
                                                <label className="form-label">¿Éxito?</label>
                                                <select
                                                    value={currentObs.taskSuccess ? 'true' : 'false'}
                                                    onChange={e => updateObservation(activeTaskIndex, 'taskSuccess', e.target.value === 'true')}
                                                    className="form-input"
                                                >
                                                    <option value="true">✓ Sí</option>
                                                    <option value="false">✗ No</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">Tiempo (seg) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <input
                                                        type="number"
                                                        value={currentObs.timeSeconds || ''}
                                                        onChange={e => updateObservation(activeTaskIndex, 'timeSeconds', Number(e.target.value))}
                                                        className="form-input"
                                                        min={1}
                                                        placeholder={String(timerSeconds)}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateObservation(activeTaskIndex, 'timeSeconds', timerSeconds)}
                                                        className="btn-use-timer"
                                                        title="Usar tiempo del cronómetro"
                                                    >
                                                        ⏱ Usar
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="form-label">Errores <span style={{ color: 'var(--color-error)' }}>*</span></label>
                                                <input
                                                    type="number"
                                                    value={currentObs.errorCount}
                                                    onChange={e => updateObservation(activeTaskIndex, 'errorCount', Number(e.target.value))}
                                                    className="form-input"
                                                    min={0}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label">Severidad</label>
                                            <select
                                                value={currentObs.severity}
                                                onChange={e => updateObservation(activeTaskIndex, 'severity', e.target.value)}
                                                className="form-input"
                                            >
                                                <option value="Critical">Crítica</option>
                                                <option value="High">Alta</option>
                                                <option value="Medium">Media</option>
                                                <option value="Low">Baja</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Problema detectado
                                                {(!currentObs.taskSuccess || currentObs.errorCount > 0) && <span style={{ color: 'var(--color-error)' }}> *</span>}
                                            </label>
                                            <textarea
                                                value={currentObs.detectedProblem}
                                                onChange={e => updateObservation(activeTaskIndex, 'detectedProblem', e.target.value)}
                                                className={`form-input ${(!currentObs.taskSuccess || currentObs.errorCount > 0) && !currentObs.detectedProblem.trim() ? 'field-error' : ''}`}
                                                rows={2}
                                                placeholder="Describe el problema observado"
                                                required={!currentObs.taskSuccess || currentObs.errorCount > 0}
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label">Mejora propuesta</label>
                                            <textarea
                                                value={currentObs.proposedImprovement}
                                                onChange={e => updateObservation(activeTaskIndex, 'proposedImprovement', e.target.value)}
                                                className="form-input"
                                                rows={2}
                                                placeholder="Sugerencia de mejora"
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label">Comentarios del moderador</label>
                                            <textarea
                                                value={currentObs.comments}
                                                onChange={e => updateObservation(activeTaskIndex, 'comments', e.target.value)}
                                                className="form-input"
                                                rows={2}
                                                placeholder="Notas adicionales..."
                                            />
                                        </div>

                                        <div className="runner-obs-footer">
                                            <div>
                                                {activeTaskIndex > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTaskIndex(activeTaskIndex - 1)}
                                                        className="btn-runner-prev"
                                                    >
                                                        ← Tarea anterior
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleSubmitTask(activeTaskIndex)}
                                                className="btn btn-primary"
                                                style={{ padding: '10px 24px' }}
                                            >
                                                {activeTaskIndex < tasks.length - 1 ? (
                                                    <>Registrar y Siguiente <ArrowRight size={16} aria-hidden="true" style={{ marginLeft: 6 }} /></>
                                                ) : (
                                                    <>Registrar Última Tarea <CheckCircle2 size={16} aria-hidden="true" style={{ marginLeft: 6 }} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="runner-task-complete-panel">
                                        <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto var(--space-3)' }} aria-hidden="true" />
                                        <h4 className="runner-task-complete-title">Tarea registrada</h4>
                                        <p className="runner-task-complete-desc">
                                            {currentObs.taskSuccess ? '✓ Completada exitosamente' : '✗ No completada'} · {currentObs.timeSeconds}s · {currentObs.errorCount} errores
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Task selector grid */}
                        <div className="runner-task-selector-grid">
                            {tasks.map((t: any, i: number) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTaskIndex(i)}
                                    className={`runner-task-selector-btn ${i === activeTaskIndex
                                        ? 'is-active'
                                        : observations[i].submitted
                                            ? 'is-complete'
                                            : ''
                                        }`}
                                >
                                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' }}>T{t.taskNumber}</div>
                                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
                                        {observations[i].submitted ? '✓ Hecha' : i === activeTaskIndex ? '● Actual' : '○ Pendiente'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="¿Salir de la sesión?" maxWidth="440px">
                    <div className="modal-body">
                        <div className="warning-banner">
                            <AlertTriangle size={20} className="flex-shrink-0" aria-hidden="true" />
                            <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height)' }}>
                                Se perderán las observaciones no guardadas.<br />
                                <strong>{completedCount} de {tasks.length}</strong> tareas estaban registradas.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowExitConfirm(false)} className="btn btn-secondary">Continuar</button>
                            <button onClick={() => navigate('/sesiones')} className="btn btn-danger">Salir de todas formas</button>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }

    // ──────────── CLOSING PHASE ────────────
    if (phase === 'closing') {
        return (
            <div className="runner-page-narrow">
                {/* Hero */}
                <div className="runner-hero-card runner-hero-card--emerald">
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <span className="runner-badge-pill">
                                <Sparkles size={14} style={{ color: 'var(--color-success-300)' }} aria-hidden="true" />
                                Cierre de Sesión
                            </span>
                        </div>
                        <h1 className="runner-hero-title">¡Prueba Completada!</h1>
                        <p className="runner-hero-subtitle">
                            Se registraron {completedCount} de {tasks.length} tareas. Lee las instrucciones de cierre al participante.
                        </p>
                    </div>
                </div>

                {/* Closing instructions */}
                {script?.closingInstructions && (
                    <div className="runner-section-card runner-section-card--emerald">
                        <div className="runner-section-header runner-section-header--emerald">
                            <div className="runner-section-icon-box runner-section-icon-box--emerald">
                                <ClipboardCheck size={20} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="runner-section-title">Instrucciones de Cierre</h3>
                                <p className="runner-section-subtitle">Léelas al participante</p>
                            </div>
                        </div>
                        <div className="runner-section-body">
                            <div className="runner-script-text">
                                {script.closingInstructions}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="runner-summary-card">
                    <div className="runner-summary-header">
                        <h3 className="runner-section-title" style={{ fontSize: 'var(--font-size-sm)' }}>Resumen de Observaciones</h3>
                    </div>
                    <div className="runner-summary-body">
                        {tasks.map((t: any, i: number) => {
                            const obs = observations[i]
                            return (
                                <div key={t.id} className={`runner-summary-item ${obs.submitted ? 'is-complete' : 'is-pending'}`}>
                                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-secondary)', flexShrink: 0 }}>
                                        T{t.taskNumber}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="runner-section-title" style={{ fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.scenario}</p>
                                    </div>
                                    {obs.submitted ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                                            {obs.taskSuccess
                                                ? <span style={{ color: 'var(--color-success-text)', fontWeight: 'var(--font-weight-bold)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Éxito</span>
                                                : <span style={{ color: 'var(--color-error-text)', fontWeight: 'var(--font-weight-bold)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> Fallo</span>
                                            }
                                            <span className="observations-mono-badge">{obs.timeSeconds}s</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{obs.errorCount} err</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-disabled)', fontStyle: 'italic' }}>No registrada</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Save button */}
                <div className="runner-button-container">
                    <button
                        onClick={handleSaveAndClose}
                        disabled={saving}
                        className="btn-runner-save"
                        aria-label="Guardar y Finalizar Sesión de Prueba"
                    >
                        <Save size={22} aria-hidden="true" />
                        {saving ? 'Guardando...' : 'Guardar y Cerrar Sesión'}
                    </button>
                </div>
            </div>
        )
    }

    // ──────────── SAVED PHASE ────────────
    if (phase === 'saved') {
        return (
            <div className="dashboard-loader" style={{ padding: 'var(--space-20) 0', animation: 'rise 0.4s ease-out' }}>
                <div className="runner-success-icon-box">
                    <CheckCircle2 size={40} style={{ color: 'var(--color-success)' }} aria-hidden="true" />
                </div>
                <h2 className="runner-section-title" style={{ fontSize: 22, textAlign: 'center', marginBottom: 8 }}>Sesión Guardada</h2>
                <p className="dashboard-loader-text" style={{ marginTop: 0 }}>Redirigiendo al listado de sesiones...</p>
            </div>
        )
    }

    return null
}
