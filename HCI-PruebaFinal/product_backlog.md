# Product Backlog — Usability Test Dashboard 2.0

**Proyecto:** Usability Test Dashboard 2.0  
**Product Owner:** Saimol Jiménez  
**Fecha:** 2026-05-15  
**Asignatura:** Interacción Humano / Computador — 5to Semestre

---

## Priorización: Método MoSCoW

| ID | User Story | Prioridad | Criterios de Aceptación | Estado |
|----|-----------|-----------|------------------------|--------|
| US-01 | Como evaluador UX, quiero ver un **stepper de progreso por fases** en el Dashboard, para saber en qué punto del proceso me encuentro sin tener que revisar cada sección. | **Must Have** | - Muestra 3 fases: Preparación, Ejecución, Análisis<br>- Indica visualmente: completado ✓, en progreso ◉, bloqueado 🔒<br>- Se actualiza automáticamente al completar secciones | Pendiente |
| US-02 | Como evaluador UX, quiero **breadcrumbs dinámicos** que reflejen mi ubicación exacta en la jerarquía de navegación, para orientarme fácilmente. | **Must Have** | - Muestra: Inicio > Fase > Sección actual<br>- Cada segmento es un enlace clickeable<br>- Usa markup semántico `<nav aria-label="breadcrumb">` | Pendiente |
| US-03 | Como evaluador UX, quiero **validaciones inline** en los formularios del Plan de Prueba, para corregir errores antes de enviar. | **Must Have** | - Muestra borde rojo y mensaje bajo el campo inválido<br>- Valida fechas en tiempo real (fin > inicio)<br>- Indicador de campos completados (checkmark verde) | Pendiente |
| US-04 | Como evaluador UX, quiero ver **acciones rápidas** en el Dashboard que me guíen a las tareas pendientes, para no perder tiempo buscando qué hacer. | **Must Have** | - Tarjetas con la siguiente acción sugerida<br>- Enlaza directamente a la sección correspondiente<br>- Se oculta cuando la acción está completada | Pendiente |
| US-05 | Como evaluador UX, quiero una **barra de progreso global** que muestre el % de completitud del plan completo, para medir mi avance. | **Should Have** | - Porcentaje calculado sobre secciones completadas<br>- Diseño visual integrado al hero del Dashboard<br>- Actualización en tiempo real | Pendiente |
| US-06 | Como evaluador UX, quiero que los **mensajes de error** en formularios sean persistentes y señalen el campo específico, para identificar y corregir el problema. | **Should Have** | - El campo con error tiene borde rojo<br>- Mensaje descriptivo debajo del campo<br>- Desaparece al corregir el valor | Pendiente |
| US-07 | Como evaluador UX, quiero **feedback visual** al completar una fase (micro-animación), para sentir progreso y motivación. | **Could Have** | - Animación sutil al completar fase<br>- Stepper actualiza con transición suave<br>- Notificación de felicitación | Pendiente |
| US-08 | Como evaluador UX, quiero que los **estados** (Draft, InProgress, Completed) se muestren en español, para mantener consistencia idiomática. | **Could Have** | - Todos los badges muestran texto en español<br>- Consistencia en toda la interfaz | Pendiente |

---

## Épicas

### Épica 1: Mejora de Navegación y Orientación
- US-01 (Stepper de fases)
- US-02 (Breadcrumbs dinámicos)

### Épica 2: Prevención de Errores y Feedback
- US-03 (Validaciones inline)
- US-06 (Mensajes de error persistentes)

### Épica 3: Dashboard Inteligente
- US-04 (Acciones rápidas)
- US-05 (Progreso global)
- US-07 (Feedback emocional)

### Épica 4: Consistencia Visual
- US-08 (Internacionalización de estados)

---

## Notas de Priorización

1. **Must Have** (US-01 a US-04): Impactan directamente en los 3 problemas heurísticos críticos identificados (H1, H3, H5).
2. **Should Have** (US-05, US-06): Mejoran la experiencia pero el sistema funciona sin ellos.
3. **Could Have** (US-07, US-08): Detalles de pulido que aportan al diseño emocional y consistencia.
