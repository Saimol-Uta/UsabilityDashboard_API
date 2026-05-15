# Evidencia de Uso de IA — Prueba Práctica HCI

**Estudiante:** Saimol Jiménez

**Fecha:** 2026-05-15

**Herramienta IA:** Gemini

---

## 1. Resumen de Uso

La IA fue utilizada como herramienta de apoyo en la generación de artefactos (código, wireframes, documentación), siempre bajo las indicaciones y criterio del desarrollador, quien definió cada decisión de diseño UX antes de formular cualquier prompt.

---

## 2. Prompts Utilizados y Resultados

### Prompt 1: Planificación del proyecto

**Prompt utilizado:**
> "Tengo un proyecto Usability Test Dashboard con frontend React+TypeScript y backend .NET. Tiene 11 páginas y 5 componentes principales. Necesito estructurar el plan de implementación en 6 fases: evaluación heurística, wireframes, implementación de mejoras UX, validaciones, navegación y documentación Scrum. Organiza el plan siguiendo ese orden."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Plan de implementación estructurado en 6 fases con tareas específicas por etapa, incluyendo criterios de aceptación y orden de prioridad.

**Cómo ayudó en el diseño UX:** Permitió tener una hoja de ruta clara antes de comenzar, asegurando que las mejoras UX se abordaran de forma sistemática. La estructura de fases fue definida previamente por el desarrollador; la IA solo la organizó en el formato solicitado.

---

### Prompt 2: Evaluación heurística del sistema

**Prompt utilizado:**
> "Revisé el código de Layout.tsx, Dashboard.tsx, TestPlans.tsx, Participants.tsx, Findings.tsx, App.tsx e index.css. Identifiqué estos problemas de usabilidad según las heurísticas de Nielsen: [lista de problemas detectados]. Clasifícalos por severidad (crítico, moderado, leve) y dales formato de tabla con ID, heurística afectada, descripción y severidad."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Tabla de evaluación heurística con 12 problemas clasificados: 3 críticos (H1, H3, H5), 6 moderados (H2, H4, H6, H8, H9, H10) y 3 leves (H1, H4, H7).

**Cómo ayudó en el diseño UX:** La identificación de problemas fue realizada por el desarrollador mediante revisión directa del código. La IA apoyó en dar formato estructurado y consistente a los hallazgos, facilitando su presentación y priorización posterior.

---

### Prompt 3: Wireframes del Dashboard rediseñado

**Prompts utilizados:**

*Lo-Fi:*
> "Genera un wireframe Lo-Fi (blanco y negro, estilo sketch) para un dashboard de usabilidad. El layout que definí es: header superior, sidebar izquierdo con 3 fases, contenido principal con stepper, hero banner, tarjetas KPI, sección de Quick Actions y barra de progreso global."

*Mid-Fi:*
> "Genera un wireframe Mid-Fi (escala de grises, digital) del mismo dashboard. El stepper debe tener 3 pasos, hero banner oscuro, grid de tarjetas KPI, sección 'Acciones Rápidas' y barra de progreso global."

*Hi-Fi:*
> "Genera un mockup Hi-Fi (color completo, diseño moderno) del dashboard. Header con gradiente oscuro, sidebar con efecto glassmorphism, stepper con círculos de gradiente de color, tarjetas KPI coloridas, tarjetas de acciones rápidas y barra de progreso segmentada."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** 3 wireframes progresivos — Lo-Fi, Mid-Fi y Hi-Fi — reflejando la arquitectura visual definida por el desarrollador.

**Cómo ayudó en el diseño UX:** El desarrollador definió el layout, los componentes y la jerarquía visual antes de cada prompt. La IA permitió iterar rápidamente entre fidelidades sin cambiar de herramienta, manteniendo el flujo de trabajo ágil.

---

### Prompt 4: Implementación del stepper de fases

**Prompt utilizado:**
> "Crea el componente PhaseStepper en React. Debe integrarse con el PlanContext existente que ya tiene sectionDone, canAccessPhase2 y canAccessPhase3. Los 3 pasos son: Preparación, Ejecución, Análisis. Estados visuales: completado=verde, activo=azul con animación pulse, bloqueado=gris. Incluir contador de sub-secciones por fase y barra de progreso global. CSS con micro-animación stepper-pulse."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Componente `PhaseStepper` funcional con los 3 estados visuales, contador de sub-secciones, barra de progreso integrada y animación CSS.

**Cómo ayudó en el diseño UX:** El desarrollador diseñó previamente la lógica de estados y los requerimientos visuales. La IA generó el código según esas especificaciones, acelerando la implementación sin alterar la arquitectura existente.

---

### Prompt 5: Quick Actions (acciones rápidas)

**Prompt utilizado:**
> "Crea el componente QuickActions en React. Debe analizar las secciones pendientes del PlanContext y mostrar las 3 próximas acciones sugeridas. Condiciones: excluir acciones de fases bloqueadas (canAccessPhase2, canAccessPhase3), cada tarjeta debe navegar directamente a la sección correspondiente usando react-router."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Componente `QuickActions` que filtra secciones pendientes, excluye fases bloqueadas y genera tarjetas de navegación directa.

**Cómo ayudó en el diseño UX:** El desarrollador identificó los problemas heurísticos P-08 (falta de onboarding) y P-10 (falta de accesos directos) y diseñó la solución antes de formular el prompt. La IA implementó el componente siguiendo esa lógica ya definida.

---

### Prompt 6: Validaciones inline en formularios

**Prompt utilizado:**
> "Agrega validaciones inline a TestPlans.tsx. Requerimientos: estado touched para rastrear campos visitados, validación onBlur en tiempo real, clases CSS field-error (borde rojo + mensaje debajo) y field-success (borde verde), validación de coherencia entre fecha inicio y fecha fin, spinner animado en el botón de guardado mientras procesa."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Sistema de validación inline completo con estados `touched`, clases dinámicas, mensajes de error por campo, validación de fechas y feedback visual en el botón.

**Cómo ayudó en el diseño UX:** El desarrollador eligió el enfoque inline sobre toasts efímeros para resolver P-03 y P-09, manteniendo el contexto visual del error. La IA implementó el código siguiendo ese criterio de diseño ya establecido.

---

### Prompt 7: Breadcrumbs dinámicos

**Prompt utilizado:**
> "Reemplaza el breadcrumb estático de Layout.tsx por uno dinámico de 3 niveles: Inicio > Fase N — Nombre > Sección actual. Cada nivel debe ser un enlace navegable. Usar markup semántico nav con aria-label='breadcrumb'. Eliminar la redundancia actual de Dashboard > Dashboard."

**Herramienta IA usada:** Gemini

**Resultado obtenido:** Componente de breadcrumb dinámico con 3 niveles navegables, markup semántico accesible y eliminación de la redundancia previa.

**Cómo ayudó en el diseño UX:** El desarrollador detectó el problema de navegación y diseñó la estructura de 3 niveles coherente con la arquitectura de información del sistema. La IA implementó el componente según esa especificación.

---

## 3. Reflexión sobre el Uso de IA en el Diseño UX

### Ventajas observadas

1. **Velocidad de implementación:** Una vez definida la solución por el desarrollador, la IA redujo el tiempo de escritura de código y documentación.
2. **Consistencia de artefactos:** El código generado respetó los patrones del sistema existente al recibir el contexto adecuado en cada prompt.
3. **Iteración de wireframes:** Permitió avanzar de Lo-Fi a Hi-Fi sin cambiar de herramienta, manteniendo el flujo de diseño continuo.
4. **Formato de documentación:** Facilitó la presentación estructurada de hallazgos ya identificados por el desarrollador.

### Limitaciones reconocidas

1. **Sin visión de la app en ejecución:** La IA no puede observar la experiencia real del usuario; depende completamente de las descripciones del desarrollador.
2. **Sin criterio de priorización propio:** La IA no determina qué problemas son más críticos; esa decisión la tomó el desarrollador con base en el análisis heurístico.
3. **Sin validación con usuarios reales:** La IA no reemplaza las pruebas de usabilidad ni la observación directa del comportamiento.

### Conclusión

En cada etapa el flujo fue: el desarrollador analiza → identifica el problema → define la solución → formula el prompt → revisa y valida el resultado. La IA funcionó como una herramienta de ejecución rápida, pero el criterio de diseño UX, la identificación de problemas heurísticos y las decisiones de arquitectura fueron responsabilidad directa del desarrollador.