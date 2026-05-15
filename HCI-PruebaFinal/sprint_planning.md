# Sprint Planning — Usability Test Dashboard 2.0

**Sprint:** Sprint 1 — Mejora UX del Dashboard  
**Duración:** 2 horas (sesión de examen)  
**Fecha:** 2026-05-15  
**Equipo:** Saimol Jiménez (individual)

---

## Sprint Goal

> Mejorar la experiencia de usuario del Usability Test Dashboard 2.0 corrigiendo los problemas heurísticos críticos identificados, implementando navegación contextual (breadcrumbs), indicadores de progreso (stepper + barra global), validaciones inline en formularios y acciones rápidas en el Dashboard.

---

## Sprint Backlog

| ID | Tarea | User Story | Estimación | Prioridad |
|----|-------|-----------|------------|-----------|
| T-01 | Realizar evaluación heurística del sistema actual | — | 15 min | Alta |
| T-02 | Documentar Product Backlog y Sprint Planning | — | 10 min | Alta |
| T-03 | Crear wireframes Lo-Fi, Mid-Fi, Hi-Fi del Dashboard | US-01, US-04, US-05 | 15 min | Alta |
| T-04 | Implementar breadcrumbs dinámicos en Layout.tsx | US-02 | 15 min | Alta |
| T-05 | Implementar stepper de progreso de fases en Dashboard | US-01 | 20 min | Alta |
| T-06 | Implementar validaciones inline en formulario de TestPlans | US-03 | 15 min | Alta |
| T-07 | Implementar quick actions y barra de progreso global | US-04, US-05 | 15 min | Alta |
| T-08 | Agregar estilos CSS para nuevos componentes | US-01–US-05 | 10 min | Alta |
| T-09 | Documentar evidencia IA | — | 10 min | Media |
| T-10 | Commits organizados en GitHub | — | 5 min | Alta |

**Total estimado:** ~130 minutos

---

## Ceremonia: Sprint Planning Meeting

### Capacidad del equipo
- 1 desarrollador × 2 horas = 120 minutos disponibles
- Buffer de contingencia: 10 minutos

### Velocidad esperada
- 8 tareas funcionales + 2 de documentación
- Complejidad media-alta (modificación de 4 archivos core + 5 documentos nuevos)

### Riesgos identificados
| Riesgo | Mitigación |
|--------|-----------|
| API backend caída | Implementar cambios frontend-only, no dependientes de API |
| Conflictos de merge | Trabajar en branch dedicada `Saimol_Jimenez_PruebaHCI_Usability_Test_Dashboard_2.0` |
| Tiempo insuficiente | Priorizar Must Have, dejar Could Have como mejora futura |

---

## Definition of Done (DoD)

- [ ] Código compila sin errores (`npm run build`)
- [ ] Cambios visibles en `http://localhost:5000`
- [ ] Commit realizado con mensaje descriptivo
- [ ] Documentación actualizada
- [ ] No se introducen regresiones en funcionalidad existente

---

## Evidencia Scrum

### Roles asignados
- **Product Owner:** Saimol Jiménez (define prioridades)
- **Scrum Master:** Saimol Jiménez (facilita el proceso)
- **Development Team:** Saimol Jiménez (implementa)

### Artefactos generados
1. ✅ Product Backlog (`product_backlog.md`)
2. ✅ Sprint Planning (`sprint_planning.md`)
3. 📋 Sprint Backlog (tabla anterior)
4. 📋 Definition of Done (checklist anterior)

### Eventos realizados
1. ✅ Sprint Planning (este documento)
2. 📋 Daily Scrum (no aplica — sprint de 2 horas)
3. 📋 Sprint Review (revisión final del producto)
4. 📋 Sprint Retrospective (reflexión post-implementación)
