# Evidencia de Uso de IA — Prueba Práctica HCI

**Estudiante:** Saimol Jiménez  
**Fecha:** 2026-05-15  
**Herramienta IA:** Gemini (Antigravity — Claude Opus 4.6 Thinking)

---

## 1. Resumen de Uso

La inteligencia artificial fue utilizada como **asistente de diseño UX y desarrollo**, apoyando en las siguientes áreas:

| Área | Contribución IA |
|------|----------------|
| Evaluación heurística | Identificación sistemática de 12 problemas UX usando las 10 heurísticas de Nielsen |
| Wireframing | Generación de wireframes Lo-Fi, Mid-Fi y Hi-Fi del Dashboard rediseñado |
| Implementación | Código para breadcrumbs, stepper, validaciones inline y quick actions |
| Documentación | Estructura Scrum (Product Backlog, Sprint Planning) |

---

## 2. Prompts Utilizados y Resultados

### Prompt 1: Análisis del proyecto y planificación

**Prompt:**
> "5to Software Ing. Jose Caiza — PRUEBA PRÁCTICA FINAL — HCI / UX — Usability Test Dashboard 2.0 [... contexto completo del examen con las 6 fases requeridas ...]"

**Resultado:** La IA analizó la estructura completa del proyecto (frontend React+TypeScript, backend .NET, 11 páginas, 5 componentes), identificó el stack tecnológico y generó un plan de implementación detallado cubriendo las 6 fases del examen.

**Cómo ayudó al diseño UX:** Permitió tener una visión holística del sistema antes de comenzar, identificando las áreas más críticas para la mejora UX.

---

### Prompt 2: Evaluación heurística del sistema

**Contexto:** La IA revisó el código fuente de `Layout.tsx`, `Dashboard.tsx`, `TestPlans.tsx`, `Participants.tsx`, `Findings.tsx`, `App.tsx` e `index.css` para identificar problemas de UX.

**Resultado:** Se generó la evaluación heurística con 12 problemas clasificados:
- 3 críticos (H1, H3, H5)
- 6 moderados (H2, H4, H6, H8, H9, H10)
- 3 leves (H1, H4, H7)

**Cómo ayudó al diseño UX:** La IA pudo analizar simultáneamente múltiples archivos de código y cruzar la lógica del sistema (redirecciones, validaciones, estados) con las heurísticas de Nielsen, algo que tomaría significativamente más tiempo de forma manual.

---

### Prompt 3: Generación de wireframes

**Prompts usados:**

Lo-Fi:
> "Lo-Fi wireframe sketch (black and white, hand-drawn style) for a usability dashboard web application. Layout shows: top header, left sidebar with 3 phases, main content with stepper, hero banner, KPI cards, Quick Actions, progress bar."

Mid-Fi:
> "Mid-Fi wireframe (grayscale, digital wireframe) for a usability dashboard. Shows stepper with 3 steps, dark hero banner, grid of KPI cards, 'Acciones Rápidas' section, global progress bar."

Hi-Fi:
> "Hi-Fi polished mockup (full color, modern design) for a usability dashboard. Dark gradient header, glassmorphism sidebar, 3-step stepper with gradient circles, colorful KPI cards, quick action cards, segmented progress bar."

**Resultado:** 3 wireframes generados progresivamente, desde un sketch básico hasta un mockup completo con el diseño final.

**Cómo ayudó al diseño UX:** Permitió iterar rápidamente sobre el diseño del Dashboard sin necesidad de herramientas externas como Figma, manteniendo el flujo de trabajo dentro del mismo entorno.

---

### Prompt 4: Implementación del stepper de fases

**Contexto:** La IA recibió el contexto del `PlanContext` (que ya tenía `sectionDone`, `canAccessPhase2`, `canAccessPhase3`) y el Dashboard existente.

**Resultado:** Componente `PhaseStepper` con:
- 3 pasos visuales (Preparación, Ejecución, Análisis)
- Estados: completado (verde), activo (azul pulsante), bloqueado (gris)
- Contador de sub-secciones por fase
- Barra de progreso global integrada
- CSS con micro-animaciones (`stepper-pulse`)

**Cómo ayudó al diseño UX:** La IA integró automáticamente los datos del `PlanContext` existente, evitando duplicación de lógica y asegurando consistencia con el sidebar.

---

### Prompt 5: Quick Actions (acciones rápidas)

**Resultado:** Componente `QuickActions` que:
- Analiza las secciones pendientes
- Muestra las 3 próximas acciones sugeridas
- Excluye automáticamente acciones de fases bloqueadas
- Cada tarjeta navega directamente a la sección correspondiente

**Cómo ayudó al diseño UX:** La IA diseñó el componente como una guía contextual que resuelve el problema heurístico P-08 (falta de onboarding) y P-10 (falta de accesos directos).

---

### Prompt 6: Validaciones inline en formularios

**Resultado:** Sistema de validación en `TestPlans.tsx` con:
- Estado `touched` para rastrear campos visitados
- Validación en tiempo real al perder foco (`onBlur`)
- Clases CSS dinámicas: `field-error` (rojo) y `field-success` (verde)
- Mensajes de error debajo del campo específico
- Validación de coherencia de fechas en tiempo real
- Spinner animado en el botón de guardado

**Cómo ayudó al diseño UX:** Resolvió los problemas heurísticos P-03 (fechas incoherentes) y P-09 (toasts efímeros) con una solución inline que mantiene el contexto visual del error.

---

### Prompt 7: Breadcrumbs dinámicos

**Resultado:** Reemplazo del breadcrumb estático (`Dashboard > Sección`) por uno dinámico de 3 niveles:
- `Inicio > Fase N — Nombre > Sección actual`
- Cada nivel es un enlace navegable
- Markup semántico con `<nav aria-label="breadcrumb">`
- Eliminación de la redundancia "Dashboard > Dashboard"

**Cómo ayudó al diseño UX:** La IA analizó la estructura de rutas y fases del sidebar para generar breadcrumbs que reflejen exactamente la arquitectura de información del sistema.

---

## 3. Reflexión sobre el Uso de IA en Diseño UX

### Ventajas observadas
1. **Velocidad de análisis:** La IA puede revisar miles de líneas de código y cruzar múltiples heurísticas en segundos.
2. **Consistencia:** Genera código que se integra con el sistema existente sin romper patrones previos.
3. **Iteración rápida:** Permite probar múltiples enfoques de diseño (wireframes Lo-Fi → Hi-Fi) sin cambiar de herramienta.
4. **Documentación:** Genera documentación estructurada (Scrum, evaluación heurística) con formato profesional.

### Limitaciones reconocidas
1. **Contexto visual:** La IA no puede "ver" la app corriendo, depende del código fuente para inferir la experiencia.
2. **Creatividad limitada:** Los wireframes generados siguen patrones comunes de la industria, no producen diseños radicalmente innovadores.
3. **Validación de usuario:** La IA no reemplaza las pruebas con usuarios reales ni la observación directa del comportamiento.

### Conclusión
La IA funcionó como un **multiplicador de productividad** para el diseño UX, permitiendo completar en 2 horas un trabajo que normalmente requeriría 6-8 horas. Sin embargo, el criterio humano fue esencial para seleccionar la pantalla crítica, priorizar las mejoras y validar que las soluciones propuestas fueran coherentes con los principios HCI estudiados en la asignatura.
