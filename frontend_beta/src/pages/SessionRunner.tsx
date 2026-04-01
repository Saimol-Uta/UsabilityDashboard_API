import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testSessionsApi, moderatorScriptsApi, testTasksApi, observationLogsApi, participantsApi } from '../api'
import { useToast } from '../App'
import {
    ArrowLeft, Play, BookOpen, MessageSquareText, CheckCircle2, XCircle,
    Clock, AlertTriangle, ChevronRight, Save, X, HelpCircle, Mic,
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

                setPhase(scriptRes.data ? 'opening' : 'testing')
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
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-500 mt-4">Cargando sesión de prueba...</p>
                </div>
            </div>
        )
    }

    // ──────────── OPENING PHASE ────────────
    if (phase === 'opening' && script) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-rise">
                {/* Exit button */}
                <button onClick={() => setShowExitConfirm(true)} className="btn btn-secondary self-start text-[12px]">
                    <ArrowLeft size={14} /> Salir de la Sesión
                </button>

                {/* Hero card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-semibold backdrop-blur-sm">
                                <Mic size={14} className="text-blue-300" />
                                Modo Guía de Sesión
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-3">Apertura de la Sesión</h1>
                        <p className="text-blue-100/80 text-sm mb-6">Lee en voz alta la siguiente introducción al participante antes de comenzar las tareas.</p>

                        <div className="flex flex-wrap gap-3 text-[12px]">
                            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
                                👤 {participant?.name || 'Participante'}
                            </span>
                            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
                                🖥️ {session?.platformTested}
                            </span>
                            <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
                                📋 {tasks.length} tareas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Introduction text */}
                <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                            <BookOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-bold text-slate-900">Texto de Introducción</h3>
                            <p className="text-[11px] text-slate-500">Léelo completo al participante</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="text-[16px] md:text-[18px] leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                            {script.introduction}
                        </div>
                    </div>
                </div>

                {/* Start button */}
                <div className="flex justify-center pt-2 pb-4">
                    <button
                        onClick={handleStartTest}
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[16px] px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        <Play size={22} className="group-hover:scale-110 transition-transform" />
                        Comenzar Prueba
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Exit confirmation */}
                {showExitConfirm && (
                    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowExitConfirm(false) }} role="dialog" aria-modal="true">
                        <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-[16px] font-semibold text-slate-900">¿Salir de la sesión?</h3>
                                <button onClick={() => setShowExitConfirm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <p className="text-[14px] text-slate-600">Se perderá el progreso de esta sesión. ¿Deseas salir?</p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowExitConfirm(false)} className="btn btn-secondary">Cancelar</button>
                                    <button onClick={() => navigate('/sesiones')} className="btn btn-danger px-4">Salir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ──────────── TESTING PHASE ────────────
    if (phase === 'testing') {
        const currentTask = tasks[activeTaskIndex]
        const currentObs = observations[activeTaskIndex]

        return (
            <div className="flex flex-col gap-4 animate-rise">
                {/* Top bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowExitConfirm(true)} className="btn btn-secondary text-[11px] py-1.5 px-3">
                            <ArrowLeft size={14} /> Salir
                        </button>
                        <div>
                            <h2 className="text-[18px] font-bold text-slate-900">Sesión en Curso</h2>
                            <p className="text-[12px] text-slate-500">
                                {participant?.name} · {session?.platformTested}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold">
                            <CheckCircle2 size={14} />
                            {completedCount}/{tasks.length} tareas
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-bold font-mono">
                            <Timer size={14} />
                            {formatTime(timerSeconds)}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        {tasks.map((t: any, i: number) => (
                            <button
                                key={t.id}
                                onClick={() => !observations[i].submitted && setActiveTaskIndex(i)}
                                className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${observations[i].submitted
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                    : i === activeTaskIndex
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse'
                                        : 'bg-slate-200'
                                    }`}
                                title={`T${t.taskNumber}: ${observations[i].submitted ? 'Completada' : i === activeTaskIndex ? 'Actual' : 'Pendiente'}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Tarea {activeTaskIndex + 1} de {tasks.length}</span>
                        <span>{completedCount} completadas</span>
                    </div>
                </div>

                {/* Main layout: Script sidebar + Task panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Script sidebar */}
                    {script && (
                        <div className="lg:col-span-4 xl:col-span-3">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden sticky top-4">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareText size={16} className="text-amber-600" />
                                        <h3 className="text-[14px] font-bold text-slate-900">Guía del Moderador</h3>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-100">
                                    {([
                                        { key: 'intro', label: 'Intro', icon: BookOpen },
                                        { key: 'questions', label: 'Preguntas', icon: HelpCircle },
                                        { key: 'closing', label: 'Cierre', icon: ClipboardCheck },
                                    ] as { key: 'intro' | 'questions' | 'closing'; label: string; icon: typeof BookOpen }[]).map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setScriptTab(tab.key)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all border-b-2 ${scriptTab === tab.key
                                                ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <tab.icon size={12} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab content */}
                                <div className="p-4 max-h-[60vh] overflow-y-auto soft-scrollbar">
                                    {scriptTab === 'intro' && (
                                        <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                                            {script.introduction}
                                        </div>
                                    )}
                                    {scriptTab === 'questions' && (
                                        <div>
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                                                <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                                                    <HelpCircle size={12} />
                                                    Usa estas preguntas si el participante se queda en silencio
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                {script.followUpQuestions.split(/[?\n]/).filter((q: string) => q.trim()).map((q: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                                        <span className="text-[11px] font-bold text-blue-500 mt-0.5">{i + 1}.</span>
                                                        <span className="text-[12px] text-slate-700 leading-snug">{q.trim()}?</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {scriptTab === 'closing' && (
                                        <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                                            {script.closingInstructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Task observation panel */}
                    <div className={script ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
                        {currentTask && currentObs && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                                {/* Task header */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 flex items-center justify-center text-[16px] font-bold text-blue-700 shadow-md flex-shrink-0">
                                            T{currentTask.taskNumber}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[16px] font-bold text-slate-900">{currentTask.scenario}</h3>
                                            {currentTask.expectedResult && (
                                                <p className="text-[12px] text-slate-500 mt-1">
                                                    <strong>Resultado esperado:</strong> {currentTask.expectedResult}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                    <Clock size={10} /> Máx: {currentTask.maxTimeSeconds}s
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                    📊 {currentTask.mainMetric}
                                                </span>
                                            </div>
                                        </div>
                                        {currentObs.submitted && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                                <CheckCircle2 size={12} /> Registrada
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Observation form */}
                                {!currentObs.submitted ? (
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                                <label className="form-label">Tiempo (seg) <span className="text-red-500">*</span></label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={currentObs.timeSeconds || ''}
                                                        onChange={e => updateObservation(activeTaskIndex, 'timeSeconds', Number(e.target.value))}
                                                        className="form-input"
                                                        min={1}
                                                        placeholder={String(timerSeconds)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateObservation(activeTaskIndex, 'timeSeconds', timerSeconds)}
                                                        className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-2 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap font-medium"
                                                        title="Usar tiempo del cronómetro"
                                                    >
                                                        ⏱ Usar
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="form-label">Errores <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    value={currentObs.errorCount}
                                                    onChange={e => updateObservation(activeTaskIndex, 'errorCount', Number(e.target.value))}
                                                    className="form-input"
                                                    min={0}
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
                                                {(!currentObs.taskSuccess || currentObs.errorCount > 0) && <span className="text-red-500"> *</span>}
                                            </label>
                                            <textarea
                                                value={currentObs.detectedProblem}
                                                onChange={e => updateObservation(activeTaskIndex, 'detectedProblem', e.target.value)}
                                                className={`form-input ${(!currentObs.taskSuccess || currentObs.errorCount > 0) && !currentObs.detectedProblem.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
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

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="text-[12px] text-slate-400">
                                                {activeTaskIndex > 0 && (
                                                    <button
                                                        onClick={() => setActiveTaskIndex(activeTaskIndex - 1)}
                                                        className="text-slate-500 hover:text-slate-700 font-medium"
                                                    >
                                                        ← Tarea anterior
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleSubmitTask(activeTaskIndex)}
                                                className="btn btn-primary text-[14px] px-6 py-2.5"
                                            >
                                                {activeTaskIndex < tasks.length - 1 ? (
                                                    <>Registrar y Siguiente <ArrowRight size={16} /></>
                                                ) : (
                                                    <>Registrar Última Tarea <CheckCircle2 size={16} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                                        <h4 className="text-[16px] font-bold text-slate-900">Tarea registrada</h4>
                                        <p className="text-[13px] text-slate-500 mt-1">
                                            {currentObs.taskSuccess ? '✓ Completada exitosamente' : '✗ No completada'} · {currentObs.timeSeconds}s · {currentObs.errorCount} errores
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Task list */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {tasks.map((t: any, i: number) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTaskIndex(i)}
                                    className={`p-3 rounded-xl border text-center transition-all duration-200 ${i === activeTaskIndex
                                        ? 'border-blue-400 bg-blue-50 shadow-md scale-105'
                                        : observations[i].submitted
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="text-[14px] font-bold">T{t.taskNumber}</div>
                                    <div className="text-[10px] mt-0.5">
                                        {observations[i].submitted ? '✓ Hecha' : i === activeTaskIndex ? '● Actual' : '○ Pendiente'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Exit confirmation */}
                {showExitConfirm && (
                    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowExitConfirm(false) }} role="dialog" aria-modal="true">
                        <div className="modal-content max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-[16px] font-semibold text-slate-900">¿Salir de la sesión?</h3>
                                <button onClick={() => setShowExitConfirm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-[13px] text-amber-800">
                                        Se perderán las observaciones no guardadas ({completedCount} de {tasks.length} tareas registradas).
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowExitConfirm(false)} className="btn btn-secondary">Continuar</button>
                                    <button onClick={() => navigate('/sesiones')} className="btn btn-danger px-4">Salir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ──────────── CLOSING PHASE ────────────
    if (phase === 'closing') {
        return (
            <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-rise">
                {/* Hero */}
                <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-semibold backdrop-blur-sm">
                                <Sparkles size={14} className="text-emerald-300" />
                                Cierre de Sesión
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-3">¡Prueba Completada!</h1>
                        <p className="text-emerald-100/80 text-sm">
                            Se registraron {completedCount} de {tasks.length} tareas. Lee las instrucciones de cierre al participante.
                        </p>
                    </div>
                </div>

                {/* Closing instructions */}
                {script?.closingInstructions && (
                    <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                <ClipboardCheck size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-slate-900">Instrucciones de Cierre</h3>
                                <p className="text-[11px] text-slate-500">Léelas al participante</p>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="text-[16px] md:text-[18px] leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                                {script.closingInstructions}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-[15px] font-bold text-slate-900">Resumen de Observaciones</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {tasks.map((t: any, i: number) => {
                            const obs = observations[i]
                            return (
                                <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border ${obs.submitted ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-700">
                                        T{t.taskNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-slate-800 truncate font-medium">{t.scenario}</p>
                                    </div>
                                    {obs.submitted ? (
                                        <div className="flex items-center gap-3 text-[11px]">
                                            {obs.taskSuccess
                                                ? <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Éxito</span>
                                                : <span className="text-red-600 font-bold flex items-center gap-1"><XCircle size={12} /> Fallo</span>
                                            }
                                            <span className="text-slate-500 font-mono">{obs.timeSeconds}s</span>
                                            <span className="text-slate-500">{obs.errorCount} err</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-slate-400 italic">No registrada</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-center pt-2 pb-6">
                    <button
                        onClick={handleSaveAndClose}
                        disabled={saving}
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[16px] px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Save size={22} />
                        {saving ? 'Guardando...' : 'Guardar y Cerrar Sesión'}
                    </button>
                </div>
            </div>
        )
    }

    // ──────────── SAVED PHASE ────────────
    if (phase === 'saved') {
        return (
            <div className="flex items-center justify-center py-20 animate-rise">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mb-4">
                        <CheckCircle2 size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-[22px] font-bold text-slate-900 mb-2">Sesión Guardada</h2>
                    <p className="text-[14px] text-slate-500">Redirigiendo al listado de sesiones...</p>
                </div>
            </div>
        )
    }

    return null
}
