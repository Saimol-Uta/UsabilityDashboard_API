# Hallazgos Heurísticos - Navegación

## Hallazgo H25: Menú Desorganizado (CRÍTICO)

**Principio Nielsen:** #2 Coincidencia sistema-usuario

**Problema:**
- 8+ items sin agrupación lógica
- Nuevo usuario no sabe por dónde empezar
- Tareas tardan 2x más de lo que deberían

**Solución:**
```
MENÚ REORGANIZADO (máximo 5 items):

📋 TESTS Y SESIONES
├─ Mis Tests
├─ Sesiones Activas
└─ [+ Crear Test]

🔍 HALLAZGOS
├─ Todos
├─ Por Severidad
└─ [+ Registrar]

👥 PARTICIPANTES
├─ Listado
└─ [+ Agregar]

📊 ANÁLISIS
├─ Reportes
└─ Exportar

⚙️ CONFIGURACIÓN
├─ Usuarios
└─ Ajustes
```

**Prioridad:** MUST (Sprint 2)
**Severidad:** 4/4

---

## Hallazgo H26: Sin Breadcrumbs (MAYOR)

**Principio Nielsen:** #1 Visibilidad del estado

**Problema:**
- Usuario no sabe dónde está en la estructura
- Volver requiere múltiples clicks atrás

**Solución:**
- Breadcrumb visible: Tests / Mi Test / Sesión 3 / Participante 5
- Click en cada parte vuelve a ese nivel

**Prioridad:** MUST (Sprint 2)
**Severidad:** 3/4

---

## Hallazgo H27: Sin Búsqueda Global (MAYOR)

**Principio Nielsen:** #6 Flexibilidad y eficiencia

**Problema:**
- Para encontrar "Test A", usuario debe navegar menú
- Sin forma rápida de buscar

**Solución:**
- Barra de búsqueda en header
- Hotkey: Ctrl+K (Cmd+K en Mac)
- Resultados en tiempo real
- Categorías: Tests, Sesiones, Hallazgos, Participantes

**Prioridad:** SHOULD (Sprint 2)
**Severidad:** 3/4
