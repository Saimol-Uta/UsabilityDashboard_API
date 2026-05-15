# Sprint Planning - Usability Test Dashboard 2.0

## Información General
- **Proyecto:** Usability Test Dashboard 2.0
- **Metodología:** Scrum
- **Duración de Sprint:** 2 semanas (10 días hábiles)
- **Capacidad de Equipo:** 40 story points / sprint
- **Equipo Estimado:** 2 personas (1 Frontend, 1 Backend)

---

## SPRINT 1 (2 semanas) - Autenticación y Dashboard Base
**Objetivo:** Establecer cimientos con autenticación segura y dashboard reorganizado

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-001 | Autenticación Segura y Clara | 5 | Frontend | Planned |
| US-002 | Panel de Control Principal | 8 | Frontend/Backend | Planned |
| US-003 | Indicador de Sesión | 3 | Frontend | Planned |
| **SUBTOTAL SPRINT 1** | | **16 pts** | | |

### Detalles de Ejecución

#### Semana 1

**Lunes - Kickoff y Setup**
- [ ] Refinement final de user stories
- [ ] Setup de rama de feature: `feature/sprint1-auth-dashboard`
- [ ] Configurar componentes base en frontend_beta
- [ ] Revisar DTOs necesarios en Application/

**Martes - Autenticación (Frente)**
- [ ] Crear componente Login.tsx
- [ ] Validación en tiempo real (email, contraseña)
- [ ] Integración con API de autenticación
- [ ] Estilos responsive

**Miércoles - Autenticación (Back)**
- [ ] Endpoint POST /auth/login
- [ ] Validaciones en CreateUserValidator (crear si no existe)
- [ ] Response: { token, user, expiresIn }
- [ ] Manejo de errores

**Jueves - Dashboard Layout**
- [ ] Estructura HTML del dashboard
- [ ] Componentes: StatCard, KPI Cards
- [ ] Grid/Layout responsive
- [ ] Integración de datos dummy

**Viernes - Dashboard Datos y Pruebas**
- [ ] Conectar a DashboardService backend
- [ ] Endpoint GET /dashboard/stats
- [ ] Manejo de loading/error
- [ ] Tests unitarios
- [ ] Merge a develop

#### Semana 2

**Lunes - UserMenu**
- [ ] Componente UserMenu en header
- [ ] Dropdown funcional
- [ ] Integración token management
- [ ] Logout limpia estado

**Martes - Refinamiento y Pruebas**
- [ ] Testing WCAG inicial
- [ ] Ajustes responsivos
- [ ] Code review

**Miércoles - Demo y Retrospectiva**
- [ ] Demo Sprint 1 con stakeholders
- [ ] Recolectar feedback
- [ ] Retrospectiva del equipo

**Jueves-Viernes - Reserva**
- [ ] Buffer para ajustes
- [ ] Documentación

---

## SPRINT 2 (2 semanas) - Formularios y Navegación
**Objetivo:** Estandarizar entrada de datos y mejorar arquitectura de información

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-004 | Formulario Creación Plan Prueba | 5 | Frontend | Planned |
| US-005 | Registro de Hallazgos Rápido | 6 | Frontend/Backend | Planned |
| US-006 | Formulario Datos Observación | 4 | Frontend | Planned |
| US-007 | Arquitectura de Información | 8 | UX Lead | Planned |
| **SUBTOTAL SPRINT 2** | | **23 pts** | | |

---

## SPRINT 3 (2 semanas) - Reportes y Refinamiento Final
**Objetivo:** Capacidades avanzadas de análisis y garantizar accesibilidad

### Historias Incluidas

| ID | Título | Story Points | Asignado | Estado |
|---|---|---|---|---|
| US-008 | Generación Reportes Interactivos | 8 | Frontend/Backend | Planned |
| US-009 | Métricas por Sesión | 5 | Backend | Planned |
| US-010 | Accesibilidad WCAG AA | 5 | QA/Frontend | Planned |
| **SUBTOTAL SPRINT 3** | | **18 pts** | | |

---

## Definición de "Listo" (Definition of Done)

Cada historia debe cumplir:

- [ ] Código escrito y funcional
- [ ] Pruebas unitarias escritas (80%+ cobertura)
- [ ] Code review aprobado
- [ ] Funcional en development (sin console errors)
- [ ] Validaciones accesibilidad (WCAG AA básico)
- [ ] Documentación actualizada (DTOs, endpoints)
- [ ] Responsive en mobile/tablet
- [ ] Integrado en rama develop
- [ ] Demostrable en Sprint Review
