# Priorización de Tareas - Matriz MoSCoW

## Metodología MoSCoW
- **MUST (Debe tener):** Crítico para el MVP
- **SHOULD (Debería tener):** Importante pero no bloqueante
- **COULD (Podría tener):** Agregado si hay tiempo
- **WON'T (No tendrá):** Fuera de scope actual

---

## MUST HAVE - Crítico para MVP

| # | Tarea | Sprint | Story Points |
|---|-------|--------|--------------|
| 1 | Autenticación segura | 1 | 5 |
| 2 | Dashboard reorganizado | 1 | 8 |
| 3 | Registro de hallazgos rápido | 2 | 6 |
| 4 | Menú simplificado + breadcrumbs | 2 | 8 |

**Razonamiento:** Son los elementos que habilitan la funcionalidad básica del dashboard y reducen los principales puntos de fricción.

---

## SHOULD HAVE - Muy importante

| # | Tarea | Sprint | Story Points |
|---|-------|--------|--------------|
| 5 | Formularios con validación | 2 | 5 |
| 6 | Formulario de observación | 2 | 4 |
| 7 | Reportes interactivos | 3 | 8 |
| 8 | Métricas por sesión | 3 | 5 |

**Razonamiento:** Aumentan el valor de usuario, mejoran la productividad y permiten análisis más profundos.

---

## COULD HAVE - Deseable

| # | Tarea | Sprint | Story Points |
|---|-------|--------|--------------|
| 9 | Auto-guardado de drafts | 2 | 3 |
| 10 | Search global avanzada | 3 | 4 |
| 11 | Notificaciones rápidas | Future | 3 |
| 12 | Dark mode | Future | 2 |

**Razonamiento:** Son mejoras valiosas pero no imprescindibles para el lanzamiento inicial.

---

## WON'T HAVE - Fuera de Scope

| # | Tarea | Motivo |
|---|-------|--------|
| 13 | Mobile App nativa | Alta complejidad para el tiempo disponible |
| 14 | Integración SAP/ERP | Fuera de scope académico |
| 15 | Sincronización offline | Requiere arquitectura adicional |
| 16 | Multiidioma completo | No necesario para MVP actual |

---

## Matriz de Priorización 2x2

```
              IMPACTO
               ALTO
              ┌───────────────┐
        MUST  │ Auth          │ SHOULD
               │ Dashboard     │ Reportes
               │ Navegación    │ Métricas
              ├───────────────┤
        COULD │ Drafts        │ Notificaciones
               │ Dark mode     │ Búsqueda avanzada
              └───────────────┘
               BAJO
```

---

## Roadmap de Versiones

### Release 1.0 MVP
- Autenticación segura
- Dashboard reorganizado
- Registro de hallazgos
- Navegación simplificada
- Formularios básicos con validación

### Release 1.1
- Reportes interactivos
- Métricas por sesión
- Búsqueda global mejorada
- Mejoras de accesibilidad

### Release 2.0
- Notificaciones en tiempo real
- Dark mode
- Analytics avanzados
- Integraciones externas

---

## Criterios para Cambios de Scope
1. ¿La tarea es MUST, SHOULD, COULD o WON'T?
2. ¿Cuál es el impacto en la entrega del MVP?
3. ¿Hay dependencia con otro item crítico?
4. Decidir si replanificar o postergar al siguiente sprint.

---

## Resumen de Priorización

- **MUST HAVE:** 27 pts (40% de la capacidad total)
- **SHOULD HAVE:** 22 pts (32% de la capacidad total)
- **COULD HAVE:** 12 pts (18% de la capacidad total)
- **WON'T HAVE:** 0 pts en MVP
