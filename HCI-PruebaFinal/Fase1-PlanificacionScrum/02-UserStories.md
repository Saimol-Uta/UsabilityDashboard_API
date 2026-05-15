# User Stories - Usability Test Dashboard 2.0

## Formato de User Story
```
Como [QUIÉN]
Deseo [QUÉ]
Para que [POR QUÉ]

Criterios de Aceptación:
[ ] Criterio 1
[ ] Criterio 2
[ ] Criterio 3

Notas Técnicas:
- DTOs involucrados
- Componentes afectados
- Dependencias
```

---

## SPRINT 1 - Autenticación y Dashboard Base

### US-001: Autenticación Segura y Clara
**Prioridad:** P0 (Critical)  
**Story Points:** 5  
**Personaje:** Nuevo Moderador

Como nuevo moderador del sistema  
Deseo tener un proceso de login intuitivo y seguro  
Para acceder rápidamente a la plataforma sin confusiones

**Criterios de Aceptación:**
- [ ] Pantalla de login muestra claramente campos de email/contraseña
- [ ] Validación en tiempo real indica requisitos de contraseña
- [ ] Mensajes de error son específicos (ej: "Email no registrado" vs "Contraseña incorrecta")
- [ ] Hay opción visible de "Olvidé mi contraseña"
- [ ] El formulario es responsivo en mobile
- [ ] Se indica sesión activa actual
- [ ] Accesibilidad WCAG AA (labels, contraste, navegación por teclado)

**Notas Técnicas:**
- DTOs: Usuario/Credenciales (crear si no existe)
- Endpoints: POST /auth/login, POST /auth/forgot-password
- Frontend: Componente Login.tsx con validación reactiva
- Considerar 2FA en futuro

---

### US-002: Panel de Control Principal Reorganizado
**Prioridad:** P0 (Critical)  
**Story Points:** 8  
**Personaje:** Coordinador de Usabilidad

Como coordinador de usabilidad  
Deseo ver en el dashboard todos los KPIs relevantes sin scrollear excesivamente  
Para tomar decisiones rápidas en la sesión de prueba

**Criterios de Aceptación:**
- [ ] Dashboard muestra arriba: Tests activos, Sesiones en curso, Hallazgos nuevos
- [ ] Segunda sección: Métricas por participante (ParticipantDto)
- [ ] Tercera sección: Acciones recomendadas (bottlenecks identificados)
- [ ] Cada KPI tiene mini-gráfico de tendencia
- [ ] Colores indican: Verde (OK), Amarillo (Atención), Rojo (Crítico)
- [ ] Botones de acción rápida destacados (Crear Test, Registrar Hallazgo)
- [ ] Información carga en < 2 segundos
- [ ] Responsive en tablets

**Notas Técnicas:**
- DTOs: DashboardStatsDto, TestSessionDto, FindingDto
- Endpoint: GET /dashboard/stats (optimizado)
- Componentes: StatCard.tsx, TrendChart.tsx, QuickActions.tsx
- Caching recomendado

---

### US-003: Indicador de Sesión y Perfil
**Prioridad:** P1 (High)  
**Story Points:** 3  
**Personaje:** Cualquier usuario

Como usuario autenticado  
Deseo ver claramente quién está logueado y poder cerrar sesión fácilmente  
Para mantener control sobre mi acceso y privacidad

**Criterios de Aceptación:**
- [ ] Esquina superior derecha muestra nombre usuario
- [ ] Avatar o inicial identificativa
- [ ] Dropdown con: Ver perfil, Cerrar sesión
- [ ] Cerrar sesión limpia todos los datos locales
- [ ] Indicador visual si sesión está por expirar
- [ ] Responsive y accesible

**Notas Técnicas:**
- Componente: UserMenu.tsx
- localStorage y sessionStorage cleanup
- Token refresh management

---

## SPRINT 2 - Formularios y Navegación

### US-004: Formulario de Creación de Plan de Prueba
**Prioridad:** P1 (High)  
**Story Points:** 5  
**Personaje:** Diseñador de Pruebas

Como diseñador de pruebas  
Deseo crear un plan de prueba con validaciones claras y ayuda contextual  
Para evitar errores y completar la configuración rápidamente

**Criterios de Aceptación:**
- [ ] Campos agrupados lógicamente: Básico, Participantes, Tareas
- [ ] Labels claros y placeholders descriptivos
- [ ] Validación en tiempo real sin bloquear
- [ ] Ayuda emergente (tooltips) en campos complejos
- [ ] Botón Guardar claramente destacado
- [ ] Mensaje de confirmación de éxito/error
- [ ] Cancelar sin perder datos (draft guardado)
- [ ] DTOs: TestPlanDto con validación backend

**Criterios de Aceptación Técnicos:**
- [ ] Usa CreateTestPlanValidator
- [ ] Endpoint: POST /api/testplans con validaciones claras
- [ ] Respuesta de error estructura: { field, message, code }

**Notas Técnicas:**
- Componente: CreateTestPlanForm.tsx
- UseForm hook con validación reactiva (React Hook Form)
- DTOs involucrados: TestPlanDto, TestTaskDto

---

### US-005: Registro de Hallazgos Simplificado
**Prioridad:** P0 (Critical)  
**Story Points:** 6  
**Personaje:** Moderador en Sesión

Como moderador durante una sesión  
Deseo registrar hallazgos rápidamente sin navegación compleja  
Para no perder observaciones críticas en tiempo real

**Criterios de Aceptación:**
- [ ] Formulario accesible en < 3 clics desde dashboard
- [ ] Campos: Descripción, Severidad, Participante afectado, Categoría
- [ ] Severidad tiene presets visuales: Crítico (Rojo), Mayor (Naranja), Menor (Amarillo)
- [ ] Autocompletado para participantes registrados
- [ ] Validación de contenido mínimo (descripción > 10 caracteres)
- [ ] Botón guardar grande y accesible
- [ ] Confirmación visual al guardar
- [ ] Opción de "Continuar añadiendo" para múltiples

**Notas Técnicas:**
- DTOs: FindingDto con PriorityLevel enum
- Componente: QuickFindingForm.tsx
- Validador: CreateFindingValidator
- Endpoint: POST /api/findings con serialización de PriorityLevel

---

### US-006: Formulario de Datos de Observación
**Prioridad:** P1 (High)  
**Story Points:** 4  
**Personaje:** Observador

Como observador en la prueba  
Deseo capturar datos de observación estructurados  
Para llevar registro detallado de comportamientos y comentarios

**Criterios de Aceptación:**
- [ ] Interfaz con campos predefinidos (tiempo, acción, resultado)
- [ ] Opción de notas libres
- [ ] Validación: no permita guardar vacío
- [ ] Mostrar historial de observaciones previas
- [ ] Exportar observaciones de la sesión
- [ ] DTOs: ObservationLogDto

**Notas Técnicas:**
- Componente: ObservationForm.tsx
- Validador: CreateObservationLogValidator
- Considerar timestamps automáticos

---

### US-007: Arquitectura de Información Mejorada
**Prioridad:** P0 (Critical)  
**Story Points:** 8  
**Personaje:** Nuevo Usuario

Como nuevo usuario  
Deseo encontrar fácilmente lo que busco sin confusión de menús  
Para ser productivo desde mi primer día

**Criterios de Aceptación:**
- [ ] Menú principal tiene máximo 5 items principales
- [ ] Submenú contextual no excede 8 opciones
- [ ] Breadcrumb visible en todas las páginas
- [ ] Búsqueda global en header (tests, participantes, hallazgos)
- [ ] Landing page/Home organiza accesos por rol
- [ ] Información jerarquizada por importancia
- [ ] Patrón de navegación consistente
- [ ] Modelo mental coherente (ej: Test > Sesión > Tarea > Observación)

**Notas Técnicas:**
- Información Architecture review
- Mapeo de flujos de usuario por rol
- Componente: Navigation.tsx, Breadcrumb.tsx, GlobalSearch.tsx
- Estructura: /tests, /sessions, /findings, /reports, /participants

---

## SPRINT 3 - Reportes y Refinamiento

### US-008: Generación de Reportes Interactivos
**Prioridad:** P2 (Medium-High)  
**Story Points:** 8  
**Personaje:** Director de Proyecto

Como director de proyecto  
Deseo generar reportes visualmente claros con datos filtrados  
Para presentar resultados a stakeholders

**Criterios de Aceptación:**
- [ ] Filtros por: Fecha, Severidad, Participante, Estado
- [ ] Gráficos: Distribución de hallazgos, Timeline, Heatmap de tareas
- [ ] Exportar a PDF con branding
- [ ] Exportar a Excel para análisis adicional
- [ ] Compartir reporte (link con expiración)
- [ ] Responsive en tablet para presentaciones
- [ ] Carga en < 5 segundos

**Notas Técnicas:**
- DTOs: FindingDto, TestSessionDto, ObservationLogDto
- Librería: Chart.js o D3.js para visualizaciones
- Backend: GET /api/reports con filtros
- Generación PDF: html2pdf o similar

---

### US-009: Métricas por Sesión de Prueba
**Prioridad:** P1 (High)  
**Story Points:** 5  
**Personaje:** Analista UX

Como analista UX  
Deseo ver métricas detalladas de cada sesión (tiempo, completitud, hallazgos)  
Para evaluar calidad de la prueba

**Criterios de Aceptación:**
- [ ] Card de sesión muestra: Duración, # Participantes, # Hallazgos, Tasa Éxito
- [ ] Mini gráficos inline
- [ ] Click abre dashboard detallado de sesión
- [ ] Comparativa con sesiones previas
- [ ] DTOs: TestSessionDto con métricas calculadas

**Notas Técnicas:**
- Backend calcula métricas (stored en DTO o computed)
- Componente: SessionMetricsCard.tsx, SessionDetailDashboard.tsx

---

### US-010: Accesibilidad WCAG AA Completa
**Prioridad:** P1 (High)  
**Story Points:** 5  
**Personaje:** Usuario con limitaciones visuales

Como usuario con visión limitada  
Deseo navegar y usar el dashboard con lector de pantalla  
Para tener acceso equitativo a la herramienta

**Criterios de Aceptación:**
- [ ] Todos los inputs tienen labels asociados
- [ ] Navegación por teclado funcional (Tab, Enter, Escape)
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Botones con aria-label descriptivos
- [ ] Formularios anunciados por secciones
- [ ] Auditoría con axe DevTools: 0 errores
- [ ] Testeado con NVDA/JAWS

**Notas Técnicas:**
- HTML semántico (button, form, fieldset)
- ARIA labels donde sea necesario
- Focus management en modales
- Skip links

---

