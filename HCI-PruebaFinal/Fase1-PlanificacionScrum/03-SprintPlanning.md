# Sprint Planning - Usability Test Dashboard 2.0

## Información General
- **Proyecto:** Usability Test Dashboard 2.0
- **Metodología:** Scrum
- **Duración de Sprint:** 2 semanas (10 días hábiles)
- **Capacidad de Equipo:** 40 story points / sprint
- **Equipo Estimado:** 2 personas (1 Frontend, 1 Backend)

---

## Visión del Sprint
Cada sprint deberá entregar valor tangible mejorando la usabilidad del sistema, priorizando autenticación, dashboard, formularios, navegación y reportes a través de mejoras iterativas.

---

## SPRINT 1 (2 semanas) - Autenticación y Dashboard Base
**Objetivo:** Establecer cimientos con autenticación segura y dashboard reorganizado

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-001 | Autenticación Segura y Clara | 5 | Frontend | Planned |
| US-002 | Panel de Control Principal Reorganizado | 8 | Frontend/Backend | Planned |
| US-003 | Indicador de Sesión y Perfil | 3 | Frontend | Planned |
| **SUBTOTAL** | | **16 pts** | | |

### Entregables
- Login mejorado con validación y mensajes claros
- Dashboard con KPIs claros above the fold
- Indicador de usuario logueado y logout funcional

### Detalle Diario

**Semana 1**
- Lunes: Kickoff, definición de scope, creación de rama `feature/sprint1-auth-dashboard`
- Martes: Construcción del formulario de login y validación inline
- Miércoles: Endpoint de autenticación y manejo de errores backend
- Jueves: Layout del dashboard y tarjetas de KPI
- Viernes: Integración backend/frontend y pruebas iniciales

**Semana 2**
- Lunes: Implementación del menú de usuario y logout
- Martes: Ajustes de accesibilidad y responsive
- Miércoles: Code review y refactor de componentes
- Jueves: Pruebas de integración y preparación de demo
- Viernes: Sprint Review y Sprint Retrospective

---

## SPRINT 2 (2 semanas) - Formularios y Navegación
**Objetivo:** Estandarizar la captura de datos y mejorar la arquitectura de información

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-004 | Formulario de Creación de Plan de Prueba | 5 | Frontend | Planned |
| US-005 | Registro de Hallazgos Simplificado | 6 | Frontend/Backend | Planned |
| US-006 | Formulario de Datos de Observación | 4 | Frontend | Planned |
| US-007 | Arquitectura de Información Mejorada | 8 | Frontend/UX | Planned |
| **SUBTOTAL** | | **23 pts** | | |

### Entregables
- Formularios con validación dinámica y agrupación lógica
- Navegación renovada con menú simplificado y breadcrumbs
- Búsqueda global inicializada y flujo de usuario claro

### Detalle Diario

**Semana 1**
- Lunes: Análisis de arquitectura de información y wireframes
- Martes: Implementación de menú y breadcrumbs
- Miércoles: Desarrollo del formulario de test plan
- Jueves: Desarrollo de registro de hallazgos rápido
- Viernes: Pruebas de flujo de formularios y ajustes

**Semana 2**
- Lunes: Desarrollo de formulario de observación
- Martes: Integración de búsqueda global y estructura de rutas
- Miércoles: Revisión UX y pruebas de usabilidad
- Jueves: Corrección de bugs y documentación técnica
- Viernes: Sprint Review y Retrospective

---

## SPRINT 3 (2 semanas) - Reportes y Accesibilidad
**Objetivo:** Añadir análisis avanzado y garantizar accesibilidad

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-008 | Generación de Reportes Interactivos | 8 | Frontend/Backend | Planned |
| US-009 | Métricas por Sesión de Prueba | 5 | Backend | Planned |
| US-010 | Accesibilidad WCAG AA Completa | 5 | QA/Frontend | Planned |
| **SUBTOTAL** | | **18 pts** | | |

### Entregables
- Reportes interactivos con filtros y exportación
- Métricas de sesión detalladas y comparativas
- Auditoría de accesibilidad y correcciones WCAG

### Detalle Diario

**Semana 1**
- Lunes: Planificación de reportes y selección de librería de gráficos
- Martes: Desarrollo de endpoint de reportes y filtros
- Miércoles: Implementación de gráficas e interfaz
- Jueves: Exportación a PDF/Excel y pruebas
- Viernes: Primer ciclo de pruebas de accesibilidad

**Semana 2**
- Lunes: Ajustes de métricas por sesión y detalles visuales
- Martes: Corrección de accesibilidad y navegación con teclado
- Miércoles: Revisión de performance y pruebas cross-browser
- Jueves: Preparación de demo final y documentación
- Viernes: Sprint Review, Retrospective y release planning

---

## Definition of Done
Cada historia debe cumplir:

- [ ] Código funcional y validado
- [ ] Pruebas unitarias o integración implementadas
- [ ] Code review aprobado
- [ ] UI responsive y accesible
- [ ] Documentación actualizada
- [ ] Integrado en rama `develop`
- [ ] Demostrable en Sprint Review
